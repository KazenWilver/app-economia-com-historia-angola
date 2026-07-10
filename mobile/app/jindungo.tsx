import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ContentItem, ContentsResponse } from "@shared/types";
import { Card, EmptyState, PrimaryButton, Screen, Title } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { isImageUrl, resolveMediaUrl } from "@/lib/media";
import { colors } from "@/lib/theme";

export default function JindungoScreen() {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        setItems([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await apiFetch<ContentsResponse>(
          "/contents?type=jindungo",
          { token },
        );
        setItems(data.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os textos Jindungo.",
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

  if (!isAuthenticated) {
    return (
      <Screen scroll>
        <Title
          title="Jindungo"
          subtitle="Textos exclusivos para utilizadores autenticados."
        />
        <Card>
          <Text style={styles.hint}>
            Inicia sessão para aceder à biblioteca Jindungo.
          </Text>
          <PrimaryButton
            label="Entrar"
            onPress={() => router.push("/(auth)/login" as never)}
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Title
        title="Jindungo"
        subtitle="Textos exclusivos sobre economia e história de Angola."
      />

      {loading ? (
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={colors.bordeaux}
            />
          }
          ListEmptyComponent={
            <EmptyState message="Ainda não há textos Jindungo publicados." />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const thumb =
              item.media_url && isImageUrl(item.media_url)
                ? resolveMediaUrl(item.media_url)
                : null;

            return (
              <Card
                onPress={() =>
                  router.push(`/conteudo/${item.slug}` as never)
                }
              >
                {thumb ? (
                  <Image source={{ uri: thumb }} style={styles.thumb} />
                ) : null}
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.body ? (
                  <Text style={styles.cardBody} numberOfLines={3}>
                    {item.body}
                  </Text>
                ) : null}
                <View style={styles.meta}>
                  <Text style={styles.badge}>Jindungo</Text>
                  {item.is_exclusive ? (
                    <Text style={styles.exclusive}>Exclusivo</Text>
                  ) : null}
                </View>
              </Card>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 32 },
  thumb: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: colors.bordeauxMuted,
  },
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
    marginBottom: 10,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.goldDark,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  exclusive: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.gold,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.contentSecondary,
    marginBottom: 12,
  },
  error: {
    marginTop: 16,
    color: colors.error,
    fontSize: 14,
  },
});
