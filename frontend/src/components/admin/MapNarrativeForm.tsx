"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import type {
  AdminProvince,
  MapNarrativeFormValues,
} from "@/components/admin/map-types";

interface MapNarrativeFormProps {
  initialValues: MapNarrativeFormValues;
  provinces: AdminProvince[];
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: MapNarrativeFormValues) => Promise<void>;
  onCancel: () => void;
}

export function MapNarrativeForm({
  initialValues,
  provinces,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: MapNarrativeFormProps) {
  const [values, setValues] = useState<MapNarrativeFormValues>(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!values.province_id) {
      setLocalError("Selecciona uma província.");
      return;
    }

    if (!values.title.trim()) {
      setLocalError("O título é obrigatório.");
      return;
    }

    if (!values.narrative_text.trim()) {
      setLocalError("O texto narrativo é obrigatório.");
      return;
    }

    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage ? <Toast variant="error" message={errorMessage} /> : null}
      {localError ? <Toast variant="error" message={localError} /> : null}

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
          Província
        </span>
        <select
          value={values.province_id}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              province_id: event.target.value,
            }))
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
          required
        >
          <option value="">Seleccionar província</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name} ({province.code})
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
          Título
        </span>
        <Input
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Ex.: Luanda no período colonial"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
          Texto narrativo
        </span>
        <textarea
          value={values.narrative_text}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              narrative_text: event.target.value,
            }))
          }
          rows={8}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
          placeholder="Conteúdo histórico-económico da província"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
            Período histórico
          </span>
          <Input
            value={values.period}
            onChange={(event) =>
              setValues((current) => ({ ...current, period: event.target.value }))
            }
            placeholder="Ex.: 1975-2002"
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
            Ordem de exibição
          </span>
          <Input
            type="number"
            min={0}
            value={values.display_order}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                display_order: event.target.value,
              }))
            }
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "A guardar..." : submitLabel}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
