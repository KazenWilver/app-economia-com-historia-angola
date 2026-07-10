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
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";
import { isImageUrl, resolveMediaUrl } from "@/lib/media";

export default function JindungoScreen() {
  const { token, isAuthenticated } = useAuth();
  const colors = useThemeColors();
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
          <Text style={[styles.hint, { color: colors.contentSecondary }]}>
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
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : (
        <FlatList
          style={{ flex: 1 }}
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
                    style={[
                      styles.cardBody,
                      { color: colors.contentSecondary },
                    ]}
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
                        color: colors.goldDark,
                        backgroundColor: colors.bordeauxMuted,
                      },
                    ]}
                  >
                    Jindungo
                  </Text>
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
  list: { paddingBottom: 32 },
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
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  exclusive: {
    fontSize: 12,
    fontWeight: "700",
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  error: {
    marginTop: 16,
    fontSize: 14,
  },
});
