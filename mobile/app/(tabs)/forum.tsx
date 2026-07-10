import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PublicTopicsResponse } from "@shared/types";
import { Card, EmptyState, PrimaryButton, Screen, Title } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";

export default function ForumScreen() {
  const { token, isAuthenticated } = useAuth();
  const colors = useThemeColors();
  const [items, setItems] = useState<PublicTopicsResponse["data"]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await apiFetch<PublicTopicsResponse>("/topics", { token });
        setItems(data.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o fórum.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <Screen>
      <Title
        title="Fórum"
        subtitle="Debates e tópicos públicos da comunidade."
      />

      {isAuthenticated ? (
        <PrimaryButton
          label="Novo tópico"
          onPress={() => router.push("/forum/novo" as never)}
        />
      ) : (
        <View style={styles.authHint}>
          <Text
            style={[styles.authHintText, { color: colors.contentSecondary }]}
          >
            Inicia sessão para criar tópicos e ver conteúdos privados.
          </Text>
          <PrimaryButton
            label="Iniciar sessão"
            onPress={() => router.push("/(auth)/login" as never)}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          style={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={colors.bordeaux}
            />
          }
          ListEmptyComponent={
            <EmptyState message="Ainda não há tópicos públicos." />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <Card onPress={() => router.push(`/forum/${item.id}` as never)}>
              <Text
                style={[styles.cardTitle, { color: colors.contentPrimary }]}
              >
                {item.title}
              </Text>
              {item.description ? (
                <Text
                  style={[styles.cardBody, { color: colors.contentSecondary }]}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              ) : null}
              <Text style={[styles.meta, { color: colors.contentTertiary }]}>
                {item.author?.name ?? "Autor"}
                {typeof item.replies_count === "number"
                  ? ` · ${item.replies_count} respostas`
                  : ""}
                {item.theme ? ` · ${item.theme}` : ""}
                {item.is_private ? " · Privado" : ""}
              </Text>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  authHint: {
    marginBottom: 8,
    gap: 10,
  },
  authHintText: {
    fontSize: 13,
    lineHeight: 18,
  },
  list: { marginTop: 16, flex: 1 },
  listContent: { paddingBottom: 32 },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    fontWeight: "600",
  },
  error: {
    marginTop: 16,
    fontSize: 14,
  },
});
