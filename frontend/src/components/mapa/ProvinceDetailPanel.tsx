"use client";

import { BookOpen, MapPin, X } from "lucide-react";
import { AnimatedNarrativeCount } from "@/components/mapa/AnimatedNarrativeCount";
import {
  formatMapPeriod,
  type MapProvinceDetail,
} from "@/components/mapa/map-types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface ProvinceDetailPanelProps {
  province: MapProvinceDetail | null;
  isLoading: boolean;
  onClose: () => void;
}

export function ProvinceDetailPanel({
  province,
  isLoading,
  onClose,
}: ProvinceDetailPanelProps) {
  if (!province && !isLoading) {
    return (
      <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <MapPin
          className="h-10 w-10 text-petrol dark:text-petrol-dark"
          strokeWidth={1.5}
        />
        <p className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
          Selecciona uma província
        </p>
        <p className="max-w-sm text-sm text-content-secondary dark:text-content-dark-secondary">
          Clica numa região do mapa para explorar narrativas históricas e
          económicas de Angola.
        </p>
      </div>
    );
  }

  const narrativesCount = province?.narratives.length ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 dark:border-border-dark sm:px-5">
        <div className="min-w-0 space-y-1">
          {isLoading ? (
            <>
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-4 w-28" />
            </>
          ) : province ? (
            <>
              <h2 className="font-display text-xl font-bold text-content-primary dark:text-content-dark-primary">
                {province.name}
              </h2>
              {province.capital ? (
                <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
                  Capital: {province.capital}
                </p>
              ) : null}
              <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-petrol/25 bg-petrol/10 px-3 py-1 dark:border-petrol-dark/30 dark:bg-petrol-dark/15">
                <BookOpen
                  className="h-3.5 w-3.5 text-petrol dark:text-petrol-dark"
                  strokeWidth={1.5}
                />
                <span className="text-xs font-semibold text-petrol dark:text-petrol-dark">
                  <AnimatedNarrativeCount
                    value={narrativesCount}
                    className="font-mono tabular-nums"
                  />{" "}
                  {narrativesCount === 1 ? "narrativa" : "narrativas"}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {province ? (
          <Button
            type="button"
            variant="ghost"
            className="shrink-0"
            aria-label="Fechar painel da província"
            onClick={onClose}
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </Button>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : province && province.narratives.length > 0 ? (
          <div className="space-y-3 pb-6">
            {province.narratives.map((narrative) => (
              <article
                key={narrative.id}
                className="rounded-xl border border-border bg-surface-secondary/70 p-4 dark:border-border-dark dark:bg-surface-dark-secondary/70"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-base font-semibold text-content-primary dark:text-content-dark-primary">
                    {narrative.title}
                  </h3>
                  {narrative.period ? (
                    <Badge type="forum">
                      {formatMapPeriod(narrative.period)}
                    </Badge>
                  ) : null}
                  <Badge type="default">Ordem {narrative.display_order}</Badge>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-content-secondary dark:text-content-dark-secondary">
                  {narrative.narrative_text}
                </p>
              </article>
            ))}
          </div>
        ) : province ? (
          <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
            Ainda não existem narrativas publicadas para esta província.
          </p>
        ) : null}
      </div>
    </div>
  );
}
