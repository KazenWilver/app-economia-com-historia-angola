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
import type { ContentsResponse } from "@shared/types";
import { Card, EmptyState, Screen, Title } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function ExplorarScreen() {
  const [items, setItems] = useState<ContentsResponse["data"]>([]);
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
      const data = await apiFetch<ContentsResponse>("/contents");
      setItems(data.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar conteúdos.",
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
        title="Explorar"
        subtitle="Conteúdos educativos sobre economia e história de Angola."
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
            <EmptyState message="Ainda não há conteúdos publicados." />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card
              onPress={() =>
                router.push(`/conteudo/${item.slug}` as never)
              }
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.excerpt ? (
                <Text style={styles.cardBody} numberOfLines={3}>
                  {item.excerpt}
                </Text>
              ) : null}
              <View style={styles.meta}>
                {item.category?.name ? (
                  <Text style={styles.badge}>{item.category.name}</Text>
                ) : null}
                {item.type ? (
                  <Text style={styles.metaText}>{item.type}</Text>
                ) : null}
              </View>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 32, gap: 12 },
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
    flexWrap: "wrap",
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.bordeaux,
    backgroundColor: colors.bordeauxMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  metaText: {
    fontSize: 12,
    color: colors.contentTertiary,
    textTransform: "capitalize",
  },
  error: {
    marginTop: 16,
    color: colors.error,
    fontSize: 14,
  },
});
