"use client";

import dynamic from "next/dynamic";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProvinceDetailPanel } from "@/components/mapa/ProvinceDetailPanel";
import type { MapProvinceDetail, MapProvinceDetailResponse } from "@/components/mapa/map-types";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { apiFetch } from "@/lib/api";

const InteractiveMap = dynamic(
  () =>
    import("@/components/mapa/InteractiveMap").then(
      (module) => module.InteractiveMap,
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[min(70vh,640px)] w-full rounded-2xl" />
    ),
  },
);

gsap.registerPlugin(useGSAP);

export default function MapPage() {
  const headerRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null,
  );
  const [province, setProvince] = useState<MapProvinceDetail | null>(null);
  const [isLoadingProvince, setIsLoadingProvince] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set([headerRef.current, mapSectionRef.current], {
          opacity: 1,
          y: 0,
        });
        return;
      }

      gsap.set([headerRef.current, mapSectionRef.current], { opacity: 0, y: 24 });

      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .to(headerRef.current, { opacity: 1, y: 0, duration: 0.7 })
        .to(
          mapSectionRef.current,
          { opacity: 1, y: 0, duration: 0.85, ease: "power3.out" },
          "-=0.35",
        );
    },
    { scope: headerRef },
  );

  const loadProvince = useCallback(async (provinceId: number) => {
    setIsLoadingProvince(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<MapProvinceDetailResponse>(
        `/provinces/${provinceId}`,
        { cacheTtlMs: 60_000 },
      );
      setProvince(data.data);
    } catch {
      setProvince(null);
      setErrorMessage("Não foi possível carregar a província seleccionada.");
    } finally {
      setIsLoadingProvince(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProvinceId === null) {
      setProvince(null);
      return;
    }

    void loadProvince(selectedProvinceId);
  }, [loadProvince, selectedProvinceId]);

  const handleProvinceSelect = (provinceId: number) => {
    setSelectedProvinceId(provinceId);
  };

  const handleClosePanel = () => {
    setSelectedProvinceId(null);
    setProvince(null);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header ref={headerRef} className="mb-8 space-y-2">
        <h1 className="font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary">
          Mapa Interactivo
        </h1>
        <p className="max-w-3xl text-content-secondary dark:text-content-dark-secondary">
          Explora as 21 províncias de Angola e descobre narrativas sobre economia,
          história e território. Os pontos com narrativas disponíveis aparecem
          com maior destaque no mapa.
        </p>
      </header>

      {errorMessage ? (
        <div className="mb-6">
          <Toast
            variant="error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        </div>
      ) : null}

      <div
        ref={mapSectionRef}
        className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]"
      >
        <InteractiveMap
          selectedProvinceId={selectedProvinceId}
          onProvinceSelect={handleProvinceSelect}
        />

        <ProvinceDetailPanel
          province={province}
          isLoading={isLoadingProvince}
          onClose={handleClosePanel}
        />
      </div>
    </div>
  );
}
