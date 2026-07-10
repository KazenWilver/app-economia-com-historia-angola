"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Trophy } from "lucide-react";
import { RankingFilters } from "@/components/ranking/RankingFilters";
import { RankingTable } from "@/components/ranking/RankingTable";
import {
  buildRankingsQuery,
  type ProvincesResponse,
  type RankingsResponse,
} from "@/components/ranking/ranking-types";
import type { PublicQuizzesResponse } from "@/components/quiz/quiz-types";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
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

export default function RankingPage() {
  const [scope, setScope] = useState<"national" | "region">("national");
  const [selectedQuizId, setSelectedQuizId] = useState("all");
  const [selectedProvinceId, setSelectedProvinceId] = useState("all");
  const [quizzes, setQuizzes] = useState<PublicQuizzesResponse["data"]>([]);
  const [provinces, setProvinces] = useState<ProvincesResponse["data"]>([]);
  const [rankings, setRankings] = useState<RankingsResponse["data"]>([]);
  const [meta, setMeta] = useState<RankingsResponse["meta"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const rankingsPath = useMemo(
    () =>
      buildRankingsQuery({
        quizId: selectedQuizId,
        provinceId: scope === "region" ? selectedProvinceId : undefined,
      }),
    [scope, selectedProvinceId, selectedQuizId],
  );

  const loadFilters = useCallback(async () => {
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
  }, []);

  const loadRankings = useCallback(async () => {
    if (scope === "region" && selectedProvinceId === "all") {
      setRankings([]);
      setMeta({
        scope: "region",
        quiz_id: selectedQuizId === "all" ? null : Number(selectedQuizId),
        province_id: null,
        total: 0,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<RankingsResponse>(rankingsPath, {
        cacheTtlMs: 30_000,
        cacheKey: rankingsPath,
      });

      setRankings(data.data);
      setMeta(data.meta);
    } catch {
      setRankings([]);
      setMeta(null);
      setErrorMessage("Não foi possível carregar o ranking.");
    } finally {
      setIsLoading(false);
    }
  }, [rankingsPath, scope, selectedProvinceId, selectedQuizId]);

  useEffect(() => {
    void loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    void loadRankings();
  }, [loadRankings]);

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
        <Toast variant="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      ) : null}

      <div className="space-y-6">
        <RankingFilters
          scope={scope}
          selectedQuizId={selectedQuizId}
          selectedProvinceId={selectedProvinceId}
          quizzes={quizzes}
          provinces={provinces}
          onScopeChange={(nextScope) => {
            setScope(nextScope);
            if (nextScope === "national") {
              setSelectedProvinceId("all");
            }
          }}
          onQuizChange={setSelectedQuizId}
          onProvinceChange={setSelectedProvinceId}
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
