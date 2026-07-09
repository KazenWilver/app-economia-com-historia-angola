"use client";

import type { CreateTopicFormValues } from "@/components/forum/forum-types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

export interface CreateTopicFormProps {
  values: CreateTopicFormValues;
  onChange: (values: CreateTopicFormValues) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

const visibilityOptions: Array<{
  value: CreateTopicFormValues["visibility"];
  label: string;
  description: string;
}> = [
  {
    value: "public",
    label: "Público",
    description: "Visível para toda a comunidade no fórum.",
  },
  {
    value: "private",
    label: "Privado",
    description: "Só tu consegues aceder ao tópico pelo link directo.",
  },
];

export function CreateTopicForm({
  values,
  onChange,
  onSubmit,
  isSubmitting = false,
  errorMessage = null,
}: CreateTopicFormProps) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Input
        label="Título"
        name="title"
        value={values.title}
        placeholder="Ex.: Qual o impacto do petróleo na economia angolana?"
        onChange={(event) =>
          onChange({ ...values, title: event.target.value })
        }
      />

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="description"
          className="font-display text-sm font-medium text-content-primary dark:text-content-dark-primary"
        >
          Descrição
        </label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          rows={5}
          placeholder="Apresenta o contexto do debate e o que gostarias que a comunidade discutisse."
          className="w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-content-primary transition-colors duration-200 placeholder:text-content-tertiary focus:border-petrol focus:outline-none focus:ring-2 focus:ring-petrol/20 dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary dark:placeholder:text-content-dark-tertiary dark:focus:border-petrol-dark dark:focus:ring-petrol-dark/20"
          onChange={(event) =>
            onChange({ ...values, description: event.target.value })
          }
        />
      </div>

      <Input
        label="Tema (opcional)"
        name="theme"
        value={values.theme}
        placeholder="Ex.: Petróleo, agricultura, independência"
        onChange={(event) =>
          onChange({ ...values, theme: event.target.value })
        }
      />

      <fieldset className="space-y-3">
        <legend className="font-display text-sm font-medium text-content-primary dark:text-content-dark-primary">
          Visibilidade
        </legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {visibilityOptions.map((option) => {
            const isSelected = values.visibility === option.value;

            return (
              <label
                key={option.value}
                className={cn(
                  "cursor-pointer rounded-xl border p-4 transition-colors",
                  isSelected
                    ? "border-petrol bg-petrol/5 dark:border-petrol-dark dark:bg-petrol-dark/10"
                    : "border-border hover:border-petrol/40 dark:border-border-dark dark:hover:border-petrol-dark/40",
                )}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={isSelected}
                  className="sr-only"
                  onChange={() =>
                    onChange({ ...values, visibility: option.value })
                  }
                />
                <p className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary">
                  {option.label}
                </p>
                <p className="mt-1 text-xs text-content-secondary dark:text-content-dark-secondary">
                  {option.description}
                </p>
              </label>
            );
          })}
        </div>
      </fieldset>

      {errorMessage ? (
        <p className="text-sm text-error-light dark:text-error-dark" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" className="w-full sm:w-auto" isLoading={isSubmitting}>
        Publicar tópico
      </Button>
    </form>
  );
}
