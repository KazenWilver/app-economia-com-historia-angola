"use client";

import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Circle,
  Map,
  MessageSquare,
  Route,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type {
  LearningPath,
  LearningPathMeta,
  LearningPathResponse,
  LearningPathStep,
  LearningStepType,
} from "@shared/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

const STEP_ICONS: Record<LearningStepType, typeof BookOpen> = {
  content: BookOpen,
  quiz: Sparkles,
  map: Map,
  forum: MessageSquare,
};

const STEP_LABELS: Record<LearningStepType, string> = {
  content: "Conteúdo",
  quiz: "Quiz",
  map: "Mapa",
  forum: "Fórum",
};

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-surface-secondary dark:bg-surface-dark-secondary"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Progresso do trilho"
    >
      <div
        className="h-full rounded-full bg-bordeaux transition-[width] duration-500 dark:bg-bordeaux-dark"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

export function LearningPathView() {
  const { isAuthenticated } = useAuth();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [meta, setMeta] = useState<LearningPathMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const loadPath = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<LearningPathResponse>("/learning-path", {
        cacheTtlMs: 0,
      });
      setPath(data.data);
      setMeta(data.meta);
    } catch {
      setPath(null);
      setMeta(null);
      setErrorMessage("Não foi possível carregar o trilho educativo.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPath();
  }, [loadPath, isAuthenticated]);

  const handleComplete = async (step: LearningPathStep) => {
    if (!isAuthenticated) {
      setInfoMessage("Inicia sessão para guardares o teu progresso.");
      return;
    }

    setCompletingId(step.id);
    try {
      const data = await apiFetch<{
        data: LearningPath | null;
        meta: LearningPathMeta;
        message: string;
      }>(`/learning-path/steps/${step.id}/complete`, {
        method: "POST",
      });
      setPath(data.data);
      setMeta(data.meta);
      setInfoMessage("Passo marcado como concluído.");
    } catch {
      setErrorMessage("Não foi possível concluir este passo.");
    } finally {
      setCompletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-10 sm:px-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!path || !meta) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center sm:px-6">
        <Route className="mx-auto h-10 w-10 text-petrol" strokeWidth={1.5} />
        <p className="mt-4 font-display text-lg font-semibold">
          {errorMessage ?? "Ainda não há trilho activo."}
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      {(errorMessage || infoMessage) && (
        <div className="mb-6 space-y-2">
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
        </div>
      )}

      <header className="mb-8 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-petrol/25 bg-petrol/10 px-3 py-1 text-xs font-semibold text-petrol dark:border-petrol-dark/30 dark:bg-petrol-dark/15 dark:text-petrol-dark">
          <Route className="h-3.5 w-3.5" strokeWidth={1.5} />
          Trilho educativo
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-display text-content-primary dark:text-content-dark-primary">
          {path.title}
        </h1>
        {path.description ? (
          <p className="max-w-2xl text-base text-content-secondary dark:text-content-dark-secondary">
            {path.description}
          </p>
        ) : null}

        <Card hoverLift={false}>
          <CardContent className="space-y-3 py-5">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <p className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary">
                O teu progresso
              </p>
              <p className="font-mono text-sm tabular-nums text-bordeaux dark:text-bordeaux-dark">
                {meta.completed_count}/{meta.total_count} · {meta.percent}%
              </p>
            </div>
            <ProgressBar percent={meta.percent} />
            {!isAuthenticated ? (
              <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
                <Link href="/login?redirect=%2Ftrilho" className="font-semibold text-bordeaux dark:text-bordeaux-dark">
                  Entra na tua conta
                </Link>{" "}
                para guardares o progresso automaticamente.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </header>

      <ol className="space-y-4">
        {path.steps.map((step, index) => {
          const Icon = STEP_ICONS[step.step_type];
          const isCompleted = step.is_completed;

          return (
            <li key={step.id}>
              <Card
                hoverLift={false}
                className={
                  isCompleted
                    ? "border-petrol/40 dark:border-petrol-dark/40"
                    : undefined
                }
              >
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <span
                    className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      isCompleted
                        ? "bg-petrol/15 text-petrol dark:bg-petrol-dark/20 dark:text-petrol-dark"
                        : "bg-bordeaux/10 text-bordeaux dark:bg-bordeaux-dark/15 dark:text-bordeaux-dark"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                    ) : (
                      <Circle className="h-4 w-4" strokeWidth={1.5} />
                    )}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                      Passo {index + 1} · {STEP_LABELS[step.step_type]}
                    </p>
                    <CardTitle className="text-lg">{step.title}</CardTitle>
                    {step.description ? (
                      <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
                        {step.description}
                      </p>
                    ) : null}
                  </div>
                  <Icon
                    className="hidden h-5 w-5 shrink-0 text-content-tertiary sm:block dark:text-content-dark-tertiary"
                    strokeWidth={1.5}
                  />
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 pt-0">
                  <Link href={step.href}>
                    <Button variant="primary" className="min-h-10">
                      {isCompleted ? "Rever" : "Começar"}
                    </Button>
                  </Link>
                  {!isCompleted &&
                  (step.step_type === "map" || step.step_type === "forum") ? (
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-10"
                      disabled={completingId === step.id}
                      onClick={() => void handleComplete(step)}
                    >
                      {completingId === step.id
                        ? "A guardar…"
                        : "Marcar como concluído"}
                    </Button>
                  ) : null}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
