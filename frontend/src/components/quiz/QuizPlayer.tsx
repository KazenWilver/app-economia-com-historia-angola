"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, Trophy, XCircle } from "lucide-react";
import { ProvinceSelectField } from "@/components/auth/ProvinceSelectField";
import { QuizRecommendations } from "@/components/quiz/QuizRecommendations";
import {
  formatQuizTimeLimit,
  formatTimer,
  type PublicQuiz,
  type PublicQuizQuestion,
  type QuestionFeedbackResponse,
  type QuestionFeedbackResult,
  type QuizAttemptResponse,
  type QuizAttemptResult,
  type QuizRecommendation,
} from "@/components/quiz/quiz-types";
import type { ProvincesResponse } from "@/components/ranking/ranking-types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type PlayerPhase = "intro" | "playing" | "submitting" | "results";

interface QuizPlayerProps {
  quiz: PublicQuiz;
}

interface AnswerSelection {
  question_id: number;
  selected_answer_id: number | null;
}

function sortQuestions(questions: PublicQuizQuestion[]): PublicQuizQuestion[] {
  return [...questions].sort((left, right) => left.order - right.order);
}

function getTimerWarningThreshold(totalSeconds: number): number {
  return Math.min(30, Math.max(5, Math.floor(totalSeconds / 3)));
}

