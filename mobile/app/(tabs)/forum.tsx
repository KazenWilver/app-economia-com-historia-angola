import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import type { PublicTopicsResponse } from "@shared/types";
import { Card, EmptyState, PrimaryButton, Screen, Title } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function ForumScreen() {
  const [items, setItems] = useState<PublicTopicsResponse["data"]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await apiFetch<PublicTopicsResponse>("/topics");
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
  }, []);

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

      <PrimaryButton
        label="Novo tópico"
        onPress={() => router.push("/forum/novo" as never)}
      />

      {loading ? (
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
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
            <Card
              onPress={() => router.push(`/forum/${item.id}` as never)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.cardBody} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
              <Text style={styles.meta}>
                {item.author?.name ?? "Autor"}
                {typeof item.replies_count === "number"
                  ? ` · ${item.replies_count} respostas`
                  : ""}
                {item.theme ? ` · ${item.theme}` : ""}
              </Text>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { marginTop: 16, flex: 1 },
  listContent: { paddingBottom: 32 },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.contentPrimary,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.contentSecondary,
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: colors.contentTertiary,
    fontWeight: "600",
  },
  error: {
    marginTop: 16,
    color: colors.error,
    fontSize: 14,
  },
});
