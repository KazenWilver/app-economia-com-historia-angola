"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { QuizCard } from "@/components/quiz/QuizCard";
import type { PublicQuizzesResponse } from "@/components/quiz/quiz-types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";

function QuizCardSkeleton() {
  return (
    <Card hoverLift={false} className="h-full">
      <div className="space-y-4 p-6">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
}

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState<PublicQuizzesResponse["data"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadQuizzes = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<PublicQuizzesResponse>("/quizzes", {
        cacheTtlMs: 60_000,
      });
      setQuizzes(data.data);
    } catch {
      setQuizzes([]);
      setErrorMessage("Não foi possível carregar os quizzes.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQuizzes();
  }, [loadQuizzes]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
            Quizzes
          </h1>
          <p className="max-w-2xl text-content-secondary dark:text-content-dark-secondary">
            Testa o que aprendeste sobre a economia e a história de Angola. Recebes
            feedback imediato em cada pergunta e vês a pontuação final.
          </p>
        </div>
        <Link href="/ranking">
          <Button type="button" variant="secondary" className="inline-flex items-center gap-2">
            <Trophy className="h-4 w-4 text-gold dark:text-gold-dark" strokeWidth={1.5} />
            Ver ranking
          </Button>
        </Link>
      </header>

      {errorMessage ? (
        <Toast variant="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <QuizCardSkeleton />
          <QuizCardSkeleton />
          <QuizCardSkeleton />
        </div>
      ) : quizzes.length === 0 ? (
        <Card hoverLift={false}>
          <CardContent className="py-12 text-center text-content-secondary dark:text-content-dark-secondary">
            Ainda não há quizzes activos disponíveis.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}
