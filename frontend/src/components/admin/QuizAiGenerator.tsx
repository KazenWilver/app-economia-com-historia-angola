"use client";

import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import {
  quizToFormValues,
  type QuizFormValues,
} from "@/components/admin/quiz-types";
import type { AdminContent, AdminContentsResponse } from "@/components/admin/content-types";
import { Button } from "@/components/ui/Button";
import { Toast } from "@/components/ui/Toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminFetch } from "@/lib/admin-api";

interface GeneratedQuizPayload {
  message: string;
  quiz: {
    title: string;
    description: string | null;
    time_limit_seconds: number | null;
    is_active: boolean;
    questions: Array<{
      question_text: string;
      explanation: string | null;
      order: number;
      answers: Array<{
        answer_text: string;
        is_correct: boolean;
        order: number;
      }>;
    }>;
  };
  meta: {
    provider: string;
    source_title: string | null;
  };
}

interface QuizAiGeneratorProps {
  onGenerated: (values: QuizFormValues, meta: GeneratedQuizPayload["meta"]) => void;
}

export function QuizAiGenerator({ onGenerated }: QuizAiGeneratorProps) {
  const { token } = useAdminAuth();
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [contentId, setContentId] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [questionCount, setQuestionCount] = useState("4");
  const [isLoadingContents, setIsLoadingContents] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const loadContents = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoadingContents(true);
    try {
      const data = await adminFetch<AdminContentsResponse>("/admin/contents", {
        token,
      });
      const published = data.data.filter(
        (item) => item.status === "published" && Boolean(item.body?.trim()),
      );
      setContents(published);
    } catch {
      setContents([]);
    } finally {
      setIsLoadingContents(false);
    }
  }, [token]);

  useEffect(() => {
    void loadContents();
  }, [loadContents]);

  const handleGenerate = async () => {
    if (!token) {
      setErrorMessage("Sessão de administrador inválida.");
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const payload: Record<string, string | number> = {
        question_count: Number(questionCount) || 4,
      };

      if (contentId) {
        payload.content_id = Number(contentId);
      } else if (sourceText.trim().length >= 80) {
        payload.source_text = sourceText.trim();
        payload.source_title = "Texto colado pelo administrador";
      } else {
        setErrorMessage(
          "Selecciona um conteúdo ou cola um texto com pelo menos 80 caracteres.",
        );
        setIsGenerating(false);
        return;
      }

      const data = await adminFetch<GeneratedQuizPayload>(
        "/admin/quizzes/generate-from-content",
        {
          method: "POST",
          token,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const formValues = quizToFormValues({
        id: 0,
        topic_id: null,
        title: data.quiz.title,
        description: data.quiz.description,
        time_limit_seconds: data.quiz.time_limit_seconds,
        is_active: data.quiz.is_active,
        questions_count: data.quiz.questions.length,
        attempts_count: 0,
        questions: data.quiz.questions.map((question, questionIndex) => ({
          id: questionIndex + 1,
          question_text: question.question_text,
          explanation: question.explanation ?? "",
          order: question.order,
          answers: question.answers.map((answer, answerIndex) => ({
            id: answerIndex + 1,
            answer_text: answer.answer_text,
            is_correct: answer.is_correct,
            order: answer.order,
          })),
        })),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      onGenerated(formValues, data.meta);

      const providerLabel =
        data.meta.provider === "openai"
          ? "modelo de IA (OpenAI)"
          : "assistente heurístico local";
      setInfoMessage(
        `Proposta gerada via ${providerLabel}. Revisa as perguntas antes de criar o quiz.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível gerar o quiz.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4 rounded-xl border border-bordeaux/25 bg-bordeaux/5 p-4 dark:border-bordeaux-dark/30 dark:bg-bordeaux-dark/10">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bordeaux/15 text-bordeaux dark:bg-bordeaux-dark/20 dark:text-bordeaux-dark">
          <Sparkles className="h-4 w-4" strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-content-primary dark:text-content-dark-primary">
            Gerar quiz com assistência de IA
          </h2>
          <p className="mt-1 text-sm text-content-secondary dark:text-content-dark-secondary">
            Escolhe um conteúdo publicado ou cola um texto. A proposta preenche
            o formulário para reveres e editares antes de guardar.
          </p>
        </div>
      </div>

      {errorMessage ? (
        <Toast
          variant="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
      {infoMessage ? (
        <Toast
          variant="info"
          message={infoMessage}
          onClose={() => setInfoMessage(null)}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="ai-content"
            className="mb-1.5 block font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary"
          >
            Conteúdo de origem
          </label>
          <select
            id="ai-content"
            value={contentId}
            disabled={isLoadingContents || isGenerating}
            onChange={(event) => {
              setContentId(event.target.value);
              if (event.target.value) {
                setSourceText("");
              }
            }}
            className="w-full rounded-xl border border-border bg-surface-card px-3 py-2.5 text-sm dark:border-border-dark dark:bg-surface-dark-card"
          >
            <option value="">— Seleccionar conteúdo —</option>
            {contents.map((content) => (
              <option key={content.id} value={content.id}>
                {content.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="ai-count"
            className="mb-1.5 block font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary"
          >
            Nº de perguntas
          </label>
          <select
            id="ai-count"
            value={questionCount}
            disabled={isGenerating}
            onChange={(event) => setQuestionCount(event.target.value)}
            className="w-full rounded-xl border border-border bg-surface-card px-3 py-2.5 text-sm dark:border-border-dark dark:bg-surface-dark-card"
          >
            {[3, 4, 5, 6, 7, 8].map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="ai-text"
          className="mb-1.5 block font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary"
        >
          Ou cola um texto (opcional)
        </label>
        <textarea
          id="ai-text"
          rows={4}
          value={sourceText}
          disabled={isGenerating || Boolean(contentId)}
          onChange={(event) => setSourceText(event.target.value)}
          placeholder="Cola aqui um excerto educativo em português…"
          className="w-full rounded-xl border border-border bg-surface-card px-3 py-2.5 text-sm dark:border-border-dark dark:bg-surface-dark-card"
        />
      </div>

      <Button
        type="button"
        isLoading={isGenerating}
        onClick={() => void handleGenerate()}
      >
        <Sparkles className="h-4 w-4" strokeWidth={1.5} />
        Gerar proposta de quiz
      </Button>
    </div>
  );
}
