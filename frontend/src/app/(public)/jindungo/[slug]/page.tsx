"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { CommentSection } from "@/components/content/CommentSection";
import { ContentImage } from "@/components/content/ContentImage";
import {
  API_URL,
  type ContentDetail,
  type ContentDetailResponse,
  isImageMediaUrl,
} from "@/components/content/types";
import {
  Badge,
  Card,
  CardContent,
  Skeleton,
} from "@/components/ui";

function formatPublishedDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function JindungoDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { isAuthenticated, isLoading: isAuthLoading, token } = useAuth();
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const fetchContent = useCallback(async () => {
    if (!slug || !token) {
      return;
    }

    setIsLoading(true);
    setNotFound(false);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}/contents/${slug}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 404) {
        setNotFound(true);
        setContent(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load content");
      }

      const data = (await response.json()) as ContentDetailResponse;

      if (data.data.type !== "jindungo") {
        setNotFound(true);
        setContent(null);
        return;
      }

      setContent(data.data);
    } catch {
      setErrorMessage("Não foi possível carregar o texto Jindungo.");
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      void fetchContent();
    }
  }, [fetchContent, isAuthenticated, token]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  const publishedDate = content ? formatPublishedDate(content.published_at) : null;
  const showImageMedia =
    content?.media_url && isImageMediaUrl(content.media_url);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/jindungo"
        className="mb-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-gold transition-colors hover:text-gold/80 dark:text-gold-dark dark:hover:text-gold-dark/80"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        Voltar aos Textos Jindungo
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : notFound ? (
        <Card className="border-gold/20">
          <CardContent className="py-10 text-center">
            <p className="font-display text-xl font-bold text-content-primary dark:text-content-dark-primary">
              Texto não encontrado
            </p>
            <p className="mt-2 text-sm text-content-secondary dark:text-content-dark-secondary">
              Este conteúdo Jindungo não existe ou foi removido.
            </p>
          </CardContent>
        </Card>
      ) : errorMessage ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
              {errorMessage}
            </p>
          </CardContent>
        </Card>
      ) : content ? (
        <article className="space-y-8">
          <header className="space-y-4 rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/10 to-surface-card p-6 dark:border-gold-dark/20 dark:from-gold-dark/10 dark:to-surface-dark-card">
            <Badge type="jindungo" className="w-fit">
              <span aria-hidden>🌶️ </span>
              Jindungo Exclusivo
            </Badge>

            <h1 className="font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary sm:text-4xl">
              {content.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-content-secondary dark:text-content-dark-secondary">
              {content.category ? <span>{content.category.name}</span> : null}
              {content.author ? <span>Por {content.author.name}</span> : null}
              {publishedDate ? <span>Publicado em {publishedDate}</span> : null}
            </div>
          </header>

          {showImageMedia ? (
            <ContentImage src={content.media_url!} alt={content.title} />
          ) : null}

          {content.body ? (
            <div className="whitespace-pre-wrap leading-8 text-content-secondary dark:text-content-dark-secondary">
              {content.body}
            </div>
          ) : null}

          <CommentSection contentSlug={content.slug} />
        </article>
      ) : null}
    </div>
  );
}
