"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import type {
  AdminForum,
  TopicFormValues,
  TopicVisibilityMode,
} from "@/components/admin/forum-types";
import { cn } from "@/lib/utils";

interface TopicFormProps {
  initialValues: TopicFormValues;
  forums: AdminForum[];
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: TopicFormValues) => Promise<void>;
  onCancel: () => void;
}

const VISIBILITY_OPTIONS: {
  value: TopicVisibilityMode;
  label: string;
  description: string;
  icon: typeof Eye;
}[] = [
  {
    value: "public",
    label: "Público",
    description: "Visível para todos os visitantes em /forum.",
    icon: Eye,
  },
  {
    value: "private",
    label: "Privado",
    description: "Só utilizadores com login podem ver e participar.",
    icon: Lock,
  },
  {
    value: "hidden",
    label: "Oculto",
    description: "Não aparece na área pública. Útil para preparar o debate.",
    icon: EyeOff,
  },
];

export function TopicForm({
  initialValues,
  forums,
  submitLabel,
  isSubmitting,
  errorMessage,
  onSubmit,
  onCancel,
}: TopicFormProps) {
  const [values, setValues] = useState<TopicFormValues>(initialValues);
  const [localError, setLocalError] = useState<string | null>(null);
  const singleForum = forums.length === 1 ? forums[0] : null;

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    if (singleForum && values.forum_id !== String(singleForum.id)) {
      setValues((current) => ({
        ...current,
        forum_id: String(singleForum.id),
      }));
    }
  }, [singleForum, values.forum_id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!values.forum_id) {
      setLocalError("Não foi possível carregar o fórum. Recarrega a página.");
      return;
    }

    if (!values.title.trim()) {
      setLocalError("O título é obrigatório.");
      return;
    }

    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage ? <Toast variant="error" message={errorMessage} /> : null}
      {localError ? <Toast variant="error" message={localError} /> : null}

      {singleForum ? (
        <div className="rounded-xl border border-petrol/20 bg-petrol/5 p-4 dark:border-petrol-dark/30 dark:bg-petrol-dark/10">
          <p className="text-xs font-semibold uppercase tracking-wide text-petrol dark:text-petrol-dark">
            Fórum
          </p>
          <p className="mt-1 font-display text-lg font-bold text-content-primary dark:text-content-dark-primary">
            {singleForum.name}
          </p>
          {singleForum.description ? (
            <p className="mt-2 text-sm text-content-secondary dark:text-content-dark-secondary">
              {singleForum.description}
            </p>
          ) : null}
          <p className="mt-3 text-xs text-content-tertiary dark:text-content-dark-tertiary">
            Os tópicos são debates dentro deste fórum. Não precisas de criar
            fóruns separados — o Jindungo usa um espaço central de debates.
          </p>
        </div>
      ) : (
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
            Fórum
          </span>
          <select
            value={values.forum_id}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                forum_id: event.target.value,
              }))
            }
            className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-content-primary outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
            required
          >
            <option value="">Seleccionar fórum</option>
            {forums.map((forum) => (
              <option key={forum.id} value={forum.id}>
                {forum.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
          Título do tópico
        </span>
        <Input
          value={values.title}
          onChange={(event) =>
            setValues((current) => ({ ...current, title: event.target.value }))
          }
          placeholder="Ex.: O impacto do petróleo na economia angolana"
          required
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
          Descrição
        </span>
        <textarea
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          rows={4}
          className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-content-primary outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
          placeholder="Contexto do debate"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
          Tema
        </span>
        <Input
          value={values.theme}
          onChange={(event) =>
            setValues((current) => ({ ...current, theme: event.target.value }))
          }
          placeholder="Ex.: Petróleo, agricultura, comércio"
        />
      </label>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
          Visibilidade do tópico
        </legend>
        <div className="grid gap-3 md:grid-cols-3">
          {VISIBILITY_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = values.visibility === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValues((current) => ({
                    ...current,
                    visibility: option.value,
                  }))
                }
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  isSelected
                    ? "border-bordeaux bg-bordeaux/5 ring-2 ring-bordeaux/30 dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:ring-bordeaux-dark/30"
                    : "border-border bg-surface-card hover:border-border dark:border-border-dark dark:bg-surface-dark-card dark:hover:border-border-dark",
                )}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                      isSelected
                        ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                        : "bg-surface-secondary text-content-secondary dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <span>
                    <span className="block font-display font-bold text-content-primary dark:text-content-dark-primary">
                      {option.label}
                    </span>
                    <span className="mt-1 block text-sm text-content-secondary dark:text-content-dark-secondary">
                      {option.description}
                    </span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </fieldset>

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
