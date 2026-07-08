"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuizForm } from "@/components/admin/QuizForm";
import {
  emptyQuizForm,
  formValuesToPayload,
  type QuizFormValues,
  type QuizMutationResponse,
} from "@/components/admin/quiz-types";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminFetch } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function AdminCreateQuizPage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (values: QuizFormValues) => {
    if (!token) {
      setErrorMessage("Sessão de administrador inválida.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await adminFetch<QuizMutationResponse>("/quizzes", {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValuesToPayload(values)),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o quiz.",
      );
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/quizzes?created=1");
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-content-dark-primary">
          Novo quiz
        </h1>
        <p className="mt-2 text-slate-600 dark:text-content-dark-secondary">
          Define o quiz, adiciona perguntas e marca a resposta correcta em cada uma.
        </p>
      </header>

      <Card hoverLift={false} className="border-slate-200 bg-white dark:border-border-dark dark:bg-surface-dark-card">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-content-dark-primary">
            Dados do quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuizForm
            initialValues={emptyQuizForm()}
            submitLabel="Criar quiz"
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
