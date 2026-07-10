import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import type { PublicQuizzesResponse } from "@shared/types";
import { Card, EmptyState, Screen, Title } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function QuizScreen() {
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
    }, [load]),
  );

  return (
    <Screen>
      <Title
        title="Quizzes"
        subtitle="Escolhe um quiz e testa os teus conhecimentos."
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
            <EmptyState message="Ainda não há quizzes disponíveis." />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card
              onPress={() => router.push(`/quiz/${item.id}` as never)}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.description ? (
                <Text style={styles.cardBody} numberOfLines={3}>
                  {item.description}
                </Text>
              ) : null}
              <Text style={styles.meta}>
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
