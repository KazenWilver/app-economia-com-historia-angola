"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, Pencil, Send } from "lucide-react";
import {
  STATUS_LABELS,
  type AdminContent,
  type ContentStatus,
} from "@/components/admin/content-types";
import { ContentArticleView } from "@/components/content/ContentArticleView";
import type { ContentDetail } from "@/components/content/types";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/admin-api";

function toContentDetail(content: AdminContent): ContentDetail {
  return {
    id: content.id,
    title: content.title,
    slug: content.slug,
    body: content.body,
    type: content.type,
    media_url: content.media_url,
    statistics_data: content.statistics_data,
    is_exclusive: content.is_exclusive,
    published_at: content.published_at,
    category: content.category,
    author: content.author,
  };
}

function statusBannerFor(status: ContentStatus): string {
  switch (status) {
    case "published":
      return "Pré-visualização de conteúdo já publicado. O público pode vê-lo em Explorar.";
    case "archived":
      return "Pré-visualização de conteúdo arquivado — não está visível ao público.";
    default:
      return "Pré-visualização de rascunho — ainda não está visível ao público.";
  }
}

export default function AdminContentPreviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const contentId = params.id;
  const { token } = useAdminAuth();

  const [content, setContent] = useState<AdminContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    if (!token || !contentId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await adminFetch<{ data: AdminContent }>(
        `/contents/${contentId}`,
        { token },
      );
      setContent(response.data);
    } catch (error) {
      setContent(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a pré-visualização.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [contentId, token]);

  useEffect(() => {
    void loadContent();
  }, [loadContent]);

  const detail = useMemo(
    () => (content ? toContentDetail(content) : null),
    [content],
  );

  const handlePublish = async () => {
    if (!token || !content) {
      return;
    }

    setIsPublishing(true);
    setErrorMessage(null);

    try {
      const data = await adminFetch<{ content?: AdminContent; message?: string }>(
        `/contents/${content.id}`,
        {
          method: "PUT",
          token,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "published" }),
        },
      );

      if (data.content) {
        setContent(data.content);
      } else {
        await loadContent();
      }
      setSuccessMessage("Conteúdo publicado com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível publicar o conteúdo.",
      );
    } finally {
      setIsPublishing(false);
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

  if (!content || !detail) {
    return (
      <Card hoverLift={false}>
        <CardContent className="py-10 text-center text-content-secondary dark:text-content-dark-secondary">
          {errorMessage ?? "Conteúdo não encontrado."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4 rounded-xl border border-border bg-surface-card px-4 py-4 dark:border-border-dark dark:bg-surface-dark-card sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="inline-flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-wide text-bordeaux dark:text-bordeaux-dark">
            <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
            Pré-visualização · {STATUS_LABELS[content.status]}
          </p>
          <h1 className="mt-1 font-display text-xl font-bold text-content-primary dark:text-content-dark-primary">
            {content.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/conteudos/${content.id}/editar`}>
            <Button type="button" variant="secondary" className="min-h-10">
              <Pencil className="h-4 w-4" strokeWidth={1.5} />
              Editar
            </Button>
          </Link>
          {content.status !== "published" ? (
            <Button
              type="button"
              className="min-h-10"
              isLoading={isPublishing}
              onClick={() => void handlePublish()}
            >
              <Send className="h-4 w-4" strokeWidth={1.5} />
              Publicar agora
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="min-h-10"
              onClick={() => router.push("/admin/conteudos")}
            >
              Voltar à lista
            </Button>
          )}
        </div>
      </header>

      {successMessage ? (
        <Toast
          variant="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      ) : null}
      {errorMessage ? (
        <Toast
          variant="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-surface dark:border-border-dark dark:bg-surface-dark">
        <ContentArticleView
          content={detail}
          mode="admin-preview"
          backHref={`/admin/conteudos/${content.id}/editar`}
          backLabel="Voltar à edição"
          statusBanner={statusBannerFor(content.status)}
        />
      </div>
    </div>
  );
}
