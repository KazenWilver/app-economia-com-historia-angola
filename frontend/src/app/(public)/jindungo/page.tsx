"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  API_URL,
  type ContentItem,
  type ContentsResponse,
} from "@/components/content/types";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";

function truncateText(text: string | null, maxLength = 160): string {
  if (!text) {
    return "Texto exclusivo Jindungo.";
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

function JindungoCardSkeleton() {
  return (
    <Card hoverLift={false} className="h-full border-gold/20">
      <CardHeader>
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>
    </Card>
  );
}

export default function JindungoListPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading, token } = useAuth();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const fetchContents = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_URL}/contents?type=jindungo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load jindungo contents");
      }

      const data = (await response.json()) as ContentsResponse;
      setContents(data.data);
    } catch {
      setErrorMessage("Não foi possível carregar os textos Jindungo.");
      setContents([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      void fetchContents();
    }
  }, [fetchContents, isAuthenticated, token]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <JindungoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes jindungo-fade-in-up {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .jindungo-fade-in-up {
          animation: jindungo-fade-in-up 0.5s ease forwards;
          opacity: 0;
        }
      `}</style>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1">
            <span aria-hidden>🌶️</span>
            <span className="font-display text-xs font-bold uppercase tracking-wide text-gold dark:text-gold-dark">
              Exclusivo Jindungo
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary sm:text-4xl">
            Textos com Jindungo
          </h1>
          <p className="max-w-2xl text-content-secondary dark:text-content-dark-secondary">
            Narrativas exclusivas sobre economia e história de Angola, disponíveis
            apenas para membros da comunidade.
          </p>
        </header>

        {errorMessage ? (
          <Card className="mb-8 border-error-light/30">
            <CardContent className="py-6">
              <p className="text-sm text-content-primary dark:text-content-dark-primary">
                {errorMessage}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <JindungoCardSkeleton key={index} />
            ))}
          </div>
        ) : contents.length === 0 ? (
          <Card
            hoverLift={false}
            className="border-gold/20 bg-gold/5 text-center dark:border-gold-dark/20 dark:bg-gold-dark/5"
          >
            <CardContent className="py-12">
              <Sparkles
                className="mx-auto mb-4 h-8 w-8 text-gold dark:text-gold-dark"
                strokeWidth={1.5}
                aria-hidden
              />
              <p className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
                Ainda não há textos Jindungo publicados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((content, index) => {
              const publishedDate = formatPublishedDate(content.published_at);

              return (
                <Link
                  key={content.id}
                  href={`/jindungo/${content.slug}`}
                  className="jindungo-fade-in-up block h-full"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <Card
                    className={cn(
                      "flex h-full flex-col border-gold/20 bg-gradient-to-br from-surface-card to-gold/5",
                      "dark:border-gold-dark/20 dark:from-surface-dark-card dark:to-gold-dark/5",
                    )}
                  >
                    <CardHeader className="flex-1">
                      <Badge type="jindungo" className="mb-3 w-fit">
                        <span aria-hidden>🌶️ </span>
                        Jindungo
                      </Badge>
                      <CardTitle className="line-clamp-2">{content.title}</CardTitle>
                      {content.category ? (
                        <p className="text-xs font-medium uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                          {content.category.name}
                        </p>
                      ) : null}
                    </CardHeader>
                    <CardContent className="mt-auto space-y-3">
                      <p className="line-clamp-3">{truncateText(content.body)}</p>
                      {publishedDate ? (
                        <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
                          Publicado em {publishedDate}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
