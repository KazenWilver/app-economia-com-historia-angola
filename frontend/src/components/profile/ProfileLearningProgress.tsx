"use client";

import Link from "next/link";
import { Route } from "lucide-react";
import { useCallback, useState } from "react";
import type { LearningPathResponse } from "@shared/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { apiFetch } from "@/lib/api";

export function ProfileLearningProgress() {
  const { isAuthenticated } = useAuth();
  const [percent, setPercent] = useState<number | null>(null);
  const [label, setLabel] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const loadProgress = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!isAuthenticated) {
        setIsLoading(false);
        setPercent(null);
        setLabel("");
        return;
      }

      if (!options?.silent) {
        setIsLoading(true);
      }

      try {
        const data = await apiFetch<LearningPathResponse>("/learning-path", {
          cacheTtlMs: 15_000,
          skipCache: Boolean(options?.silent),
        });
        setPercent(data.meta.percent);
        setLabel(
          data.data
            ? `${data.meta.completed_count}/${data.meta.total_count} passos`
            : "Sem trilho activo",
        );
      } catch {
        setPercent(null);
        setLabel("Indisponível");
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated],
  );

  useLiveRefresh(loadProgress, { enabled: isAuthenticated });

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <Skeleton className="h-36 w-full" />;
  }

  return (
    <Card hoverLift={false}>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Route className="h-4 w-4 text-bordeaux dark:text-bordeaux-dark" strokeWidth={1.5} />
        <CardTitle>Trilho educativo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
          {percent === null
            ? label
            : `Progresso: ${percent}% (${label})`}
        </p>
        {percent !== null ? (
          <div className="h-2 overflow-hidden rounded-full bg-surface-secondary dark:bg-surface-dark-secondary">
            <div
              className="h-full rounded-full bg-bordeaux dark:bg-bordeaux-dark"
              style={{ width: `${percent}%` }}
            />
          </div>
        ) : null}
        <Link
          href="/trilho"
          className="inline-flex min-h-11 items-center font-display text-sm font-semibold text-bordeaux dark:text-bordeaux-dark"
        >
          Abrir trilho →
        </Link>
      </CardContent>
    </Card>
  );
}
