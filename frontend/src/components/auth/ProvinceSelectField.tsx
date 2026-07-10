"use client";

import { cn } from "@/lib/utils";

import type { Province } from "@shared/types";

export type ProvinceOption = Province;

export interface ProvinceSelectFieldProps {
  label?: string;
  value: string;
  provinces: ProvinceOption[];
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
}

export function ProvinceSelectField({
  label = "Província",
  value,
  provinces,
  onChange,
  error,
  className,
  labelClassName,
  disabled = false,
}: ProvinceSelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor="province_id"
        className={cn("text-sm font-medium text-content-primary", labelClassName)}
      >
        {label}
      </label>

      <select
        id="province_id"
        name="province_id"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "min-h-11 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-content-primary outline-none transition-colors focus:border-bordeaux focus:ring-2 focus:ring-bordeaux/20 dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary dark:focus:border-bordeaux-dark dark:focus:ring-bordeaux-dark/20",
          error && "border-error-light dark:border-error-dark",
          className,
        )}
      >
        <option value="">Selecciona a tua província</option>
        {provinces.map((province) => (
          <option key={province.id} value={String(province.id)}>
            {province.name}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-sm text-error-light dark:text-error-dark">{error}</p>
      ) : null}
    </div>
  );
}
