"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FileAudio, FileText, Film, Mic2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Badge,
  type BadgeType,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type ContentType = "texto" | "audio" | "video" | "podcast" | "jindungo";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ContentItem {
  id: number;
  title: string;
  slug: string;
  body: string | null;
  type: ContentType;
  media_url: string | null;
  is_exclusive: boolean | null;
  published_at: string | null;
  category: Category | null;
}

interface ContentsResponse {
  data: ContentItem[];
}

const CONTENT_FILTERS: { value: ContentType | null; label: string }[] = [
  { value: null, label: "Todos" },
  { value: "texto", label: "Texto" },
  { value: "audio", label: "Áudio" },
  { value: "video", label: "Vídeo" },
  { value: "podcast", label: "Podcast" },
  { value: "jindungo", label: "Jindungo" },
];

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

const TYPE_ICONS: Record<ContentType, typeof FileText> = {
  texto: FileText,
  audio: FileAudio,
  video: Film,
  podcast: Mic2,
  jindungo: Sparkles,
};

function truncateText(text: string | null, maxLength = 140): string {
  if (!text) {
    return "Sem descrição disponível.";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}…`;
}

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

function ContentCardSkeleton() {
  return (
    <Card hoverLift={false} className="h-full">
      <CardHeader>
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

export default function ExplorarPage() {
  const { token } = useAuth();
  const [activeFilter, setActiveFilter] = useState<ContentType | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchContents = useCallback(async () => {
    setIsLoading(true);
    setRequiresAuth(false);
    setErrorMessage(null);

    const params = new URLSearchParams();
    if (activeFilter) {
      params.set("type", activeFilter);
    }

    const query = params.toString();
    const url = query ? `${API_URL}/contents?${query}` : `${API_URL}/contents`;

    try {
      const headers: HeadersInit = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });

      if (response.status === 401) {
        setContents([]);
        setRequiresAuth(true);
        return;
      }

      if (!response.ok) {
        throw new Error("Não foi possível carregar os conteúdos.");
      }

      const data = (await response.json()) as ContentsResponse;
      setContents(data.data);
    } catch {
      setContents([]);
      setErrorMessage(
        "Ocorreu um erro ao carregar os conteúdos. Tenta novamente mais tarde.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter, token]);

  useEffect(() => {
    void fetchContents();
  }, [fetchContents]);

  return (
    <>
      <style>{`
        @keyframes explorar-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .explorar-fade-in-up {
          animation: explorar-fade-in-up 0.5s ease forwards;
          opacity: 0;
        }
      `}</style>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-3">
          <p className="font-display text-sm font-semibold uppercase tracking-wide text-bordeaux dark:text-bordeaux-dark">
            Biblioteca
          </p>
          <h1 className="font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary sm:text-4xl">
            Explorar Conteúdos
          </h1>
          <p className="max-w-2xl text-content-secondary dark:text-content-dark-secondary">
            Descobre textos, áudios, vídeos e podcasts sobre a economia e história
            de Angola.
          </p>
        </header>

        <div
          className="mb-8 flex gap-2 overflow-x-auto pb-2"
          role="tablist"
          aria-label="Filtrar por tipo de conteúdo"
        >
          {CONTENT_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;

            return (
              <button
                key={filter.label}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(filter.value)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-colors duration-200",
                  isActive
                    ? "border-bordeaux bg-bordeaux text-white dark:border-bordeaux-dark dark:bg-bordeaux-dark"
                    : "border-border bg-surface-card text-content-secondary hover:border-bordeaux hover:text-bordeaux dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-secondary dark:hover:border-bordeaux-dark dark:hover:text-bordeaux-dark",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {requiresAuth && (
          <Card className="mb-8 border-bordeaux/30 bg-bordeaux/5 dark:border-bordeaux-dark/30 dark:bg-bordeaux-dark/10">
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-content-primary dark:text-content-dark-primary">
                Os conteúdos Jindungo são exclusivos. Inicia sessão para os
                explorar.
              </p>
              <Link
                href="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-bordeaux px-4 py-2.5 font-display text-sm font-semibold text-white transition-all duration-200 hover:bg-bordeaux/90 dark:bg-bordeaux-dark dark:hover:bg-bordeaux-dark/90"
              >
                Iniciar sessão
              </Link>
            </CardContent>
          </Card>
        )}

        {errorMessage && (
          <Card className="mb-8 border-error-light/30 bg-error-light/5 dark:border-error-dark/30">
            <CardContent>
              <p className="text-sm text-content-primary dark:text-content-dark-primary">
                {errorMessage}
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ContentCardSkeleton key={index} />
            ))}
          </div>
        ) : contents.length === 0 && !requiresAuth ? (
          <Card hoverLift={false} className="text-center">
            <CardContent className="py-12">
              <p className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
                Nenhum conteúdo encontrado
              </p>
              <p className="mt-2 text-sm text-content-secondary dark:text-content-dark-secondary">
                {activeFilter
                  ? `Não existem conteúdos do tipo «${TYPE_LABELS[activeFilter]}» publicados.`
                  : "Ainda não há conteúdos publicados."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((content, index) => {
              const Icon = TYPE_ICONS[content.type];
              const publishedDate = formatPublishedDate(content.published_at);

              return (
                <Link
                  key={content.id}
                  href={`/explorar/${content.slug}`}
                  className="explorar-fade-in-up block h-full"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <Card className="flex h-full flex-col">
                    <CardHeader className="flex-1">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <Badge type={BADGE_TYPES[content.type]}>
                          {TYPE_LABELS[content.type]}
                        </Badge>
                        <Icon
                          className="h-5 w-5 text-bordeaux dark:text-bordeaux-dark"
                          strokeWidth={1.5}
                          aria-hidden
                        />
                      </div>
                      <CardTitle className="line-clamp-2">
                        {content.title}
                      </CardTitle>
                      {content.category && (
                        <p className="text-xs font-medium uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                          {content.category.name}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="mt-auto space-y-3">
                      <p className="line-clamp-3">
                        {truncateText(content.body)}
                      </p>
                      {publishedDate && (
                        <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
                          Publicado em {publishedDate}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {!isLoading && contents.length > 0 && (
          <p className="mt-8 text-center text-sm text-content-tertiary dark:text-content-dark-tertiary">
            {contents.length}{" "}
            {contents.length === 1 ? "conteúdo encontrado" : "conteúdos encontrados"}
            {activeFilter ? ` em «${TYPE_LABELS[activeFilter]}»` : ""}
          </p>
        )}
      </div>
    </>
  );
}
