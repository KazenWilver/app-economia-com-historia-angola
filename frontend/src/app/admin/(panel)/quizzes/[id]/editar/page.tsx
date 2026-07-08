"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { QuizForm } from "@/components/admin/QuizForm";
import {
  emptyQuizForm,
  formValuesToPayload,
  quizToFormValues,
  type AdminQuiz,
  type AdminQuizResponse,
  type QuizFormValues,
  type QuizMutationResponse,
} from "@/components/admin/quiz-types";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminFetch } from "@/lib/admin-api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";

export default function AdminEditQuizPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const quizId = params.id;
  const { token } = useAdminAuth();

  const [quiz, setQuiz] = useState<AdminQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialValues = useMemo(
    () => (quiz ? quizToFormValues(quiz) : emptyQuizForm()),
    [quiz],
  );

  const loadQuiz = useCallback(async () => {
    if (!token || !quizId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await adminFetch<AdminQuizResponse>(`/admin/quizzes/${quizId}`, {
        token,
      });
      setQuiz(data.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o quiz.",
      );
      setQuiz(null);
    } finally {
      setIsLoading(false);
    }
  }, [quizId, token]);

  useEffect(() => {
    void loadQuiz();
  }, [loadQuiz]);

  const handleSubmit = async (values: QuizFormValues) => {
    if (!token || !quizId) {
      setErrorMessage("Sessão de administrador inválida.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await adminFetch<QuizMutationResponse>(`/quizzes/${quizId}`, {
        method: "PUT",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValuesToPayload(values)),
      });

      setQuiz(data.quiz);
      setSuccessMessage("Quiz actualizado com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível actualizar o quiz.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!quiz) {
    return (
      <Card hoverLift={false}>
        <CardContent className="py-10 text-center text-slate-600 dark:text-content-dark-secondary">
          {errorMessage ?? "Quiz não encontrado."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-content-dark-primary">
          Editar quiz
        </h1>
        <p className="mt-2 text-slate-600 dark:text-content-dark-secondary">
          {quiz.title}
        </p>
      </header>

      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {successMessage}
        </p>
      ) : null}

      <Card hoverLift={false} className="border-slate-200 bg-white dark:border-border-dark dark:bg-surface-dark-card">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-content-dark-primary">
            Dados do quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuizForm
            key={`${quiz.id}-${quiz.updated_at}`}
            initialValues={initialValues}
            submitLabel="Guardar alterações"
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/quizzes")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
