"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QuizAiGenerator } from "@/components/admin/QuizAiGenerator";
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
  const [formValues, setFormValues] = useState<QuizFormValues>(emptyQuizForm());
  const [formKey, setFormKey] = useState(0);
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
        <h1 className="font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary">
          Novo quiz
        </h1>
        <p className="mt-2 text-content-secondary dark:text-content-dark-secondary">
          Gera uma proposta a partir de um conteúdo ou define o quiz manualmente.
          Revisa sempre as perguntas antes de publicar.
        </p>
      </header>

      <QuizAiGenerator
        onGenerated={(values) => {
          setFormValues(values);
          setFormKey((current) => current + 1);
          setErrorMessage(null);
        }}
      />

      <Card
        hoverLift={false}
        className="border-border bg-surface-card dark:border-border-dark dark:bg-surface-dark-card"
      >
        <CardHeader>
          <CardTitle className="text-content-primary dark:text-content-dark-primary">
            Dados do quiz
          </CardTitle>
        </CardHeader>
        <CardContent>
          <QuizForm
            key={formKey}
            initialValues={formValues}
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
