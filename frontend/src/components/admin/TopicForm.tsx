"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import type { AdminForum, TopicFormValues } from "@/components/admin/forum-types";

interface TopicFormProps {
  initialValues: TopicFormValues;
  forums: AdminForum[];
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: TopicFormValues) => Promise<void>;
  onCancel: () => void;
}

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

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    if (!values.forum_id) {
      setLocalError("Selecciona um fórum.");
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

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
          Fórum
        </span>
        <select
          value={values.forum_id}
          onChange={(event) =>
            setValues((current) => ({ ...current, forum_id: event.target.value }))
          }
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
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

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
          Título
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
        <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
          Descrição
        </span>
        <textarea
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
          rows={4}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-bordeaux/30 focus:border-bordeaux focus:ring-2 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-primary"
          placeholder="Contexto do debate"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-content-dark-secondary">
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

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-border-dark dark:bg-surface-dark-secondary">
          <input
            type="checkbox"
            checked={values.is_visible}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                is_visible: event.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-slate-300 text-bordeaux focus:ring-bordeaux"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-content-dark-secondary">
            Visível na área pública
          </span>
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-border-dark dark:bg-surface-dark-secondary">
          <input
            type="checkbox"
            checked={values.is_private}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                is_private: event.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-slate-300 text-bordeaux focus:ring-bordeaux"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-content-dark-secondary">
            Debate privado (só utilizadores convidados)
          </span>
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
