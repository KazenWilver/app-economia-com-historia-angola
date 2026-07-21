"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ContentForm } from "@/components/admin/ContentForm";
import {
  emptyContentForm,
  type AdminCategoriesResponse,
  type ContentFormValues,
} from "@/components/admin/content-types";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminFetch, API_URL, buildAdminHeaders, markDataMutated } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

interface CategoryOption {
  id: number;
  name: string;
}

export default function AdminCreateContentPage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = await adminFetch<AdminCategoriesResponse>("/categories", {
        token,
      });
      setCategories(data.data.map((item) => ({ id: item.id, name: item.name })));
    } catch {
      setErrorMessage("Não foi possível carregar as categorias.");
    }
  }, [token]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (
    values: ContentFormValues,
    mediaFile: File | null,
  ) => {
    if (!token) {
      setErrorMessage("Sessão de administrador inválida.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
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
      if (mediaFile) {
        formData.append("media", mediaFile);
      }

      const response = await fetch(`${API_URL}/contents`, {
        method: "POST",
        headers: buildAdminHeaders(token),
        body: formData,
      });

      if (!response.ok) {
        const { parseApiError } = await import("@/lib/admin-api");
        throw new Error(await parseApiError(response));
      }

      await response.json();
      markDataMutated();

      router.replace("/admin/conteudos?created=1");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o conteúdo.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary">
          Novo conteúdo
        </h1>
        <p className="mt-2 text-content-secondary dark:text-content-dark-secondary">
          Preenche os dados e, se precisares, faz upload de media com preview.
        </p>
      </header>

      <Card hoverLift={false} className="border-border bg-surface-card dark:border-border-dark dark:bg-surface-dark-card">
        <CardHeader>
          <CardTitle className="text-content-primary dark:text-content-dark-primary">
            Dados do conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentForm
            initialValues={emptyContentForm()}
            categories={categories}
            submitLabel="Criar conteúdo"
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/conteudos")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
