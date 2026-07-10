"use client";

import { useEffect, useState } from "react";
import { CircleCheck, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import { QuizTimeLimitField } from "@/components/admin/QuizTimeLimitField";
import {
  emptyAnswer,
  emptyQuestion,
  secondsFromTimeLimitParts,
  type QuizFormValues,
  type QuizQuestion,
  type QuizTopicOption,
} from "@/components/admin/quiz-types";
import { adminFetch } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

interface QuizFormProps {
  initialValues: QuizFormValues;
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: QuizFormValues) => Promise<void>;
  onCancel: () => void;
}

function setCorrectAnswer(
  question: QuizQuestion,
  answerIndex: number,
): QuizQuestion {
  return {
    ...question,
    answers: question.answers.map((answer, index) => ({
      ...answer,
      is_correct: index === answerIndex,
    })),
  };
}

export function QuizForm({
  initialValues,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: QuizFormProps) {
  const [values, setValues] = useState<QuizFormValues>(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);
  const [topicOptions, setTopicOptions] = useState<QuizTopicOption[]>([]);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    let cancelled = false;

    const loadTopics = async () => {
      try {
        const data = await adminFetch<{
          data: Array<{
            id: number;
            title: string;
            theme: string | null;
          }>;
        }>("/admin/topics");

        if (cancelled) {
          return;
        }

        setTopicOptions(
          data.data.map((topic) => ({
            id: topic.id,
            title: topic.title,
            theme: topic.theme,
          })),
        );
      } catch {
        if (!cancelled) {
          setTopicOptions([]);
        }
      }
    };

    void loadTopics();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateQuestion = (
    questionIndex: number,
    updater: (question: QuizQuestion) => QuizQuestion,
  ) => {
    setValues((current) => ({
      ...current,
      questions: current.questions.map((question, index) =>
        index === questionIndex ? updater(question) : question,
      ),
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!values.title.trim()) {
      setLocalError("O título é obrigatório.");
      return;
    }

    if (values.time_limit_enabled) {
      const seconds = secondsFromTimeLimitParts(
        values.time_limit_enabled,
        values.time_limit_value,
        values.time_limit_unit,
      );

      if (seconds === null) {
        setLocalError("Indica uma duração válida para o tempo limite.");
        return;
      }

      if (seconds < 30) {
        setLocalError("O tempo limite mínimo é 30 segundos.");
        return;
      }

      if (seconds > 7200) {
        setLocalError("O tempo limite máximo é 2 horas (120 minutos).");
        return;
      }
    }

    if (values.questions.length === 0) {
      setLocalError("Adiciona pelo menos uma pergunta.");
      return;
    }

    for (const [index, question] of values.questions.entries()) {
      if (!question.question_text.trim()) {
        setLocalError(`A pergunta ${index + 1} precisa de texto.`);
        return;
      }

      if (question.answers.length < 2) {
        setLocalError(`A pergunta ${index + 1} precisa de pelo menos duas respostas.`);
        return;
      }

      const correctCount = question.answers.filter((answer) => answer.is_correct).length;

      if (correctCount !== 1) {
        setLocalError(
          `A pergunta ${index + 1} deve ter exactamente uma resposta correcta.`,
        );
        return;
      }

      for (const [answerIndex, answer] of question.answers.entries()) {
        if (!answer.answer_text.trim()) {
          setLocalError(
            `A resposta ${answerIndex + 1} da pergunta ${index + 1} está vazia.`,
          );
          return;
        }
      }
    }

    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {errorMessage ? <Toast variant="error" message={errorMessage} /> : null}
      {localError ? <Toast variant="error" message={localError} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
            Título
          </span>
          <Input
            value={values.title}
            onChange={(event) =>
              setValues((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Ex.: Economia angolana pós-independência"
            required
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
            Descrição
          </span>
          <textarea
            value={values.description}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
            placeholder="Breve introdução ao quiz"
          />
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
            Tópico do fórum (recomendado)
          </span>
          <select
            value={values.topic_id}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                topic_id: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
          >
            <option value="">Sem tópico ligado</option>
            {topicOptions.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.title}
                {topic.theme ? ` · ${topic.theme}` : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 dark:text-content-dark-tertiary">
            Liga o quiz a um tópico para recomendações usarem o tema do debate
            (não são aleatórias).
          </p>
        </label>

        <QuizTimeLimitField
          values={values}
          onChange={(patch) =>
            setValues((current) => ({
              ...current,
              ...patch,
            }))
          }
        />

        <fieldset className="space-y-3 md:col-span-2">
          <legend className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
            Estado do quiz
          </legend>
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() =>
                setValues((current) => ({ ...current, is_active: true }))
              }
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                values.is_active
                  ? "border-bordeaux bg-bordeaux/5 ring-2 ring-bordeaux/30 dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:ring-bordeaux-dark/30"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-border-dark dark:bg-surface-dark-card dark:hover:border-border-dark",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    values.is_active
                      ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                      : "bg-slate-100 text-slate-600 dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
                  )}
                >
                  <Eye className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block font-display font-bold text-slate-900 dark:text-content-dark-primary">
                    Activo
                  </span>
                  <span className="mt-1 block text-sm text-slate-600 dark:text-content-dark-secondary">
                    Visível na área pública em /quiz para todos os visitantes.
                  </span>
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setValues((current) => ({ ...current, is_active: false }))
              }
              className={cn(
                "rounded-xl border p-4 text-left transition-all",
                !values.is_active
                  ? "border-bordeaux bg-bordeaux/5 ring-2 ring-bordeaux/30 dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:ring-bordeaux-dark/30"
                  : "border-slate-200 bg-white hover:border-slate-300 dark:border-border-dark dark:bg-surface-dark-card dark:hover:border-border-dark",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    !values.is_active
                      ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                      : "bg-slate-100 text-slate-600 dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
                  )}
                >
                  <EyeOff className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <span>
                  <span className="block font-display font-bold text-slate-900 dark:text-content-dark-primary">
                    Inactivo
                  </span>
                  <span className="mt-1 block text-sm text-slate-600 dark:text-content-dark-secondary">
                    Oculto do público; só admins veem e gerem este quiz.
                  </span>
                </span>
              </div>
            </button>
          </div>
        </fieldset>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-content-dark-primary">
            Perguntas
          </h2>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              setValues((current) => ({
                ...current,
                questions: [...current.questions, emptyQuestion(current.questions.length)],
              }))
            }
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Adicionar pergunta
          </Button>
        </div>

        {values.questions.map((question, questionIndex) => (
          <div
            key={`question-${questionIndex}`}
            className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-border-dark dark:bg-surface-dark-secondary/50"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-slate-900 dark:text-content-dark-primary">
                Pergunta {questionIndex + 1}
              </h3>
              {values.questions.length > 1 ? (
                <button
                  type="button"
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      questions: current.questions.filter(
                        (_, index) => index !== questionIndex,
                      ),
                    }))
                  }
                  className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  Remover
                </button>
              ) : null}
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
                Texto da pergunta
              </span>
              <textarea
                value={question.question_text}
                onChange={(event) =>
                  updateQuestion(questionIndex, (current) => ({
                    ...current,
                    question_text: event.target.value,
                  }))
                }
                rows={2}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
                Explicação (após resposta)
              </span>
              <textarea
                value={question.explanation}
                onChange={(event) =>
                  updateQuestion(questionIndex, (current) => ({
                    ...current,
                    explanation: event.target.value,
                  }))
                }
                rows={2}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary"
                placeholder="Opcional — mostrada ao utilizador depois de responder"
              />
            </label>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
                  Respostas (marca a correcta)
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    updateQuestion(questionIndex, (current) => ({
                      ...current,
                      answers: [
                        ...current.answers,
                        emptyAnswer(current.answers.length, false),
                      ],
                    }))
                  }
                >
                  <Plus className="h-4 w-4" strokeWidth={1.5} />
                  Resposta
                </Button>
              </div>

              {question.answers.map((answer, answerIndex) => (
                <div
                  key={`answer-${questionIndex}-${answerIndex}`}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:flex-row sm:items-center dark:border-border-dark dark:bg-surface-dark-card"
                >
                  <button
                    type="button"
                    onClick={() =>
                      updateQuestion(questionIndex, (current) =>
                        setCorrectAnswer(current, answerIndex),
                      )
                    }
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                      answer.is_correct
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
                    )}
                  >
                    <CircleCheck className="h-4 w-4" strokeWidth={1.5} />
                    {answer.is_correct ? "Correcta" : "Marcar correcta"}
                  </button>

                  <Input
                    value={answer.answer_text}
                    onChange={(event) =>
                      updateQuestion(questionIndex, (current) => ({
                        ...current,
                        answers: current.answers.map((item, index) =>
                          index === answerIndex
                            ? { ...item, answer_text: event.target.value }
                            : item,
                        ),
                      }))
                    }
                    placeholder={`Resposta ${answerIndex + 1}`}
                    className="flex-1"
                  />

                  {question.answers.length > 2 ? (
                    <button
                      type="button"
                      onClick={() =>
                        updateQuestion(questionIndex, (current) => {
                          const nextAnswers = current.answers.filter(
                            (_, index) => index !== answerIndex,
                          );
                          const hasCorrect = nextAnswers.some((item) => item.is_correct);

                          return {
                            ...current,
                            answers: hasCorrect
                              ? nextAnswers
                              : nextAnswers.map((item, index) => ({
                                  ...item,
                                  is_correct: index === 0,
                                })),
                          };
                        })
                      }
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "A guardar..." : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
