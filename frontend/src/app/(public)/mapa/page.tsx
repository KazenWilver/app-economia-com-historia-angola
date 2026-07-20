"use client";

import dynamic from "next/dynamic";
import {
  Crosshair,
  LocateFixed,
  MapPinned,
  Moon,
  Mountain,
  RotateCcw,
  Sun,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { InteractiveMapHandle } from "@/components/mapa/InteractiveMap";
import { MapLegend } from "@/components/mapa/MapLegend";
import { ProvinceDetailPanel } from "@/components/mapa/ProvinceDetailPanel";
import type {
  MapProvinceDetail,
  MapProvinceDetailResponse,
} from "@/components/mapa/map-types";
import { Button } from "@/components/ui/Button";
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
    loading: () => <Skeleton className="h-full w-full" />,
  },
);

export default function MapPage() {
  const mapHandleRef = useRef<InteractiveMapHandle | null>(null);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(
    null,
  );
  const [province, setProvince] = useState<MapProvinceDetail | null>(null);
  const [isLoadingProvince, setIsLoadingProvince] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [immersive, setImmersive] = useState(false);
  const [nightMode, setNightMode] = useState(false);

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

  const handleReset = () => {
    mapHandleRef.current?.resetView();
    setInfoMessage("Vista reposta para Angola.");
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setErrorMessage("A geolocalização não está disponível neste browser.");
      return;
    }
    mapHandleRef.current?.locateUser();
    setInfoMessage("A obter a tua localização…");
  };

  const handleCenterSelection = () => {
    if (selectedProvinceId === null) {
      setInfoMessage("Selecciona primeiro uma província no mapa.");
      return;
    }
    mapHandleRef.current?.centerOnSelection();
  };

  const handleToggleImmersive = () => {
    setImmersive((current) => {
      const next = !current;
      setInfoMessage(
        next
          ? "Vista elevada activada — Angola em perspectiva 2.5D."
          : "Vista plana activada.",
      );
      return next;
    });
  };

  const handleToggleNight = () => {
    setNightMode((current) => {
      const next = !current;
      setInfoMessage(
        next
          ? "Modo noite activado — atmosfera bordeaux e petrol."
          : "Modo dia activado.",
      );
      return next;
    });
  };

  return (
    <div className="relative flex h-[calc(100dvh-4.5rem)] min-h-[560px] w-full flex-col bg-surface-secondary dark:bg-surface-dark-secondary">
      <div className="z-[600] flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface-card/95 px-4 py-3 backdrop-blur-md dark:border-border-dark dark:bg-surface-dark-card/95 sm:px-6">
        <div className="min-w-0">
          <h1 className="font-display text-lg font-bold text-content-primary dark:text-content-dark-primary sm:text-xl">
            Mapa Interactivo
          </h1>
          <p className="truncate text-xs text-content-secondary dark:text-content-dark-secondary sm:text-sm">
            21 províncias · legenda · noite · vista elevada
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={nightMode ? "primary" : "secondary"}
            className="min-h-9 px-3 text-xs sm:text-sm"
            onClick={handleToggleNight}
            aria-pressed={nightMode}
          >
            {nightMode ? (
              <Sun className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Moon className="h-4 w-4" strokeWidth={1.5} />
            )}
            <span className="hidden sm:inline">
              {nightMode ? "Dia" : "Noite"}
            </span>
          </Button>
          <Button
            type="button"
            variant={immersive ? "primary" : "secondary"}
            className="min-h-9 px-3 text-xs sm:text-sm"
            onClick={handleToggleImmersive}
            aria-pressed={immersive}
          >
            <Mountain className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">
              {immersive ? "Vista elevada" : "Elevar"}
            </span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 px-3 text-xs sm:text-sm"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Repor</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="min-h-9 px-3 text-xs sm:text-sm"
            onClick={handleLocate}
          >
            <LocateFixed className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Localizar</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-9 px-3 text-xs sm:text-sm"
            onClick={handleCenterSelection}
          >
            <Crosshair className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Centrar</span>
          </Button>
        </div>
      </div>

      {(errorMessage || infoMessage) && (
        <div className="absolute left-1/2 top-20 z-[700] w-[min(92vw,28rem)] -translate-x-1/2 space-y-2">
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

      <div className="relative grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(340px,400px)]">
        <div
          className={`relative min-h-[45vh] lg:min-h-0 ${
            immersive
              ? "overflow-visible bg-surface-secondary dark:bg-surface-dark-secondary"
              : "overflow-hidden"
          }`}
        >
          <InteractiveMap
            selectedProvinceId={selectedProvinceId}
            onProvinceSelect={handleProvinceSelect}
            immersive={immersive}
            nightMode={nightMode}
            onReady={(handle) => {
              mapHandleRef.current = handle;
            }}
            className="h-full min-h-[45vh] w-full rounded-none border-0 lg:min-h-0"
          />

          <div className="pointer-events-none absolute left-3 top-3 z-[500] flex flex-col gap-2">
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur ${
                nightMode
                  ? "border-gold/30 bg-slate-950/85 text-slate-200"
                  : "border-border/80 bg-surface-card/90 text-content-secondary dark:border-border-dark dark:bg-surface-dark-card/90 dark:text-content-dark-secondary"
              }`}
            >
              <MapPinned
                className="h-3.5 w-3.5 text-petrol dark:text-petrol-dark"
                strokeWidth={1.5}
              />
              Foco: Angola
            </div>
          </div>

          <MapLegend nightMode={nightMode} />
        </div>

        <aside className="flex min-h-[40vh] flex-col border-t border-border bg-surface-card dark:border-border-dark dark:bg-surface-dark-card lg:min-h-0 lg:border-l lg:border-t-0">
          <ProvinceDetailPanel
            province={province}
            isLoading={isLoadingProvince}
            onClose={handleClosePanel}
          />
        </aside>
      </div>
    </div>
  );
}
