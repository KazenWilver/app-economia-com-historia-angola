"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MapPin, X } from "lucide-react";
import { useRef } from "react";
import {
  formatMapPeriod,
  type MapProvinceDetail,
} from "@/components/mapa/map-types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

gsap.registerPlugin(useGSAP);

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
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!panelRef.current) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(panelRef.current, { opacity: 1, x: 0 });
        return;
      }

      gsap.fromTo(
        panelRef.current,
        { opacity: 0, x: 32 },
        { opacity: 1, x: 0, duration: 0.55, ease: "power2.out" },
      );
    },
    { dependencies: [province?.id, isLoading], scope: panelRef },
  );

  if (!province && !isLoading) {
    return (
      <Card hoverLift={false} className="h-full">
        <CardContent className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 py-12 text-center">
          <MapPin
            className="h-10 w-10 text-petrol dark:text-petrol-dark"
            strokeWidth={1.5}
          />
          <p className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
            Selecciona uma província
          </p>
          <p className="max-w-sm text-sm text-content-secondary dark:text-content-dark-secondary">
            Clica num ponto do mapa para explorar narrativas históricas e
            económicas de cada região de Angola.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={panelRef}>
      <Card hoverLift={false} className="h-full">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-28" />
              </>
            ) : province ? (
              <>
                <CardTitle className="text-2xl">{province.name}</CardTitle>
                {province.capital ? (
                  <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
                    Capital: {province.capital}
                  </p>
                ) : null}
              </>
            ) : null}
          </div>
          {province ? (
            <Button
              type="button"
              variant="ghost"
              aria-label="Fechar painel da província"
              onClick={onClose}
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : province && province.narratives.length > 0 ? (
            province.narratives.map((narrative) => (
              <article
                key={narrative.id}
                className="rounded-xl border border-border bg-surface-secondary/60 p-4 dark:border-border-dark dark:bg-surface-dark-secondary/60"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
                    {narrative.title}
                  </h3>
                  {narrative.period ? (
                    <Badge type="forum">{formatMapPeriod(narrative.period)}</Badge>
                  ) : null}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-content-secondary dark:text-content-dark-secondary">
                  {narrative.narrative_text}
                </p>
              </article>
            ))
          ) : province ? (
            <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
              Ainda não existem narrativas publicadas para esta província.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
