"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ContentForm } from "@/components/admin/ContentForm";
import {
  contentToFormValues,
  emptyContentForm,
  type AdminCategoriesResponse,
  type AdminContent,
  type AdminContentResponse,
  type ContentFormValues,
} from "@/components/admin/content-types";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  API_URL,
  adminFetch,
  buildAdminHeaders,
  parseApiError,
} from "@/lib/admin-api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";

interface CategoryOption {
  id: number;
  name: string;
}

export default function AdminEditContentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const contentId = params.id;
  const { token } = useAdminAuth();

  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [content, setContent] = useState<AdminContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialValues = useMemo(
    () => (content ? contentToFormValues(content) : emptyContentForm()),
    [content],
  );

  const loadData = useCallback(async () => {
    if (!token || !contentId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [categoriesData, contentResponse] = await Promise.all([
        adminFetch<AdminCategoriesResponse>("/categories", { token }),
        adminFetch<{ data: AdminContent }>(`/contents/${contentId}`, { token }),
      ]);

      setCategories(
        categoriesData.data.map((item) => ({
          id: item.id,
          name: item.name,
        })),
      );
      setContent(contentResponse.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o conteúdo.",
      );
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [contentId, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSubmit = async (
    values: ContentFormValues,
    mediaFile: File | null,
  ) => {
    if (!token || !contentId) {
      setErrorMessage("Sessão de administrador inválida.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mediaFile) {
        const formData = new FormData();
        formData.append("_method", "PUT");
        formData.append("category_id", values.category_id);
        formData.append("title", values.title.trim());
        if (values.slug.trim()) {
          formData.append("slug", values.slug.trim());
        }
        formData.append("body", values.body);
        formData.append("type", values.type);
        formData.append("status", values.status);
        formData.append("is_exclusive", values.is_exclusive ? "1" : "0");
        if (values.media_url.trim()) {
          formData.append("media_url", values.media_url.trim());
        }
        if (values.statistics_data.trim()) {
          formData.append("statistics_data", values.statistics_data.trim());
        }
        formData.append("media", mediaFile);

        const response = await fetch(`${API_URL}/contents/${contentId}`, {
          method: "POST",
          headers: buildAdminHeaders(token),
          body: formData,
        });

        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }

        const data = (await response.json()) as AdminContentResponse;
        if (data.content) {
          setContent(data.content);
        }
      } else {
        const data = await adminFetch<AdminContentResponse>(
          `/contents/${contentId}`,
          {
            method: "PUT",
            token,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              category_id: Number(values.category_id),
              title: values.title.trim(),
              slug: values.slug.trim() || undefined,
              body: values.body,
              type: values.type,
              status: values.status,
              is_exclusive: values.is_exclusive,
              media_url: values.media_url.trim() || null,
              statistics_data: values.statistics_data.trim() || null,
            }),
          },
        );

        if (data.content) {
          setContent(data.content);
        }
      }

      setSuccessMessage("Conteúdo actualizado com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível actualizar o conteúdo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!content) {
    return (
      <Card hoverLift={false}>
        <CardContent className="py-10 text-center text-slate-600 dark:text-content-dark-secondary">
          {errorMessage ?? "Conteúdo não encontrado."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-content-dark-primary">
          Editar conteúdo
        </h1>
        <p className="mt-2 text-slate-600 dark:text-content-dark-secondary">
          {content.title}
        </p>
      </header>

      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
          {successMessage}
        </p>
      ) : null}

      <Card hoverLift={false} className="border-slate-200 bg-white dark:border-border-dark dark:bg-surface-dark-card">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-content-dark-primary">
            Dados do conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentForm
            initialValues={initialValues}
            categories={categories}
            submitLabel="Guardar alterações"
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            existingMediaUrl={content.media_url}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/conteudos")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
