"use client";

import { Clock, Timer, TimerOff } from "lucide-react";
import { Input } from "@/components/ui/Input";
import {
  formatTimeLimitInputSummary,
  TIME_LIMIT_PRESETS_MINUTES,
  type QuizFormValues,
  type TimeLimitUnit,
} from "@/components/admin/quiz-types";
import { cn } from "@/lib/utils";

interface QuizTimeLimitFieldProps {
  values: Pick<
    QuizFormValues,
    "time_limit_enabled" | "time_limit_value" | "time_limit_unit"
  >;
  onChange: (
    patch: Partial<
      Pick<
        QuizFormValues,
        "time_limit_enabled" | "time_limit_value" | "time_limit_unit"
      >
    >,
  ) => void;
}

const UNIT_OPTIONS: Array<{
  value: TimeLimitUnit;
  label: string;
  hint: string;
}> = [
  { value: "minutes", label: "Minutos", hint: "Ex.: 5 = 5 minutos" },
  { value: "seconds", label: "Segundos", hint: "Ex.: 90 = 1 min 30 s" },
];

export function QuizTimeLimitField({ values, onChange }: QuizTimeLimitFieldProps) {
  const summary = formatTimeLimitInputSummary(
    values.time_limit_enabled,
    values.time_limit_value,
    values.time_limit_unit,
  );

  return (
    <fieldset className="space-y-3 md:col-span-2">
      <legend className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
        Tempo limite do quiz
      </legend>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => onChange({ time_limit_enabled: false })}
          className={cn(
            "rounded-xl border p-4 text-left transition-all",
            !values.time_limit_enabled
              ? "border-bordeaux bg-bordeaux/5 ring-2 ring-bordeaux/30 dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:ring-bordeaux-dark/30"
              : "border-border bg-surface-card hover:border-border dark:border-border-dark dark:bg-surface-dark-card dark:hover:border-border-dark",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                !values.time_limit_enabled
                  ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                  : "bg-surface-secondary text-content-secondary dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
              )}
            >
              <TimerOff className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <span>
              <span className="block font-display font-bold text-content-primary dark:text-content-dark-primary">
                Sem limite
              </span>
              <span className="mt-1 block text-sm text-content-secondary dark:text-content-dark-secondary">
                O utilizador pode responder ao ritmo dele, sem cronómetro.
              </span>
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={() =>
            onChange({
              time_limit_enabled: true,
              time_limit_value: values.time_limit_value || "5",
              time_limit_unit: values.time_limit_unit,
            })
          }
          className={cn(
            "rounded-xl border p-4 text-left transition-all",
            values.time_limit_enabled
              ? "border-bordeaux bg-bordeaux/5 ring-2 ring-bordeaux/30 dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:ring-bordeaux-dark/30"
              : "border-border bg-surface-card hover:border-border dark:border-border-dark dark:bg-surface-dark-card dark:hover:border-border-dark",
          )}
        >
          <div className="flex items-start gap-3">
            <span
              className={cn(
                "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                values.time_limit_enabled
                  ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                  : "bg-surface-secondary text-content-secondary dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
              )}
            >
              <Timer className="h-5 w-5" strokeWidth={1.5} />
            </span>
            <span>
              <span className="block font-display font-bold text-content-primary dark:text-content-dark-primary">
                Com limite
              </span>
              <span className="mt-1 block text-sm text-content-secondary dark:text-content-dark-secondary">
                Define quanto tempo o utilizador tem para concluir o quiz.
              </span>
            </span>
          </div>
        </button>
      </div>

      {values.time_limit_enabled ? (
        <div className="space-y-4 rounded-xl border border-border bg-surface-card p-4 dark:border-border-dark dark:bg-surface-dark-card">
          <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
                Duração
              </span>
              <Input
                type="number"
                min={1}
                max={values.time_limit_unit === "minutes" ? 120 : 7200}
                value={values.time_limit_value}
                onChange={(event) =>
                  onChange({ time_limit_value: event.target.value })
                }
                placeholder={
                  values.time_limit_unit === "minutes" ? "Ex.: 5" : "Ex.: 90"
                }
              />
            </label>

            <fieldset className="space-y-2">
              <legend className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
                Unidade
              </legend>
              <div className="inline-flex rounded-lg border border-border p-1 dark:border-border-dark">
                {UNIT_OPTIONS.map((option) => {
                  const isSelected = values.time_limit_unit === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onChange({ time_limit_unit: option.value })}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                        isSelected
                          ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                          : "text-content-secondary hover:bg-surface-secondary dark:text-content-dark-secondary dark:hover:bg-surface-dark-secondary",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
            {UNIT_OPTIONS.find((option) => option.value === values.time_limit_unit)
              ?.hint ?? ""}{" "}
            · Mínimo 30 segundos · Máximo 2 horas.
          </p>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
              Atalhos rápidos
            </p>
            <div className="flex flex-wrap gap-2">
              {TIME_LIMIT_PRESETS_MINUTES.map((minutes) => (
                <button
                  key={minutes}
                  type="button"
                  onClick={() =>
                    onChange({
                      time_limit_enabled: true,
                      time_limit_value: String(minutes),
                      time_limit_unit: "minutes",
                    })
                  }
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                    values.time_limit_unit === "minutes" &&
                      values.time_limit_value === String(minutes)
                      ? "border-bordeaux bg-bordeaux/10 text-bordeaux dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:text-bordeaux-dark"
                      : "border-border bg-surface-secondary text-content-secondary hover:border-border dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
                  )}
                >
                  {minutes} min
                </button>
              ))}
            </div>
          </div>

          <p className="inline-flex items-center gap-2 rounded-lg bg-petrol/5 px-3 py-2 text-sm text-petrol dark:bg-petrol-dark/10 dark:text-petrol-dark">
            <Clock className="h-4 w-4 shrink-0" strokeWidth={1.5} />
            O sistema guardará <strong className="font-semibold">{summary}</strong>{" "}
            na API.
          </p>
        </div>
      ) : null}
    </fieldset>
  );
}
