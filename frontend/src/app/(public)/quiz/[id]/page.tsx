"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QuizPlayer } from "@/components/quiz/QuizPlayer";
import type { PublicQuizResponse } from "@/components/quiz/quiz-types";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";

export default function QuizDetailPage() {
  const params = useParams<{ id: string }>();
  const quizId = params.id;

  const [quiz, setQuiz] = useState<PublicQuizResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadQuiz = useCallback(async () => {
    if (!quizId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<PublicQuizResponse>(`/quizzes/${quizId}`, {
        cacheTtlMs: 0,
        skipCache: true,
      });
      setQuiz(data.data);
    } catch {
      setQuiz(null);
      setErrorMessage("Quiz não encontrado ou indisponível.");
    } finally {
      setIsLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {isLoading ? (
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : errorMessage || !quiz ? (
        <div className="mx-auto max-w-xl space-y-4">
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 text-sm font-semibold text-bordeaux hover:underline dark:text-bordeaux-dark"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
            Voltar aos quizzes
          </Link>
          <Toast variant="error" message={errorMessage ?? "Quiz indisponível."} />
        </div>
      ) : quiz.questions && quiz.questions.length > 0 ? (
        <QuizPlayer quiz={quiz} />
      ) : (
        <Card hoverLift={false} className="mx-auto max-w-xl">
          <CardContent className="space-y-4 py-10 text-center">
            <p className="text-content-secondary dark:text-content-dark-secondary">
              Este quiz ainda não tem perguntas publicadas.
            </p>
            <Link
              href="/quiz"
              className="inline-flex items-center gap-2 text-sm font-semibold text-bordeaux hover:underline dark:text-bordeaux-dark"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
              Voltar aos quizzes
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
