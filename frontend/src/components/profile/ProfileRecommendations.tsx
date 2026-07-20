"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { BookOpen } from "lucide-react";
import type { QuizRecommendation } from "@/components/quiz/quiz-types";
import { Badge, type BadgeType } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { apiFetch, getStoredToken, notifyDataChanged } from "@/lib/api";

const BADGE_TYPES: Record<QuizRecommendation["content"]["type"], BadgeType> = {
  texto: "text",
  audio: "audio",
  video: "video",
  podcast: "podcast",
  jindungo: "jindungo",
};

const TYPE_LABELS: Record<QuizRecommendation["content"]["type"], string> = {
  texto: "Texto",
  audio: "Áudio",
  video: "Vídeo",
  podcast: "Podcast",
  jindungo: "Jindungo",
};

interface RecommendationsResponse {
  data: QuizRecommendation[];
}

function contentHref(recommendation: QuizRecommendation): string {
  if (recommendation.content.type === "jindungo") {
    return `/jindungo/${recommendation.content.slug}`;
  }

  return `/explorar/${recommendation.content.slug}`;
}

export function ProfileRecommendations() {
  const [recommendations, setRecommendations] = useState<QuizRecommendation[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRecommendations = useCallback(
    async (options?: { silent?: boolean }) => {
      const token = getStoredToken();
      if (!token) {
        setRecommendations([]);
        setIsLoading(false);
        return;
      }

      if (!options?.silent) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const data = await apiFetch<RecommendationsResponse>(
          "/recommendations",
          {
            token,
            skipCache: true,
          },
        );
        setRecommendations(data.data);
      } catch {
        setErrorMessage("Não foi possível carregar as recomendações.");
        setRecommendations([]);
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  useLiveRefresh(loadRecommendations);

  const markAsRead = async (recommendation: QuizRecommendation) => {
    if (recommendation.is_read) {
      return;
    }

    const token = getStoredToken();
    if (!token) {
      return;
    }

    setRecommendations((current) =>
      current.map((item) =>
        item.id === recommendation.id ? { ...item, is_read: true } : item,
      ),
    );

    try {
      await apiFetch(`/recommendations/${recommendation.id}/read`, {
        method: "PATCH",
        token,
      });
      notifyDataChanged();
    } catch {
      // Mantém o estado optimista; a próxima visita corrige se falhar.
    }
  };

  return (
    <Card hoverLift={false}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BookOpen
            className="h-5 w-5 text-bordeaux dark:text-bordeaux-dark"
            strokeWidth={1.5}
          />
          <CardTitle>Conteúdos recomendados</CardTitle>
        </div>
        <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
          Sugestões geradas a partir dos teus quizzes para continuares a
          aprender.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMessage ? (
          <Toast
            variant="error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        ) : null}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : recommendations.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-content-secondary dark:border-border-dark dark:text-content-dark-secondary">
            Ainda não tens recomendações. Completa um quiz para receberes
            sugestões de conteúdos.
          </p>
        ) : (
          <ul className="grid gap-3">
            {recommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <Link
                  href={contentHref(recommendation)}
                  onClick={() => void markAsRead(recommendation)}
                  className="block rounded-lg border border-border p-4 transition-colors hover:border-bordeaux hover:bg-surface-secondary dark:border-border-dark dark:hover:border-bordeaux-dark dark:hover:bg-surface-dark-secondary"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge type={BADGE_TYPES[recommendation.content.type]}>
                      {TYPE_LABELS[recommendation.content.type]}
                    </Badge>
                    {recommendation.content.category ? (
                      <span className="text-xs font-medium uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                        {recommendation.content.category.name}
                      </span>
                    ) : null}
                    {!recommendation.is_read ? (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold dark:bg-gold-dark/15 dark:text-gold-dark">
                        Nova
                      </span>
                    ) : null}
                  </div>

                  <p className="font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary">
                    {recommendation.content.title}
                  </p>

                  {recommendation.content.excerpt ? (
                    <p className="mt-1 line-clamp-2 text-xs text-content-secondary dark:text-content-dark-secondary">
                      {recommendation.content.excerpt}
                    </p>
                  ) : null}

                  {recommendation.reason ? (
                    <p className="mt-2 text-xs font-medium text-bordeaux dark:text-bordeaux-dark">
                      {recommendation.reason}
                    </p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