export function QuizPlayer({ quiz }: QuizPlayerProps) {
  const { isAuthenticated, isLoading: authLoading, user, updateProfile } = useAuth();
  const questions = useMemo(
    () => sortQuestions(quiz.questions ?? []),
    [quiz.questions],
  );

  const [phase, setPhase] = useState<PlayerPhase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<AnswerSelection[]>([]);
  const [feedbackByQuestion, setFeedbackByQuestion] = useState<
    Record<number, QuestionFeedbackResult>
  >({});
  const [pendingAnswerId, setPendingAnswerId] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(
    quiz.time_limit_seconds,
  );
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResult | null>(
    null,
  );
  const [recommendations, setRecommendations] = useState<QuizRecommendation[]>(
    [],
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [provinces, setProvinces] = useState<ProvincesResponse["data"]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState("");
  const [provinceError, setProvinceError] = useState<string | null>(null);
  const [isSavingProvince, setIsSavingProvince] = useState(false);
  const submitLockRef = useRef(false);
  const totalTimeSecondsRef = useRef<number | null>(quiz.time_limit_seconds);
  const timeExpiredRef = useRef(false);

  const currentQuestion = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const totalTimeSeconds = totalTimeSecondsRef.current;
  const timeProgress =
    secondsLeft !== null && totalTimeSeconds !== null && totalTimeSeconds > 0
      ? (secondsLeft / totalTimeSeconds) * 100
      : null;
  const timerWarningThreshold =
    totalTimeSeconds !== null
      ? getTimerWarningThreshold(totalTimeSeconds)
      : 30;

  const loginHref = `/login?redirect=${encodeURIComponent(`/quiz/${quiz.id}`)}`;
  const needsProvince = isAuthenticated && !user?.province_id;

  useEffect(() => {
    if (!needsProvince) {
      return;
    }

    const loadProvinces = async () => {
      try {
        const data = await apiFetch<ProvincesResponse>("/provinces", {
          cacheTtlMs: 300_000,
        });
        setProvinces(data.data);
      } catch {
        setProvinces([]);
      }
    };

    void loadProvinces();
  }, [needsProvince]);

  const saveProvinceAndStart = async () => {
    if (!selectedProvinceId) {
      setProvinceError("Selecciona a tua província para aparecer no ranking regional.");
      return;
    }

    setIsSavingProvince(true);
    setProvinceError(null);

    try {
      await updateProfile({ province_id: Number(selectedProvinceId) });
      startQuiz();
    } catch {
      setProvinceError("Não foi possível guardar a província. Tenta novamente.");
    } finally {
      setIsSavingProvince(false);
    }
  };

  const submitAttempt = useCallback(
    async (finalSelections?: AnswerSelection[]) => {
      if (submitLockRef.current || !isAuthenticated) {
        return;
      }

      submitLockRef.current = true;
      setPhase("submitting");
      setErrorMessage(null);

      const answersToSubmit = finalSelections ?? selections;
      const timeSpentSeconds =
        startedAt !== null
          ? Math.max(1, Math.round((Date.now() - startedAt) / 1000))
          : undefined;

      try {
        const payload = {
          answers: questions.map((question) => {
            const selected = answersToSubmit.find(
              (item) => item.question_id === question.id,
            );

            return {
              question_id: question.id,
              selected_answer_id: selected?.selected_answer_id ?? null,
            };
          }),
          ...(timeSpentSeconds !== undefined
            ? { time_spent_seconds: timeSpentSeconds }
            : {}),
        };

        const response = await apiFetch<QuizAttemptResponse>(
          `/quizzes/${quiz.id}/attempt`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        setAttemptResult(response.attempt);
        setRecommendations(response.recommendations ?? []);
        setPhase("results");
      } catch {
        setErrorMessage(
          "Não foi possível submeter o quiz. Verifica se iniciaste sessão e tenta novamente.",
        );
        setPhase("playing");
        submitLockRef.current = false;
      }
    },
    [isAuthenticated, questions, quiz.id, selections, startedAt],
  );

  useEffect(() => {
    if (phase !== "playing" || quiz.time_limit_seconds === null) {
      return;
    }

    const timerId = window.setInterval(() => {
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

    return () => window.clearInterval(timerId);
  }, [phase, quiz.time_limit_seconds]);

  useEffect(() => {
    if (
      phase !== "playing" ||
      secondsLeft !== 0 ||
      quiz.time_limit_seconds === null ||
      timeExpiredRef.current
    ) {
      return;
    }

    timeExpiredRef.current = true;
    void submitAttempt();
  }, [phase, secondsLeft, quiz.time_limit_seconds, submitAttempt]);

  const startQuiz = () => {
    if (!isAuthenticated) {
      return;
    }

    setPhase("playing");
    setCurrentIndex(0);
    setSelections([]);
    setFeedbackByQuestion({});
    setPendingAnswerId(null);
    setAttemptResult(null);
    setRecommendations([]);
    setIsLoadingFeedback(false);
    totalTimeSecondsRef.current = quiz.time_limit_seconds;
    setSecondsLeft(quiz.time_limit_seconds);
    setStartedAt(Date.now());
    submitLockRef.current = false;
    timeExpiredRef.current = false;
  };

  const getSelectedForQuestion = (
    questionId: number,
    source: AnswerSelection[] = selections,
  ): number | null => {
    return (
      source.find((item) => item.question_id === questionId)
        ?.selected_answer_id ?? null
    );
  };

  const fetchQuestionFeedback = async (
    question: PublicQuizQuestion,
    selectedAnswerId: number,
  ): Promise<QuestionFeedbackResult | null> => {
    setIsLoadingFeedback(true);
    setErrorMessage(null);

    try {
      const response = await apiFetch<QuestionFeedbackResponse>(
        `/quizzes/${quiz.id}/questions/${question.id}/feedback`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selected_answer_id: selectedAnswerId }),
        },
      );

      setFeedbackByQuestion((current) => ({
        ...current,
        [question.id]: response.feedback,
      }));

      return response.feedback;
    } catch {
      setErrorMessage(
        "Não foi possível validar a resposta. Tenta novamente.",
      );

      return null;
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const confirmAnswer = async () => {
    if (!currentQuestion) {
      return;
    }

    const selectedAnswerId =
      pendingAnswerId ?? getSelectedForQuestion(currentQuestion.id);
    const currentFeedback = feedbackByQuestion[currentQuestion.id];
    const isRevealed = Boolean(currentFeedback);

    if (!isRevealed) {
      if (selectedAnswerId === null) {
        return;
      }

      const nextSelections = [
        ...selections.filter(
          (item) => item.question_id !== currentQuestion.id,
        ),
        {
          question_id: currentQuestion.id,
          selected_answer_id: selectedAnswerId,
        },
      ];

      setSelections(nextSelections);

      const feedback = await fetchQuestionFeedback(
        currentQuestion,
        selectedAnswerId,
      );

      if (feedback === null) {
        return;
      }

      return;
    }

    if (currentIndex >= questions.length - 1) {
      void submitAttempt();
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setPendingAnswerId(getSelectedForQuestion(questions[nextIndex].id));
  };

  if (authLoading) {
    return (
      <Card hoverLift={false}>
        <CardContent className="py-12 text-center text-content-secondary dark:text-content-dark-secondary">
          A carregar...
        </CardContent>
      </Card>
    );
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 text-sm font-semibold text-bordeaux hover:underline dark:text-bordeaux-dark"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Voltar aos quizzes
        </Link>

        <Card hoverLift={false}>
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {quiz.description ? (
              <p className="text-content-secondary dark:text-content-dark-secondary">
                {quiz.description}
              </p>
            ) : null}

            <div className="flex flex-wrap gap-4 text-sm text-content-secondary dark:text-content-dark-secondary">
              <span>{questions.length} perguntas</span>
              <span>Tempo: {formatQuizTimeLimit(quiz.time_limit_seconds)}</span>
            </div>

            {!isAuthenticated ? (
              <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  Precisas de iniciar sessão para jogar e guardar a tua
                  pontuação.
                </p>
                <Link href={loginHref}>
                  <Button type="button">Iniciar sessão</Button>
                </Link>
              </div>
            ) : needsProvince ? (
              <div className="space-y-4 rounded-xl border border-border bg-surface-secondary p-4 dark:border-border-dark dark:bg-surface-dark-secondary">
                <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
                  Para apareceres no ranking por província, indica de onde és
                  antes de começar o quiz.
                </p>
                <ProvinceSelectField
                  value={selectedProvinceId}
                  provinces={provinces}
                  error={provinceError ?? undefined}
                  onChange={setSelectedProvinceId}
                />
                <Button
                  type="button"
                  onClick={() => void saveProvinceAndStart()}
                  className="w-full sm:w-auto"
                  isLoading={isSavingProvince}
                >
                  Guardar província e começar
                </Button>
              </div>
            ) : (
              <Button type="button" onClick={startQuiz} className="w-full sm:w-auto">
                Começar quiz
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (phase === "submitting") {
    return (
      <Card hoverLift={false}>
        <CardContent className="py-16 text-center">
          <p className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            A calcular a tua pontuação...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (phase === "results" && attemptResult) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card hoverLift={false} className="border-bordeaux/20 bg-bordeaux/5 dark:border-bordeaux-dark/30 dark:bg-bordeaux-dark/10">
          <CardContent className="space-y-4 py-8 text-center">
            <Trophy className="mx-auto h-10 w-10 text-gold" strokeWidth={1.5} />
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-bordeaux dark:text-bordeaux-dark">
              Resultado
            </p>
            <p className="font-display text-5xl font-bold text-content-primary dark:text-content-dark-primary">
              {attemptResult.score}%
            </p>
            <p className="text-content-secondary dark:text-content-dark-secondary">
              {attemptResult.correct_answers} de {attemptResult.total_questions}{" "}
              respostas correctas
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/ranking">
                <Button type="button" variant="secondary">
                  Ver ranking
                </Button>
              </Link>
              <Link href="/quiz">
                <Button type="button" variant="secondary">
                  Ver mais quizzes
                </Button>
              </Link>
              <Button type="button" variant="ghost" onClick={startQuiz}>
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>

        <QuizRecommendations recommendations={recommendations} />

        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold text-content-primary dark:text-content-dark-primary">
            Revisão das respostas
          </h2>

          {attemptResult.answers.map((answer, index) => (
            <Card key={answer.question_id} hoverLift={false}>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-start gap-3">
                  {answer.is_correct ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success-light dark:text-success-dark" strokeWidth={1.5} />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-error-light dark:text-error-dark" strokeWidth={1.5} />
                  )}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                      Pergunta {index + 1}
                    </p>
                    <p className="font-semibold text-content-primary dark:text-content-dark-primary">
                      {answer.question_text}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <p
                    className={cn(
                      "rounded-lg px-3 py-2",
                      answer.is_correct
                        ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200"
                        : "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200",
                    )}
                  >
                    A tua resposta:{" "}
                    {answer.selected_answer_text ?? "Sem resposta"}
                  </p>
                  {!answer.is_correct && answer.correct_answer_text ? (
                    <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200">
                      Resposta correcta: {answer.correct_answer_text}
                    </p>
                  ) : null}
                  {answer.explanation ? (
                    <p className="text-content-secondary dark:text-content-dark-secondary">
                      {answer.explanation}
                    </p>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  const existingSelection = getSelectedForQuestion(currentQuestion.id);
  const currentFeedback = feedbackByQuestion[currentQuestion.id];
  const isRevealed = Boolean(currentFeedback);

  const getAnswerButtonClass = (answerId: number, isSelected: boolean) => {
    if (!isRevealed || !currentFeedback) {
      return cn(
        "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
        isSelected
          ? "border-bordeaux bg-bordeaux/5 ring-2 ring-bordeaux/30 dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:ring-bordeaux-dark/30"
          : "border-border bg-white hover:border-bordeaux/40 dark:border-border-dark dark:bg-surface-dark-card dark:hover:border-bordeaux-dark/40",
      );
    }

    const isCorrectOption = answerId === currentFeedback.correct_answer_id;
    const isWrongSelection =
      answerId === currentFeedback.selected_answer_id &&
      !currentFeedback.is_correct;

    if (isCorrectOption) {
      return "w-full rounded-xl border border-emerald-500 bg-emerald-100 px-4 py-3 text-left text-sm font-semibold text-emerald-900 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-200";
    }

    if (isWrongSelection) {
      return "w-full rounded-xl border border-red-500 bg-red-100 px-4 py-3 text-left text-sm font-semibold text-red-900 dark:border-red-600 dark:bg-red-900/30 dark:text-red-200";
    }

    return "w-full rounded-xl border border-border bg-white px-4 py-3 text-left text-sm font-medium text-content-tertiary opacity-70 dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-tertiary";
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {errorMessage ? (
        <Toast variant="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-display text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
          Pergunta {currentIndex + 1} de {questions.length}
        </p>
        {secondsLeft !== null ? (
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-sm font-semibold",
              secondsLeft <= timerWarningThreshold
                ? "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200"
                : "bg-surface-secondary text-content-primary dark:bg-surface-dark-secondary dark:text-content-dark-primary",
            )}
          >
            <Clock className="h-4 w-4" strokeWidth={1.5} />
            {formatTimer(Math.max(0, secondsLeft))}
          </div>
        ) : null}
      </div>

      {timeProgress !== null ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
            <span>Tempo restante</span>
            <span className="font-mono normal-case">{formatTimer(Math.max(0, secondsLeft ?? 0))}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-secondary dark:bg-surface-dark-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-linear",
                secondsLeft !== null && secondsLeft <= timerWarningThreshold
                  ? "bg-red-500 dark:bg-red-400"
                  : "bg-gold dark:bg-gold",
              )}
              style={{ width: `${timeProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="h-2 overflow-hidden rounded-full bg-surface-secondary dark:bg-surface-dark-secondary">
        <div
          className="h-full rounded-full bg-bordeaux transition-all duration-300 dark:bg-bordeaux-dark"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card hoverLift={false}>
        <CardHeader>
          <CardTitle className="text-xl leading-snug">
            {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...currentQuestion.answers]
            .sort((left, right) => left.order - right.order)
            .map((answer) => {
              const isSelected =
                pendingAnswerId === answer.id || existingSelection === answer.id;

              return (
                <button
                  key={answer.id}
                  type="button"
                  disabled={isRevealed || isLoadingFeedback}
                  onClick={() => setPendingAnswerId(answer.id)}
                  className={getAnswerButtonClass(answer.id, isSelected)}
                >
                  {answer.answer_text}
                </button>
              );
            })}

          {isRevealed && currentFeedback ? (
            <div
              className={cn(
                "rounded-xl px-4 py-3 text-sm",
                currentFeedback.is_correct
                  ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-200"
                  : "bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200",
              )}
            >
              <p className="font-semibold">
                {currentFeedback.is_correct
                  ? "Resposta correcta!"
                  : "Resposta incorrecta."}
              </p>
              {!currentFeedback.is_correct &&
              currentFeedback.correct_answer_text ? (
                <p className="mt-1">
                  A resposta correcta é: {currentFeedback.correct_answer_text}
                </p>
              ) : null}
              {currentFeedback.explanation ? (
                <p className="mt-2 text-content-secondary dark:text-content-dark-secondary">
                  {currentFeedback.explanation}
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          disabled={
            isLoadingFeedback ||
            (!isRevealed &&
              pendingAnswerId === null &&
              existingSelection === null)
          }
          onClick={() => void confirmAnswer()}
        >
          {isLoadingFeedback
            ? "A verificar..."
            : isRevealed
              ? currentIndex >= questions.length - 1
                ? "Concluir quiz"
                : "Seguinte pergunta"
              : "Confirmar resposta"}
        </Button>
        {currentIndex > 0 ? (
          <Button
            type="button"
            variant="ghost"
            disabled={isLoadingFeedback}
            onClick={() => {
              const previousIndex = currentIndex - 1;
              setCurrentIndex(previousIndex);
              setPendingAnswerId(
                getSelectedForQuestion(questions[previousIndex].id),
              );
            }}
          >
            Anterior
          </Button>
        ) : null}
      </div>
    </div>
  );
}
