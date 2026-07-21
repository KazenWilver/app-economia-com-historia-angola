import { router } from "expo-router";
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
import { useThemeColors } from "@/contexts/ThemeContext";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { apiFetch } from "@/lib/api";
import { isImageUrl, resolveMediaUrl } from "@/lib/media";
import { TYPE_LABELS } from "@/lib/theme";

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
  const colors = useThemeColors();
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

  useLiveRefresh(load);

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
              style={[
                styles.chip,
                {
                  borderColor: active ? colors.bordeaux : colors.border,
                  backgroundColor: active
                    ? colors.bordeaux
                    : colors.surfaceCard,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: active ? colors.white : colors.contentSecondary },
                ]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {!isAuthenticated && activeFilter === "jindungo" ? (
        <View
          style={[
            styles.guestBanner,
            {
              borderColor: colors.border,
              backgroundColor: colors.bordeauxMuted,
            },
          ]}
        >
          <Text style={[styles.guestText, { color: colors.contentSecondary }]}>
            Os conteúdos Jindungo são exclusivos. Inicia sessão para os ver.
          </Text>
          <Pressable onPress={() => router.push("/(auth)/login" as never)}>
            <Text style={[styles.guestLink, { color: colors.bordeaux }]}>
              Entrar →
            </Text>
          </Pressable>
        </View>
      ) : null}

      {isAuthenticated ? (
        <Pressable
          onPress={() => router.push("/jindungo" as never)}
          style={styles.jindungoLink}
        >
          <Text style={[styles.jindungoLinkText, { color: colors.goldAccent }]}>
            Abrir biblioteca Jindungo →
          </Text>
        </Pressable>
      ) : null}

      {loading ? (
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : (
        <FlatList
          style={styles.list}
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
          contentContainerStyle={styles.listContent}
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
                  <Image
                    source={{ uri: thumb }}
                    style={[
                      styles.thumb,
                      { backgroundColor: colors.bordeauxMuted },
                    ]}
                  />
                ) : null}
                <Text
                  style={[styles.cardTitle, { color: colors.contentPrimary }]}
                >
                  {item.title}
                </Text>
                {item.body ? (
                  <Text
                    style={[styles.cardBody, { color: colors.contentSecondary }]}
                    numberOfLines={3}
                  >
                    {item.body}
                  </Text>
                ) : null}
                <View style={styles.meta}>
                  <Text
                    style={[
                      styles.badge,
                      {
                        color: colors.bordeaux,
                        backgroundColor: colors.bordeauxMuted,
                      },
                    ]}
                  >
                    {TYPE_LABELS[item.type] ?? item.type}
                  </Text>
                  {item.category?.name ? (
                    <Text
                      style={[
                        styles.metaText,
                        { color: colors.contentTertiary },
                      ]}
                    >
                      {item.category.name}
                    </Text>
                  ) : null}
                  {item.is_exclusive ? (
                    <Text style={[styles.exclusive, { color: colors.gold }]}>
                      Exclusivo
                    </Text>
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
  filtersScroll: { maxHeight: 44, marginBottom: 12, flexGrow: 0 },
  filters: { gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "700",
  },
  list: { flex: 1 },
  listContent: { paddingBottom: 32, flexGrow: 1 },
  thumb: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  metaText: {
    fontSize: 12,
  },
  exclusive: {
    fontSize: 12,
    fontWeight: "700",
  },
  guestBanner: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  guestText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  guestLink: {
    fontSize: 14,
    fontWeight: "700",
  },
  jindungoLink: {
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  jindungoLinkText: {
    fontSize: 14,
    fontWeight: "700",
  },
  error: {
    marginTop: 16,
    fontSize: 14,
  },
});
