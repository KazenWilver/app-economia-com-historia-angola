"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { buildAuthHeaders, getStoredToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AudioPlayer } from "@/components/content/AudioPlayer";
import { CommentSection } from "@/components/content/CommentSection";
import { ContentImage } from "@/components/content/ContentImage";
import { VideoPlayer } from "@/components/content/VideoPlayer";
import {
  API_URL,
  type ContentDetail,
  type ContentDetailResponse,
  type ContentType,
  isImageMediaUrl,
} from "@/components/content/types";
import {
  Badge,
  type BadgeType,
  Card,
  CardContent,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<ContentType, string> = {
  texto: "Texto",
  audio: "Áudio",
  video: "Vídeo",
  podcast: "Podcast",
  jindungo: "Jindungo",
};

const BADGE_TYPES: Record<ContentType, BadgeType> = {
  texto: "text",
  audio: "audio",
  video: "video",
  podcast: "podcast",
  jindungo: "jindungo",
};

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

export default function ContentDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { token } = useAuth();
  const authToken = token ?? getStoredToken();
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!slug) {
      return;
    }

    setIsLoading(true);
    setRequiresAuth(false);
    setNotFound(false);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}/contents/${slug}`, {
        headers: buildAuthHeaders(authToken),
      });

      if (response.status === 401) {
        setRequiresAuth(true);
        setContent(null);
        return;
      }

      if (response.status === 404) {
        setNotFound(true);
        setContent(null);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load content");
      }

      const data = (await response.json()) as ContentDetailResponse;
      setContent(data.data);
    } catch {
      setErrorMessage("Não foi possível carregar o conteúdo.");
      setContent(null);
    } finally {
      setIsLoading(false);
    }
  }, [slug, authToken]);

  useEffect(() => {
    void fetchContent();
  }, [fetchContent]);

  const publishedDate = content ? formatPublishedDate(content.published_at) : null;
  const showAudioPlayer =
    content?.media_url &&
    (content.type === "audio" || content.type === "podcast");
  const showVideoPlayer = content?.media_url && content.type === "video";
  const showImageMedia =
    content?.media_url && isImageMediaUrl(content.media_url);

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/explorar"
        className="mb-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-bordeaux transition-colors hover:text-bordeaux/80 dark:text-bordeaux-dark dark:hover:text-bordeaux-dark/80"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        Voltar a Explorar
      </Link>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : requiresAuth ? (
        <Card>
          <CardContent className="space-y-4 py-10 text-center">
            <p className="font-display text-xl font-bold text-content-primary dark:text-content-dark-primary">
              Conteúdo exclusivo
            </p>
            <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
              Inicia sessão para aceder a este conteúdo Jindungo.
            </p>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-bordeaux px-4 py-2.5 font-display text-sm font-semibold text-white transition-colors hover:bg-bordeaux/90 dark:bg-bordeaux-dark dark:hover:bg-bordeaux-dark/90"
            >
              Iniciar sessão
            </Link>
          </CardContent>
        </Card>
      ) : notFound ? (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-display text-xl font-bold text-content-primary dark:text-content-dark-primary">
              Conteúdo não encontrado
            </p>
            <p className="mt-2 text-sm text-content-secondary dark:text-content-dark-secondary">
              O conteúdo que procuras não existe ou foi removido.
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
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge type={BADGE_TYPES[content.type]}>
                {TYPE_LABELS[content.type]}
              </Badge>
              {content.category ? (
                <span className="text-xs font-medium uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                  {content.category.name}
                </span>
              ) : null}
            </div>

            <h1 className="font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary sm:text-4xl">
              {content.title}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-content-secondary dark:text-content-dark-secondary">
              {content.author ? <span>Por {content.author.name}</span> : null}
              {publishedDate ? <span>Publicado em {publishedDate}</span> : null}
            </div>
          </header>

          {showVideoPlayer ? (
            <VideoPlayer src={content.media_url!} title={content.title} />
          ) : null}

          {showAudioPlayer ? (
            <AudioPlayer src={content.media_url!} title={content.title} />
          ) : null}

          {showImageMedia ? (
            <ContentImage src={content.media_url!} alt={content.title} />
          ) : null}

          {content.body ? (
            <div
              className={cn(
                "prose prose-slate max-w-none text-content-secondary dark:text-content-dark-secondary",
                "whitespace-pre-wrap leading-7",
              )}
            >
              {content.body}
            </div>
          ) : null}

          <CommentSection contentSlug={content.slug} />
        </article>
      ) : null}
    </div>
  );
}
