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
        <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
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
          className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-content-primary outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
          required
        >
          <option value="">Seleccionar província</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name} ({province.code})
            </option>
          ))}
        </select>
        <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
          A narrativa ficará associada a esta província no mapa público.
        </p>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
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
        <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
          Nome curto que o utilizador vê ao seleccionar a província no mapa.
        </p>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
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
          className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-content-primary outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
          placeholder="Descreve factos históricos e económicos relevantes para a região"
          required
        />
        <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
          Texto completo apresentado no painel lateral do mapa interactivo.
        </p>
      </label>

      <div className="rounded-xl border border-border bg-surface-secondary/50 p-4 dark:border-border-dark dark:bg-surface-dark-secondary/40">
        <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
          Os campos abaixo são opcionais, mas ajudam a organizar narrativas
          quando uma província tem mais do que um episódio histórico.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
            Período histórico
          </span>
          <Input
            value={values.period}
            onChange={(event) =>
              setValues((current) => ({ ...current, period: event.target.value }))
            }
            placeholder="Ex.: 2000-2026, colonial ou Séc. XIX"
          />
          <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
            Etiqueta temporal ou temática mostrada ao público como badge (ex.:
            «2000-2026»). Não afecta filtros — serve apenas para contextualizar
            a narrativa.
          </p>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
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
            placeholder="0"
          />
          <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
            Define a sequência quando existem várias narrativas na mesma
            província. Número menor aparece primeiro (0, 1, 2…).
          </p>
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
