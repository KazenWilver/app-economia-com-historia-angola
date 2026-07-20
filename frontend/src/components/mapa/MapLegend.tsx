"use client";

import { BookOpen, Circle, MapPin, Moon, Video } from "lucide-react";

interface MapLegendProps {
  nightMode?: boolean;
}

export function MapLegend({ nightMode = false }: MapLegendProps) {
  return (
    <div
      className={`pointer-events-none absolute bottom-3 left-3 z-[500] w-[min(92vw,15.5rem)] rounded-2xl border px-3.5 py-3 shadow-lg backdrop-blur-md ${
        nightMode
          ? "border-bordeaux/40 bg-slate-950/85 text-slate-100"
          : "border-border/80 bg-surface-card/92 text-content-primary dark:border-border-dark dark:bg-surface-dark-card/92 dark:text-content-dark-primary"
      }`}
    >
      <p
        className={`mb-2.5 text-[11px] font-bold uppercase tracking-wide ${
          nightMode
            ? "text-gold"
            : "text-content-tertiary dark:text-content-dark-tertiary"
        }`}
      >
        Legenda
      </p>
      <ul className="space-y-2 text-xs">
        <li className="flex items-center gap-2.5">
          <span
            className="h-3.5 w-3.5 shrink-0 rounded-sm"
            style={{ backgroundColor: "#2C7A7B" }}
            aria-hidden
          />
          <span>Com narrativas</span>
        </li>
        <li className="flex items-center gap-2.5">
          <span
            className="h-3.5 w-3.5 shrink-0 rounded-sm opacity-50"
            style={{ backgroundColor: "#3D8B8C" }}
            aria-hidden
          />
          <span>Sem narrativas</span>
        </li>
        <li className="flex items-center gap-2.5">
          <span
            className="h-3.5 w-3.5 shrink-0 rounded-sm"
            style={{ backgroundColor: "#8A1538" }}
            aria-hidden
          />
          <span>Província seleccionada</span>
        </li>
        <li className="flex items-center gap-2.5">
          <MapPin
            className="h-3.5 w-3.5 shrink-0 text-gold"
            strokeWidth={1.5}
            aria-hidden
          />
          <span className="flex items-center gap-1.5">
            Capital
            <Circle
              className="h-2 w-2 fill-gold text-gold"
              strokeWidth={0}
              aria-hidden
            />
          </span>
        </li>
        <li className="flex items-center gap-2.5">
          <BookOpen
            className="h-3.5 w-3.5 shrink-0 text-petrol dark:text-petrol-dark"
            strokeWidth={1.5}
            aria-hidden
          />
          <span>Narrativas (texto)</span>
        </li>
        <li className="flex items-center gap-2.5">
          <Video
            className="h-3.5 w-3.5 shrink-0 text-bordeaux dark:text-bordeaux-dark"
            strokeWidth={1.5}
            aria-hidden
          />
          <span>Conteúdo rico (3+ narrativas)</span>
        </li>
        {nightMode ? (
          <li className="flex items-center gap-2.5 pt-0.5">
            <Moon className="h-3.5 w-3.5 shrink-0 text-gold" strokeWidth={1.5} />
            <span>Modo noite activo</span>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
