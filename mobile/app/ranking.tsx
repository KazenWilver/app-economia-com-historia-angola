import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { ProvincesResponse, PublicQuizzesResponse } from "@shared/types";
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

function buildRankingsQuery(params: {
  quizId?: string;
  provinceId?: string;
}): string {
  const search = new URLSearchParams();

  if (params.quizId && params.quizId !== "all") {
    search.set("quiz_id", params.quizId);
  }

  if (params.provinceId && params.provinceId !== "all") {
    search.set("province_id", params.provinceId);
  }

  const query = search.toString();
  return query ? `/rankings?${query}` : "/rankings";
}

export default function RankingScreen() {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [quizzes, setQuizzes] = useState<PublicQuizzesResponse["data"]>([]);
  const [provinces, setProvinces] = useState<ProvincesResponse["data"]>([]);
  const [quizId, setQuizId] = useState("all");
  const [provinceId, setProvinceId] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void Promise.all([
      apiFetch<PublicQuizzesResponse>("/quizzes"),
      apiFetch<ProvincesResponse>("/provinces"),
    ])
      .then(([quizData, provinceData]) => {
        setQuizzes(quizData.data);
        setProvinces(provinceData.data);
      })
      .catch(() => {
        // ignore filter bootstrap errors
      });
  }, []);

  const path = useMemo(
    () => buildRankingsQuery({ quizId, provinceId }),
    [quizId, provinceId],
  );

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await apiFetch<RankingsResponse>(path);
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
    },
    [path],
  );

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

      <Text style={styles.filterLabel}>Quiz</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Pressable
          onPress={() => setQuizId("all")}
          style={[styles.chip, quizId === "all" && styles.chipActive]}
        >
          <Text
            style={[
              styles.chipText,
              quizId === "all" && styles.chipTextActive,
            ]}
          >
            Todos
          </Text>
        </Pressable>
        {quizzes.map((quiz) => {
          const active = quizId === String(quiz.id);
          return (
            <Pressable
              key={quiz.id}
              onPress={() => setQuizId(String(quiz.id))}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, active && styles.chipTextActive]}
                numberOfLines={1}
              >
                {quiz.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.filterLabel}>Província</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Pressable
          onPress={() => setProvinceId("all")}
          style={[styles.chip, provinceId === "all" && styles.chipActive]}
        >
          <Text
            style={[
              styles.chipText,
              provinceId === "all" && styles.chipTextActive,
            ]}
          >
            Nacional
          </Text>
        </Pressable>
        {provinces.map((province) => {
          const active = provinceId === String(province.id);
          return (
            <Pressable
              key={province.id}
              onPress={() => setProvinceId(String(province.id))}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {province.name}
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
            const medal =
              item.position === 1
                ? colors.gold
                : item.position === 2
                  ? colors.contentTertiary
                  : item.position === 3
                    ? "#CD7F32"
                    : colors.bordeaux;

            return (
              <Card>
                <View style={styles.row}>
                  <Text style={[styles.position, { color: medal }]}>
                    #{item.position}
                  </Text>
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
  filterLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.contentTertiary,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  filters: {
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 180,
  },
  chipActive: {
    borderColor: colors.bordeaux,
    backgroundColor: colors.bordeauxMuted,
  },
  chipText: {
    fontSize: 13,
    color: colors.contentSecondary,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.bordeaux,
  },
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
