import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { PublicQuizzesResponse } from "@shared/types";
import { Card, EmptyState, Screen, Title } from "@/components/ui";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";
import { subscribeDataChanged } from "@/lib/data-refresh";

export default function QuizScreen() {
  const colors = useThemeColors();
  const [items, setItems] = useState<PublicQuizzesResponse["data"]>([]);
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
      const data = await apiFetch<PublicQuizzesResponse>("/quizzes");
      setItems(data.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar quizzes.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
      return subscribeDataChanged(() => {
        void load();
      });
    }, [load]),
  );

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Title
            title="Quizzes"
            subtitle="Escolhe um quiz e testa os teus conhecimentos."
          />
        </View>
      </View>

      <Pressable
        onPress={() => router.push("/ranking" as never)}
        style={styles.rankingLink}
      >
        <Text style={[styles.rankingLinkText, { color: colors.bordeaux }]}>
          Ver ranking nacional →
        </Text>
      </Pressable>

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
            <EmptyState message="Ainda não há quizzes disponíveis." />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card
              onPress={() => router.push(`/quiz/${item.id}` as never)}
            >
              <Text
                style={[styles.cardTitle, { color: colors.contentPrimary }]}
              >
                {item.title}
              </Text>
              {item.description ? (
                <Text
                  style={[styles.cardBody, { color: colors.contentSecondary }]}
                  numberOfLines={3}
                >
                  {item.description}
                </Text>
              ) : null}
              <Text style={[styles.meta, { color: colors.contentTertiary }]}>
                {item.questions_count ?? "—"} perguntas
                {item.time_limit_seconds
                  ? ` · ${Math.round(item.time_limit_seconds / 60)} min`
                  : ""}
              </Text>
            </Card>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", alignItems: "flex-start" },
  headerText: { flex: 1 },
  rankingLink: {
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  rankingLinkText: {
    fontSize: 14,
    fontWeight: "700",
  },
  list: { paddingBottom: 32 },
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
    fontSize: 12,
    fontWeight: "600",
  },
  error: {
    marginTop: 16,
    fontSize: 14,
  },
});
