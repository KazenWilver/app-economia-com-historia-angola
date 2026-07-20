"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { JindungoAccessPanel } from "@/components/content/JindungoAccessPanel";
import {
  type ContentItem,
  type ContentsResponse,
  getContentPreview,
} from "@/components/content/types";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch, getStoredToken } from "@/lib/api";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
} from "@/components/ui";
import { cn } from "@/lib/utils";

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
  const authToken = token ?? getStoredToken();
  const [hasAccess, setHasAccess] = useState(false);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated && !authToken) {
      router.replace("/login?redirect=%2Fjindungo");
    }
  }, [authToken, isAuthLoading, isAuthenticated, router]);

  const fetchContents = useCallback(async (currentToken: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await apiFetch<ContentsResponse>("/contents?type=jindungo", {
        token: currentToken,
        skipCache: true,
      });
      setContents(data.data);
    } catch {
      setErrorMessage("Não foi possível carregar os textos Jindungo.");
      setContents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authToken && hasAccess) {
      void fetchContents(authToken);
    } else {
      setContents([]);
      setIsLoading(false);
    }
  }, [authToken, fetchContents, hasAccess]);

  if ((isAuthLoading && !authToken) || (!isAuthenticated && !authToken)) {
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
    <div className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-10 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1">
          <span className="font-display text-xs font-semibold tracking-display text-gold dark:text-gold-dark">
            Exclusivo Jindungo
          </span>
        </div>
        <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary sm:text-4xl">
          Textos com Jindungo
        </h1>
        <p className="max-w-2xl text-content-secondary dark:text-content-dark-secondary">
          Narrativas exclusivas sobre economia e história de Angola. O acesso
          requer pedido ao administrador e aprovação prévia.
        </p>
      </header>

      {authToken ? (
        <JindungoAccessPanel token={authToken} onAccessChange={setHasAccess} />
      ) : null}

      {hasAccess ? (
        <>
          {errorMessage ? (
            <Card className="border-error-light/30">
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
              {contents.map((content) => {
                const publishedDate = formatPublishedDate(content.published_at);

                return (
                  <Link
                    key={content.id}
                    href={`/jindungo/${content.slug}`}
                    className="block h-full"
                  >
                    <Card
                      hoverLift
                      className={cn(
                        "flex h-full flex-col border-gold/20 bg-surface-card",
                        "dark:border-gold-dark/20 dark:bg-surface-dark-card",
                      )}
                    >
                      <CardHeader className="flex-1">
                        <Badge type="jindungo" className="mb-3 w-fit">
                          Jindungo
                        </Badge>
                        <CardTitle className="line-clamp-2">
                          {content.title}
                        </CardTitle>
                        {content.category ? (
                          <p className="text-xs font-medium tracking-display text-content-tertiary dark:text-content-dark-tertiary">
                            {content.category.name}
                          </p>
                        ) : null}
                      </CardHeader>
                      <CardContent className="mt-auto space-y-3">
                        <p className="line-clamp-3">
                          {getContentPreview(content)}
                        </p>
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
        </>
      ) : null}
    </div>
  );
}
