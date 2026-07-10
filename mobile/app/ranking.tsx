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
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

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
  const colors = useThemeColors();
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

      <Text style={[styles.filterLabel, { color: colors.contentTertiary }]}>
        Quiz
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Pressable
          onPress={() => setQuizId("all")}
          style={[
            styles.chip,
            {
              borderColor:
                quizId === "all" ? colors.bordeaux : colors.border,
              backgroundColor:
                quizId === "all" ? colors.bordeauxMuted : colors.surfaceCard,
            },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              {
                color:
                  quizId === "all" ? colors.bordeaux : colors.contentSecondary,
              },
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
              style={[
                styles.chip,
                {
                  borderColor: active ? colors.bordeaux : colors.border,
                  backgroundColor: active
                    ? colors.bordeauxMuted
                    : colors.surfaceCard,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active
                      ? colors.bordeaux
                      : colors.contentSecondary,
                  },
                ]}
                numberOfLines={1}
              >
                {quiz.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={[styles.filterLabel, { color: colors.contentTertiary }]}>
        Província
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        <Pressable
          onPress={() => setProvinceId("all")}
          style={[
            styles.chip,
            {
              borderColor:
                provinceId === "all" ? colors.bordeaux : colors.border,
              backgroundColor:
                provinceId === "all"
                  ? colors.bordeauxMuted
                  : colors.surfaceCard,
            },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              {
                color:
                  provinceId === "all"
                    ? colors.bordeaux
                    : colors.contentSecondary,
              },
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
              style={[
                styles.chip,
                {
                  borderColor: active ? colors.bordeaux : colors.border,
                  backgroundColor: active
                    ? colors.bordeauxMuted
                    : colors.surfaceCard,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: active
                      ? colors.bordeaux
                      : colors.contentSecondary,
                  },
                ]}
              >
                {province.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : (
        <FlatList
          style={{ flex: 1 }}
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
                    <Image
                      source={{ uri: avatar }}
                      style={[
                        styles.avatar,
                        { backgroundColor: colors.bordeauxMuted },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.avatar,
                        styles.avatarPlaceholder,
                        { backgroundColor: colors.bordeauxMuted },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarInitial,
                          { color: colors.bordeaux },
                        ]}
                      >
                        {item.user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.info}>
                    <Text
                      style={[styles.name, { color: colors.contentPrimary }]}
                    >
                      {item.user.name}
                    </Text>
                    <Text
                      style={[styles.meta, { color: colors.contentTertiary }]}
                    >
                      {item.user.province?.name ?? "Sem província"}
                      {" · "}
                      {item.correct_answers}/{item.total_questions}
                      {" · "}
                      {formatRankingTime(item.time_spent_seconds)}
                    </Text>
                  </View>
                  <Text style={[styles.score, { color: colors.petrol }]}>
                    {item.best_score}%
                  </Text>
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
    marginBottom: 8,
    textTransform: "uppercase",
  },
  filters: {
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: 180,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
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
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: "800",
  },
  info: { flex: 1 },
  name: {
    fontSize: 15,
    fontWeight: "700",
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
  },
  score: {
    fontSize: 16,
    fontWeight: "800",
  },
  error: {
    marginTop: 16,
    fontSize: 14,
  },
});
