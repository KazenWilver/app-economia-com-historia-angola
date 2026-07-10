import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ContentItem, ContentsResponse, ContentType } from "@shared/types";
import { Card, EmptyState, Screen, Title } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { isImageUrl, resolveMediaUrl } from "@/lib/media";
import { colors, TYPE_LABELS } from "@/lib/theme";

const FILTERS: { value: ContentType | null; label: string }[] = [
  { value: null, label: "Todos" },
  { value: "texto", label: "Texto" },
  { value: "audio", label: "Áudio" },
  { value: "video", label: "Vídeo" },
  { value: "podcast", label: "Podcast" },
  { value: "jindungo", label: "Jindungo" },
];

export default function ExplorarScreen() {
  const { token, isAuthenticated } = useAuth();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<ContentType | null>(null);
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
        const data = await apiFetch<ContentsResponse>("/contents", { token });
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
    },
    [token],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const visibleItems = useMemo(() => {
    let list = items;

    if (!isAuthenticated) {
      list = list.filter(
        (content) => !content.is_exclusive && content.type !== "jindungo",
      );
    }

    if (activeFilter) {
      list = list.filter((content) => content.type === activeFilter);
    }

    return list;
  }, [items, activeFilter, isAuthenticated]);

  return (
    <Screen>
      <Title
        title="Explorar"
        subtitle="Conteúdos educativos sobre economia e história de Angola."
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
        style={styles.filtersScroll}
      >
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.value;
          return (
            <Pressable
              key={filter.label}
              onPress={() => setActiveFilter(filter.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={visibleItems}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={colors.bordeaux}
            />
          }
          ListEmptyComponent={
            <EmptyState message="Ainda não há conteúdos neste filtro." />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const imageUri =
              item.media_url && isImageUrl(item.media_url)
                ? resolveMediaUrl(item.media_url)
                : null;

            return (
              <Card
                onPress={() =>
                  router.push(`/conteudo/${item.slug}` as never)
                }
              >
                {imageUri ? (
                  <Image source={{ uri: imageUri }} style={styles.thumb} />
                ) : null}
                <Text style={styles.cardTitle}>{item.title}</Text>
                {item.excerpt ? (
                  <Text style={styles.cardBody} numberOfLines={3}>
                    {item.excerpt}
                  </Text>
                ) : null}
                <View style={styles.meta}>
                  <Text style={styles.badge}>
                    {TYPE_LABELS[item.type] ?? item.type}
                  </Text>
                  {item.category?.name ? (
                    <Text style={styles.metaText}>{item.category.name}</Text>
                  ) : null}
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
  filtersScroll: { maxHeight: 44, marginBottom: 12 },
  filters: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  chipActive: {
    backgroundColor: colors.bordeaux,
    borderColor: colors.bordeaux,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.contentSecondary,
  },
  chipTextActive: { color: colors.white },
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
  },
  exclusive: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.gold,
  },
  error: {
    marginTop: 16,
    color: colors.error,
    fontSize: 14,
  },
});
