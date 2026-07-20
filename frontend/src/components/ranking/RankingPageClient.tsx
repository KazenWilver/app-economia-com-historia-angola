"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import { RankingFilters } from "@/components/ranking/RankingFilters";
import { RankingTable } from "@/components/ranking/RankingTable";
import {
  buildRankingsQuery,
  type RankingEntry,
  type RankingsResponse,
  type ProvincesResponse,
} from "@/components/ranking/ranking-types";
import type { PublicQuizzesResponse } from "@/components/quiz/quiz-types";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { apiFetch } from "@/lib/api";

function RankingSkeleton() {
  return (
    <Card hoverLift={false}>
      <CardContent className="space-y-4 pt-6">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}

interface RankingPageClientProps {
  initialRankings: RankingEntry[];
  initialMeta: RankingsResponse["meta"] | null;
  initialQuizzes: PublicQuizzesResponse["data"];
  initialProvinces: ProvincesResponse["data"];
  initialError: string | null;
}

export function RankingPageClient({
  initialRankings,
  initialMeta,
  initialQuizzes,
  initialProvinces,
  initialError,
}: RankingPageClientProps) {
  const [scope, setScope] = useState<"national" | "region">("national");
  const [selectedQuizId, setSelectedQuizId] = useState("all");
  const [selectedProvinceId, setSelectedProvinceId] = useState("all");
  const [quizzes, setQuizzes] =
    useState<PublicQuizzesResponse["data"]>(initialQuizzes);
  const [provinces, setProvinces] =
    useState<ProvincesResponse["data"]>(initialProvinces);
  const [rankings, setRankings] = useState<RankingsResponse["data"]>(
    initialRankings,
  );
  const [meta, setMeta] = useState<RankingsResponse["meta"] | null>(
    initialMeta,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);
  const [filtersDirty, setFiltersDirty] = useState(false);

  const rankingsPath = useMemo(
    () =>
      buildRankingsQuery({
        quizId: selectedQuizId,
        provinceId: scope === "region" ? selectedProvinceId : undefined,
      }),
    [scope, selectedProvinceId, selectedQuizId],
  );

  const loadFilters = useCallback(async () => {
    if (initialQuizzes.length > 0 && initialProvinces.length > 0) {
      return;
    }

    try {
      const [quizzesData, provincesData] = await Promise.all([
        apiFetch<PublicQuizzesResponse>("/quizzes", { cacheTtlMs: 60_000 }),
        apiFetch<ProvincesResponse>("/provinces", { cacheTtlMs: 300_000 }),
      ]);

      setQuizzes(quizzesData.data);
      setProvinces(provincesData.data);
    } catch {
      setErrorMessage("Não foi possível carregar os filtros do ranking.");
    }
  }, [initialProvinces.length, initialQuizzes.length]);

  const loadRankings = useCallback(async (options?: { silent?: boolean }) => {
    if (scope === "region" && selectedProvinceId === "all") {
      setRankings([]);
      setMeta({
        scope: "region",
        quiz_id: selectedQuizId === "all" ? null : Number(selectedQuizId),
        province_id: null,
        total: 0,
      });
      if (!options?.silent) {
        setIsLoading(false);
      }
      return;
    }

    if (!options?.silent) {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const data = await apiFetch<RankingsResponse>(rankingsPath, {
        cacheTtlMs: 30_000,
        cacheKey: rankingsPath,
        skipCache: Boolean(options?.silent),
      });

      setRankings(data.data);
      setMeta(data.meta);
    } catch {
      setRankings([]);
      setMeta(null);
      setErrorMessage("Não foi possível carregar o ranking.");
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, [rankingsPath, scope, selectedProvinceId, selectedQuizId]);

  useEffect(() => {
    void loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    if (!filtersDirty) {
      return;
    }

    void loadRankings();
  }, [filtersDirty, loadRankings]);

  useLiveRefresh(loadRankings, { runOnMount: false });

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/quiz"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-bordeaux hover:underline dark:text-bordeaux-dark"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Voltar aos quizzes
      </Link>

      <header className="mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 font-display text-xs font-semibold tracking-display text-gold dark:bg-gold-dark/15 dark:text-gold-dark">
          <Trophy className="h-3.5 w-3.5" strokeWidth={1.5} />
          Ranking
        </div>
        <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
          Classificação
        </h1>
        <p className="max-w-2xl text-content-secondary dark:text-content-dark-secondary">
          Vê as melhores pontuações a nível nacional ou filtra por província.
          Os três primeiros lugares recebem medalhas douradas.
        </p>
      </header>

      {errorMessage ? (
        <Toast
          variant="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      ) : null}

      <div className="space-y-6">
        <RankingFilters
          scope={scope}
          selectedQuizId={selectedQuizId}
          selectedProvinceId={selectedProvinceId}
          quizzes={quizzes}
          provinces={provinces}
          onScopeChange={(nextScope) => {
            setFiltersDirty(true);
            setScope(nextScope);
            if (nextScope === "national") {
              setSelectedProvinceId("all");
            }
          }}
          onQuizChange={(quizId) => {
            setFiltersDirty(true);
            setSelectedQuizId(quizId);
          }}
          onProvinceChange={(provinceId) => {
            setFiltersDirty(true);
            setSelectedProvinceId(provinceId);
          }}
        />

        {scope === "region" && selectedProvinceId === "all" ? (
          <Card hoverLift={false}>
            <CardContent className="py-12 text-center text-content-secondary dark:text-content-dark-secondary">
              Selecciona uma província para ver o ranking regional.
            </CardContent>
          </Card>
        ) : isLoading ? (
          <RankingSkeleton />
        ) : (
          <>
            {meta ? (
              <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
                {meta.total} participante{meta.total === 1 ? "" : "s"} ·{" "}
                {meta.scope === "national" ? "Âmbito nacional" : "Por região"}
              </p>
            ) : null}
            <RankingTable entries={rankings} />
          </>
        )}
      </div>
    </div>
  );
}
