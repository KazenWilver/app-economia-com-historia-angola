"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import {
  CONTENT_STATUS_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  type ContentFormValues,
  type ContentType,
  resolveAdminMediaUrl,
} from "@/components/admin/content-types";
import { cn } from "@/lib/utils";

interface CategoryOption {
  id: number;
  name: string;
}

interface ContentFormProps {
  initialValues: ContentFormValues;
  categories: CategoryOption[];
  submitLabel: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  existingMediaUrl?: string | null;
  onSubmit: (values: ContentFormValues, mediaFile: File | null) => Promise<void>;
  onCancel: () => void;
}

function MediaPreview({
  type,
  previewUrl,
}: {
  type: ContentType;
  previewUrl: string | null;
}) {
  if (!previewUrl) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-tertiary">
        Sem preview de media. Carrega um ficheiro ou indica um URL.
      </p>
    );
  }

  if (type === "video") {
    return (
      <video
        key={previewUrl}
        src={previewUrl}
        controls
        className="max-h-64 w-full rounded-lg border border-slate-200 bg-black dark:border-border-dark"
      />
    );
  }

  if (type === "audio" || type === "podcast") {
    return (
      <audio
        key={previewUrl}
        src={previewUrl}
        controls
        className="w-full"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={previewUrl}
      src={previewUrl}
      alt="Pré-visualização da media"
      className="max-h-64 w-full rounded-lg border border-slate-200 object-contain dark:border-border-dark"
    />
  );
}

export function ContentForm({
  initialValues,
  categories,
  submitLabel,
  isSubmitting,
  errorMessage,
  existingMediaUrl = null,
  onSubmit,
  onCancel,
}: ContentFormProps) {
  const [values, setValues] = useState<ContentFormValues>(initialValues);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setMediaFile(null);
    setLocalPreviewUrl(null);
  }, [initialValues]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const previewUrl = useMemo(() => {
    if (localPreviewUrl) {
      return localPreviewUrl;
    }

    if (values.media_url.trim()) {
      return resolveAdminMediaUrl(values.media_url.trim());
    }

    return resolveAdminMediaUrl(existingMediaUrl);
  }, [existingMediaUrl, localPreviewUrl, values.media_url]);

  const updateField = <K extends keyof ContentFormValues>(
    field: K,
    value: ContentFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleFileChange = (file: File | null) => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    setMediaFile(file);
    setLocalPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit(values, mediaFile);
  };

  const selectClassName = cn(
    "min-h-11 w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-content-primary",
    "focus:border-bordeaux focus:outline-none focus:ring-2 focus:ring-bordeaux/20",
    "dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary",
  );

  return (
    <form className="space-y-6" onSubmit={(event) => void handleSubmit(event)}>
      {errorMessage ? (
        <Toast variant="error" title="Erro" message={errorMessage} />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Título"
          name="title"
          value={values.title}
          required
          placeholder="Título do conteúdo"
          onChange={(event) => updateField("title", event.target.value)}
        />

        <Input
          label="Slug (opcional)"
          name="slug"
          value={values.slug}
          placeholder="gerado-automaticamente"
          onChange={(event) => updateField("slug", event.target.value)}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="category_id"
            className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary"
          >
            Categoria
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            value={values.category_id}
            className={selectClassName}
            onChange={(event) => updateField("category_id", event.target.value)}
          >
            <option value="">Seleccionar categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="type"
            className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary"
          >
            Tipo
          </label>
          <select
            id="type"
            name="type"
            value={values.type}
            className={selectClassName}
            onChange={(event) =>
              updateField("type", event.target.value as ContentType)
            }
          >
            {CONTENT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="status"
            className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary"
          >
            Estado
          </label>
          <select
            id="status"
            name="status"
            value={values.status}
            className={selectClassName}
            onChange={(event) =>
              updateField(
                "status",
                event.target.value as ContentFormValues["status"],
              )
            }
          >
            {CONTENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="URL de media (opcional)"
          name="media_url"
          value={values.media_url}
          placeholder="https://... ou /storage/..."
          onChange={(event) => updateField("media_url", event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="body"
          className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary"
        >
          Corpo / descrição
        </label>
        <textarea
          id="body"
          name="body"
          rows={8}
          value={values.body}
          placeholder="Texto do conteúdo..."
          className={cn(selectClassName, "min-h-40 py-3")}
          onChange={(event) => updateField("body", event.target.value)}
        />
      </div>

      <Input
        label="Dados estatísticos (opcional)"
        name="statistics_data"
        value={values.statistics_data}
        placeholder="Notas ou JSON simples"
        onChange={(event) =>
          updateField("statistics_data", event.target.value)
        }
      />

      <label className="inline-flex items-center gap-2 text-sm text-content-primary dark:text-content-dark-primary">
        <input
          type="checkbox"
          checked={values.is_exclusive}
          className="h-4 w-4 rounded border-border text-bordeaux focus:ring-bordeaux"
          onChange={(event) =>
            updateField("is_exclusive", event.target.checked)
          }
        />
        Conteúdo exclusivo (requer autenticação)
      </label>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-border-dark dark:bg-surface-dark-card">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="media"
            className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary"
          >
            Upload de media
          </label>
          <input
            id="media"
            name="media"
            type="file"
            accept="image/*,audio/*,video/*"
            className="block w-full text-sm text-content-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-bordeaux file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:text-content-dark-secondary"
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null)
            }
          />
          {mediaFile ? (
            <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
              Ficheiro seleccionado: {mediaFile.name}
            </p>
          ) : null}
        </div>

        <div>
          <p className="mb-2 font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary">
            Pré-visualização
          </p>
          <MediaPreview type={values.type} previewUrl={previewUrl} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
