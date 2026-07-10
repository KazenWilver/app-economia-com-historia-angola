import { useFocusEffect } from "expo-router";
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
import { Card, EmptyState, Screen, Title } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import { colors } from "@/lib/theme";

interface RankingUser {
  id: number;
  name: string;
  avatar_url: string | null;
  province: { id: number; name: string } | null;
}

interface RankingEntry {
  position: number;
  best_score: number;
  correct_answers: number;
  total_questions: number;
  attempts_count: number;
  time_spent_seconds: number | null;
  completed_at: string | null;
  user: RankingUser;
}

interface RankingsResponse {
  data: RankingEntry[];
  meta: {
    scope: "national" | "region";
    quiz_id: number | null;
    province_id: number | null;
    total: number;
  };
}

function formatRankingTime(seconds: number | null): string {
  if (seconds === null) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

export default function RankingScreen() {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
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
      const data = await apiFetch<RankingsResponse>("/rankings");
      setEntries(data.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o ranking.",
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
        title="Ranking"
        subtitle="Melhores pontuações nos quizzes da plataforma."
      />

      {loading ? (
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => `${item.user.id}-${item.position}`}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={colors.bordeaux}
            />
          }
          ListEmptyComponent={
            <EmptyState message="Ainda não há resultados no ranking." />
          }
          contentContainerStyle={styles.list}
          renderItem={({ item }) => {
            const avatar = resolveMediaUrl(item.user.avatar_url);
            return (
              <Card>
                <View style={styles.row}>
                  <Text style={styles.position}>#{item.position}</Text>
                  {avatar ? (
                    <Image source={{ uri: avatar }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <Text style={styles.avatarInitial}>
                        {item.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.info}>
                    <Text style={styles.name}>{item.user.name}</Text>
                    <Text style={styles.meta}>
                      {item.user.province?.name ?? "Sem província"}
                      {" · "}
                      {item.correct_answers}/{item.total_questions}
                      {" · "}
                      {formatRankingTime(item.time_spent_seconds)}
                    </Text>
                  </View>
                  <Text style={styles.score}>{item.best_score}%</Text>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  position: {
    width: 36,
    fontSize: 15,
    fontWeight: "800",
    color: colors.bordeaux,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bordeauxMuted,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.bordeaux,
  },
  info: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.contentPrimary,
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.contentTertiary,
  },
  score: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.petrol,
  },
  error: {
    marginTop: 16,
    color: colors.error,
    fontSize: 14,
  },
});
