import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  ProvincesResponse,
  PublicQuiz,
  PublicQuizResponse,
  QuestionFeedbackResult,
  QuizAttemptResult,
  QuizRecommendation,
} from "@shared/types";
import { Card, PrimaryButton, Screen } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";

interface QuizAttemptResponse {
  message: string;
  attempt: QuizAttemptResult;
  recommendations: QuizRecommendation[];
}

interface QuestionFeedbackResponse {
  feedback: QuestionFeedbackResult;
}

type Phase =
  | "loading"
  | "ready"
  | "playing"
  | "submitting"
  | "results"
  | "error";

function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export default function QuizPlayScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token, isAuthenticated, updateProfile } = useAuth();
  const colors = useThemeColors();
  const [quiz, setQuiz] = useState<PublicQuiz | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, number | null>>(
    {},
  );
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<
    Record<number, QuestionFeedbackResult>
  >({});
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [recommendations, setRecommendations] = useState<QuizRecommendation[]>(
    [],
  );
  const [provinces, setProvinces] = useState<ProvincesResponse["data"]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [savingProvince, setSavingProvince] = useState(false);
  const submitLockRef = useRef(false);
  const timeExpiredRef = useRef(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        title: {
          fontSize: 26,
          fontWeight: "800",
          color: colors.contentPrimary,
          marginBottom: 12,
        },
        description: {
          fontSize: 15,
          lineHeight: 22,
          color: colors.contentSecondary,
          marginBottom: 12,
        },
        meta: {
          fontSize: 13,
          fontWeight: "600",
          color: colors.contentTertiary,
          marginBottom: 16,
        },
        actions: { marginTop: 8 },
        progressRow: {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        },
        timer: {
          fontSize: 16,
          fontWeight: "800",
          color: colors.bordeaux,
          fontVariant: ["tabular-nums"],
        },
        question: {
          fontSize: 18,
          fontWeight: "700",
          color: colors.contentPrimary,
          marginBottom: 16,
          lineHeight: 26,
        },
        option: {
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceCard,
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
        },
        optionSelected: {
          borderColor: colors.bordeaux,
          backgroundColor: colors.bordeauxMuted,
        },
        optionCorrect: {
          borderColor: colors.success,
          backgroundColor: "#DCFCE7",
        },
        optionWrong: {
          borderColor: colors.error,
          backgroundColor: "#FEE2E2",
        },
        optionText: {
          fontSize: 15,
          color: colors.contentPrimary,
        },
        optionTextSelected: {
          fontWeight: "700",
          color: colors.bordeaux,
        },
        navRow: {
          marginTop: 16,
          gap: 10,
        },
        score: {
          fontSize: 40,
          fontWeight: "800",
          color: colors.bordeaux,
        },
        answerLine: {
          fontSize: 14,
          marginTop: 6,
          color: colors.contentSecondary,
        },
        correct: { color: colors.success, fontWeight: "700" },
        incorrect: { color: colors.error, fontWeight: "700" },
        explanation: {
          marginTop: 8,
          fontSize: 13,
          lineHeight: 20,
          color: colors.contentTertiary,
        },
        sectionTitle: {
          marginTop: 8,
          marginBottom: 8,
          fontSize: 18,
          fontWeight: "800",
          color: colors.contentPrimary,
        },
        recLink: {
          marginTop: 8,
          fontSize: 13,
          fontWeight: "700",
          color: colors.bordeaux,
        },
        error: {
          marginTop: 12,
          marginBottom: 12,
          color: colors.error,
          fontSize: 14,
        },
        provinceRow: {
          gap: 8,
          paddingBottom: 4,
        },
        provinceChip: {
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surface,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 8,
        },
        provinceChipActive: {
          borderColor: colors.bordeaux,
          backgroundColor: colors.bordeauxMuted,
        },
        provinceChipText: {
          fontSize: 13,
          color: colors.contentSecondary,
          fontWeight: "600",
        },
        provinceChipTextActive: {
          color: colors.bordeaux,
        },
      }),
    [colors],
  );

  const questions = useMemo(() => quiz?.questions ?? [], [quiz]);
  const needsProvince = isAuthenticated && !user?.province_id;

  const load = useCallback(async () => {
    if (!id) {
      return;
    }

    setPhase("loading");
    setError(null);

    try {
      const data = await apiFetch<PublicQuizResponse>(`/quizzes/${id}`, {
        token,
      });
      setQuiz(data.data);
      setPhase("ready");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar o quiz.",
      );
      setPhase("error");
    }
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!needsProvince) {
      return;
    }

    void apiFetch<ProvincesResponse>("/provinces")
      .then((data) => {
        setProvinces(data.data);
        if (data.data[0]) {
          setSelectedProvinceId(String(data.data[0].id));
        }
      })
      .catch(() => {
        setError("Não foi possível carregar as províncias.");
      });
  }, [needsProvince]);

  const submitAttempt = useCallback(
    async (finalSelections?: Record<number, number | null>) => {
      if (submitLockRef.current || !quiz || !token) {
        return;
      }

      submitLockRef.current = true;
      setPhase("submitting");
      setError(null);

      const answersMap = finalSelections ?? selections;
      const timeSpentSeconds =
        startedAt !== null
          ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
          : undefined;

      try {
        const payload = {
          answers: questions.map((question) => ({
            question_id: question.id,
            selected_answer_id: answersMap[question.id] ?? null,
          })),
          ...(timeSpentSeconds !== undefined
            ? { time_spent_seconds: timeSpentSeconds }
            : {}),
        };

        const response = await apiFetch<QuizAttemptResponse>(
          `/quizzes/${quiz.id}/attempt`,
          {
            method: "POST",
            token,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        setResult(response.attempt);
        setRecommendations(response.recommendations ?? []);
        setPhase("results");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível submeter o quiz.",
        );
        setPhase("playing");
        submitLockRef.current = false;
      }
    },
    [quiz, questions, selections, startedAt, token],
  );

  useEffect(() => {
    if (phase !== "playing" || quiz?.time_limit_seconds == null) {
      return;
    }

    const timerId = setInterval(() => {
      setSecondsLeft((current) => {
        if (current === null) {
          return null;
        }
        if (current <= 1) {
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [phase, quiz?.time_limit_seconds]);

  useEffect(() => {
    if (
      phase !== "playing" ||
      secondsLeft !== 0 ||
      quiz?.time_limit_seconds == null ||
      timeExpiredRef.current
    ) {
      return;
    }

    timeExpiredRef.current = true;
    void submitAttempt();
  }, [phase, secondsLeft, quiz?.time_limit_seconds, submitAttempt]);

  const beginPlaying = () => {
    if (!quiz) {
      return;
    }

    const initial: Record<number, number | null> = {};
    for (const question of questions) {
      initial[question.id] = null;
    }

    setSelections(initial);
    setFeedbackByQuestion({});
    setCurrentIndex(0);
    setStartedAt(Date.now());
    setSecondsLeft(quiz.time_limit_seconds);
    timeExpiredRef.current = false;
    submitLockRef.current = false;
    setPhase("playing");
  };

  const startQuiz = async () => {
    if (!isAuthenticated || !quiz) {
      setError("Precisas de iniciar sessão para jogar.");
      return;
    }

    if (needsProvince) {
      if (!selectedProvinceId) {
        setError("Selecciona a tua província antes de começar.");
        return;
      }

      setSavingProvince(true);
      setError(null);

      try {
        await updateProfile({ province_id: Number(selectedProvinceId) });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível guardar a província.",
        );
        setSavingProvince(false);
        return;
      } finally {
        setSavingProvince(false);
      }
    }

    beginPlaying();
  };

  const currentQuestion = questions[currentIndex];
  const selectedAnswerId = currentQuestion
    ? (selections[currentQuestion.id] ?? null)
    : null;
  const currentFeedback = currentQuestion
    ? feedbackByQuestion[currentQuestion.id]
    : undefined;
  const isRevealed = Boolean(currentFeedback);

  const confirmAnswer = async () => {
    if (!currentQuestion || !quiz || !token) {
      return;
    }

    if (!isRevealed) {
      if (selectedAnswerId === null) {
        setError("Selecciona uma resposta antes de confirmar.");
        return;
      }

      setLoadingFeedback(true);
      setError(null);

      try {
        const response = await apiFetch<QuestionFeedbackResponse>(
          `/quizzes/${quiz.id}/questions/${currentQuestion.id}/feedback`,
          {
            method: "POST",
            token,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selected_answer_id: selectedAnswerId }),
          },
        );

        setFeedbackByQuestion((prev) => ({
          ...prev,
          [currentQuestion.id]: response.feedback,
        }));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível validar a resposta.",
        );
      } finally {
        setLoadingFeedback(false);
      }

      return;
    }

    if (currentIndex >= questions.length - 1) {
      void submitAttempt();
      return;
    }

    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
    setError(null);
  };

  if (phase === "loading") {
    return (
      <Screen>
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (phase === "error" || !quiz) {
    return (
      <Screen>
        <Text style={styles.error}>{error ?? "Quiz não encontrado."}</Text>
      </Screen>
    );
  }

  if (phase === "results" && result) {
    return (
      <Screen scroll>
        <Text style={styles.title}>Resultado</Text>
        <Card>
          <Text style={styles.score}>{result.score}%</Text>
          <Text style={styles.meta}>
            {result.correct_answers} de {result.total_questions} correctas
          </Text>
        </Card>

        {result.answers.map((answer) => (
          <Card key={answer.question_id}>
            <Text style={styles.question}>{answer.question_text}</Text>
            <Text
              style={[
                styles.answerLine,
                answer.is_correct ? styles.correct : styles.incorrect,
              ]}
            >
              A tua resposta: {answer.selected_answer_text ?? "Sem resposta"}
            </Text>
            {!answer.is_correct ? (
              <Text style={styles.answerLine}>
                Correcta: {answer.correct_answer_text}
              </Text>
            ) : null}
            {answer.explanation ? (
              <Text style={styles.explanation}>{answer.explanation}</Text>
            ) : null}
          </Card>
        ))}

        {recommendations.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Recomendações</Text>
            {recommendations.map((item) => (
              <Card
                key={item.id}
                onPress={() => {
                  if (item.content?.slug) {
                    if (token) {
                      void apiFetch(`/recommendations/${item.id}/read`, {
                        method: "POST",
                        token,
                      }).catch(() => {
                        // ignore
                      });
                    }
                    router.push(`/conteudo/${item.content.slug}` as never);
                  }
                }}
              >
                <Text style={styles.question}>{item.content?.title}</Text>
                {item.reason ? (
                  <Text style={styles.explanation}>{item.reason}</Text>
                ) : null}
                <Text style={styles.recLink}>Abrir conteúdo →</Text>
              </Card>
            ))}
          </>
        ) : null}
      </Screen>
    );
  }

  if (phase === "ready") {
    return (
      <Screen scroll>
        <Text style={styles.title}>{quiz.title}</Text>
        {quiz.description ? (
          <Text style={styles.description}>{quiz.description}</Text>
        ) : null}
        <Text style={styles.meta}>
          {questions.length} perguntas
          {quiz.time_limit_seconds
            ? ` · ${Math.round(quiz.time_limit_seconds / 60)} min`
            : " · sem limite"}
        </Text>

        {needsProvince ? (
          <Card>
            <Text style={styles.question}>
              Indica a tua província para entrar no ranking regional.
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.provinceRow}
            >
              {provinces.map((province) => {
                const active = selectedProvinceId === String(province.id);
                return (
                  <Pressable
                    key={province.id}
                    onPress={() => setSelectedProvinceId(String(province.id))}
                    style={[
                      styles.provinceChip,
                      active && styles.provinceChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.provinceChipText,
                        active && styles.provinceChipTextActive,
                      ]}
                    >
                      {province.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Card>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.actions}>
          <PrimaryButton
            label="Começar quiz"
            onPress={() => void startQuiz()}
            isLoading={savingProvince}
          />
        </View>
      </Screen>
    );
  }

  if (!currentQuestion) {
    return (
      <Screen>
        <Text style={styles.error}>Este quiz não tem perguntas.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.progressRow}>
        <Text style={styles.meta}>
          Pergunta {currentIndex + 1} / {questions.length}
        </Text>
        {secondsLeft !== null ? (
          <Text style={styles.timer}>{formatTimer(secondsLeft)}</Text>
        ) : null}
      </View>

      <Text style={styles.question}>{currentQuestion.question_text}</Text>

      {currentQuestion.answers.map((answer) => {
        const selected = selectedAnswerId === answer.id;
        const showCorrect =
          isRevealed && currentFeedback?.correct_answer_id === answer.id;
        const showWrong =
          isRevealed &&
          selected &&
          currentFeedback &&
          !currentFeedback.is_correct;

        return (
          <Pressable
            key={answer.id}
            disabled={isRevealed || loadingFeedback || phase === "submitting"}
            onPress={() =>
              setSelections((prev) => ({
                ...prev,
                [currentQuestion.id]: answer.id,
              }))
            }
            style={[
              styles.option,
              selected && !isRevealed && styles.optionSelected,
              showCorrect && styles.optionCorrect,
              showWrong && styles.optionWrong,
            ]}
          >
            <Text
              style={[
                styles.optionText,
                (selected || showCorrect) && styles.optionTextSelected,
              ]}
            >
              {answer.answer_text}
            </Text>
          </Pressable>
        );
      })}

      {currentFeedback ? (
        <Card>
          <Text
            style={[
              styles.answerLine,
              currentFeedback.is_correct ? styles.correct : styles.incorrect,
            ]}
          >
            {currentFeedback.is_correct
              ? "Resposta correcta!"
              : "Resposta incorrecta."}
          </Text>
          {!currentFeedback.is_correct && currentFeedback.correct_answer_text ? (
            <Text style={styles.answerLine}>
              Correcta: {currentFeedback.correct_answer_text}
            </Text>
          ) : null}
          {currentFeedback.explanation ? (
            <Text style={styles.explanation}>{currentFeedback.explanation}</Text>
          ) : null}
        </Card>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.navRow}>
        <PrimaryButton
          label="Anterior"
          onPress={() => {
            setCurrentIndex((i) => Math.max(0, i - 1));
            setError(null);
          }}
          disabled={currentIndex === 0 || phase === "submitting"}
        />
        <PrimaryButton
          label={
            !isRevealed
              ? "Confirmar"
              : currentIndex < questions.length - 1
                ? "Seguinte"
                : "Submeter"
          }
          onPress={() => void confirmAnswer()}
          isLoading={loadingFeedback || phase === "submitting"}
          disabled={phase === "submitting"}
        />
      </View>
    </Screen>
  );
}
