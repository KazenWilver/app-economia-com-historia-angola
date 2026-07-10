"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toast } from "@/components/ui/Toast";
import {
  isDirectMediaUrl,
  slugifyPreview,
} from "@/components/admin/content-helpers";
import {
  CONTENT_STATUS_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  getMediaAcceptForType,
  MEDIA_HINT_BY_TYPE,
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
      <p className="rounded-lg border border-dashed border-border bg-surface-secondary p-4 text-sm text-content-tertiary dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-tertiary">
        Sem pré-visualização. Faz upload de um ficheiro ou indica um URL directo
        para imagem, áudio ou vídeo.
      </p>
    );
  }

  if (!previewUrl.startsWith("blob:") && !isDirectMediaUrl(previewUrl)) {
    return (
      <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-100">
        <p className="font-semibold">Este URL não parece ser um ficheiro de media directo.</p>
        <p className="mt-2 text-amber-800 dark:text-amber-200/90">
          Links de artigos ou páginas web (como sites de notícias) não são
          reproduzidos automaticamente. Usa upload ou um URL que termine em
          .jpg, .png, .mp3, .mp4, etc.
        </p>
        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 font-semibold text-bordeaux underline dark:text-bordeaux-dark"
        >
          <ExternalLink className="h-4 w-4" strokeWidth={1.5} />
          Abrir URL externo
        </a>
      </div>
    );
  }

  if (type === "video") {
    return (
      <video
        key={previewUrl}
        src={previewUrl}
        controls
        className="max-h-64 w-full rounded-lg border border-border bg-black dark:border-border-dark"
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
      className="max-h-64 w-full rounded-lg border border-border object-contain dark:border-border-dark"
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
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    setValues(initialValues);
    setMediaFile(null);
    setLocalPreviewUrl(null);

    const autoSlug = slugifyPreview(initialValues.title);
    setSlugManuallyEdited(
      Boolean(initialValues.slug.trim()) &&
        initialValues.slug.trim() !== autoSlug,
    );
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

  const slugPreview = values.slug.trim() || slugifyPreview(values.title);

  const updateField = <K extends keyof ContentFormValues>(
    field: K,
    value: ContentFormValues[K],
  ) => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleTitleChange = (title: string) => {
    setValues((current) => ({
      ...current,
      title,
      slug: slugManuallyEdited ? current.slug : slugifyPreview(title),
    }));
  };

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true);
    updateField("slug", slug);
  };

  const resetSlugFromTitle = () => {
    setSlugManuallyEdited(false);
    updateField("slug", slugifyPreview(values.title));
  };

  const handleFileChange = (file: File | null) => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    setMediaFile(file);
    setLocalPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleTypeChange = (type: ContentType) => {
    updateField("type", type);

    if (mediaFile) {
      handleFileChange(null);
    }
  };

  const mediaAccept = getMediaAcceptForType(values.type);

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
          onChange={(event) => handleTitleChange(event.target.value)}
        />

        <div className="md:col-span-2">
          <Input
            label="Slug (opcional)"
            name="slug"
            value={values.slug}
            placeholder="deixar vazio para gerar automaticamente"
            onChange={(event) => handleSlugChange(event.target.value)}
          />
          <div className="mt-1.5 flex flex-col gap-2 text-xs text-content-tertiary dark:text-content-dark-tertiary">
            <p>
              Identificador único na URL pública. Enquanto não editares este
              campo manualmente, o slug acompanha o título em tempo real.
            </p>
            {slugPreview ? (
              <p>
                Pré-visualização:{" "}
                <span className="font-mono text-content-secondary dark:text-content-dark-secondary">
                  /explorar/{slugPreview}
                </span>
              </p>
            ) : null}
            {slugManuallyEdited ? (
              <button
                type="button"
                className="w-fit font-semibold text-bordeaux underline dark:text-bordeaux-dark"
                onClick={resetSlugFromTitle}
              >
                Voltar a sincronizar com o título
              </button>
            ) : null}
          </div>
        </div>

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
              handleTypeChange(event.target.value as ContentType)
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

        <div className="md:col-span-2">
          <Input
            label="URL de media (opcional)"
            name="media_url"
            value={values.media_url}
            placeholder="https://exemplo.com/ficheiro.jpg"
            onChange={(event) => updateField("media_url", event.target.value)}
          />
          <p className="mt-1.5 text-xs text-content-tertiary dark:text-content-dark-tertiary">
            Endereço directo de um ficheiro de imagem, áudio ou vídeo já
            alojado (ou caminho local como /storage/...). Não uses links de
            artigos ou páginas web — para isso, coloca o texto no corpo e, se
            quiseres, um link manual na descrição.
          </p>
        </div>
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

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="statistics_data"
          className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary"
        >
          Dados estatísticos (opcional)
        </label>
        <textarea
          id="statistics_data"
          name="statistics_data"
          rows={4}
          value={values.statistics_data}
          placeholder='{"ano": 1975, "pib_percentual": 12.4, "fonte": "INE Angola"}'
          className={cn(selectClassName, "min-h-28 py-3 font-mono text-xs")}
          onChange={(event) =>
            updateField("statistics_data", event.target.value)
          }
        />
        <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
          Texto livre ou JSON simples com números e factos (PIB, anos, percentagens).
          Na página pública aparece num bloco «Dados estatísticos»; se for JSON
          válido, é mostrado em cartões.
        </p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
          Acesso ao conteúdo
        </legend>
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => updateField("is_exclusive", false)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              !values.is_exclusive
                ? "border-bordeaux bg-bordeaux/5 ring-2 ring-bordeaux/30 dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:ring-bordeaux-dark/30"
                : "border-border bg-surface-card hover:border-border dark:border-border-dark dark:bg-surface-dark-card dark:hover:border-border-dark",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  !values.is_exclusive
                    ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                    : "bg-surface-secondary text-content-secondary dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
                )}
              >
                <Globe className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span>
                <span className="block font-display font-bold text-content-primary dark:text-content-dark-primary">
                  Público
                </span>
                <span className="mt-1 block text-sm text-content-secondary dark:text-content-dark-secondary">
                  Qualquer visitante vê este conteúdo em Explorar, mesmo sem
                  login.
                </span>
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => updateField("is_exclusive", true)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              values.is_exclusive
                ? "border-bordeaux bg-bordeaux/5 ring-2 ring-bordeaux/30 dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:ring-bordeaux-dark/30"
                : "border-border bg-surface-card hover:border-border dark:border-border-dark dark:bg-surface-dark-card dark:hover:border-border-dark",
            )}
          >
            <div className="flex items-start gap-3">
              <span
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  values.is_exclusive
                    ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                    : "bg-surface-secondary text-content-secondary dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
                )}
              >
                <Lock className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <span>
                <span className="block font-display font-bold text-content-primary dark:text-content-dark-primary">
                  Exclusivo
                </span>
                <span className="mt-1 block text-sm text-content-secondary dark:text-content-dark-secondary">
                  Só utilizadores com login em /login veem este conteúdo em
                  Explorar.
                </span>
                {values.type === "jindungo" ? (
                  <span className="mt-2 block text-xs text-content-tertiary dark:text-content-dark-tertiary">
                    O tipo «Jindungo» já exige login por defeito.
                  </span>
                ) : null}
              </span>
            </div>
          </button>
        </div>
      </fieldset>

      <div className="space-y-3 rounded-xl border border-border bg-surface-card p-4 dark:border-border-dark dark:bg-surface-dark-card">
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
            accept={mediaAccept}
            className="block w-full text-sm text-content-secondary file:mr-4 file:rounded-lg file:border-0 file:bg-bordeaux file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white dark:text-content-dark-secondary"
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null)
            }
          />
          <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
            {MEDIA_HINT_BY_TYPE[values.type]} Máximo 100 MB.
          </p>
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
