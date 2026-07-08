"use client";

import { cn } from "@/lib/utils";

interface ContentStatisticsProps {
  data: string;
  className?: string;
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function ContentStatistics({ data, className }: ContentStatisticsProps) {
  const trimmed = data.trim();

  if (!trimmed) {
    return null;
  }

  let parsed: Record<string, unknown> | null = null;

  try {
    const json = JSON.parse(trimmed) as unknown;

    if (json && typeof json === "object" && !Array.isArray(json)) {
      parsed = json as Record<string, unknown>;
    }
  } catch {
    parsed = null;
  }

  return (
    <section
      className={cn(
        "rounded-2xl border border-border bg-surface-card p-6 dark:border-border-dark dark:bg-surface-dark-card",
        className,
      )}
    >
      <h2 className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
        Dados estatísticos
      </h2>

      {parsed ? (
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(parsed).map(([key, value]) => (
            <div
              key={key}
              className="rounded-lg border border-border/70 bg-white/60 px-4 py-3 dark:border-border-dark dark:bg-surface-dark-secondary/60"
            >
              <dt className="text-xs font-semibold uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                {formatLabel(key)}
              </dt>
              <dd className="mt-1 font-display text-lg font-bold text-bordeaux dark:text-bordeaux-dark">
                {typeof value === "object"
                  ? JSON.stringify(value)
                  : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-content-secondary dark:text-content-dark-secondary">
          {trimmed}
        </p>
      )}
    </section>
  );
}
