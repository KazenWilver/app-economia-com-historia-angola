"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { TopicCard } from "@/components/forum/TopicCard";
import type { PublicTopicsResponse } from "@/components/forum/forum-types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { apiFetch } from "@/lib/api";

function TopicCardSkeleton() {
  return (
    <Card hoverLift={false} className="h-full">
      <CardContent className="space-y-4 p-6">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

export default function ForumPage() {
  const { isAuthenticated } = useAuth();
  const [topics, setTopics] = useState<PublicTopicsResponse["data"]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTopics = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const data = await apiFetch<PublicTopicsResponse>("/topics", {
        cacheTtlMs: 15_000,
        skipCache: Boolean(options?.silent),
      });
      setTopics(data.data);
    } catch {
      setTopics([]);
      setErrorMessage("Não foi possível carregar os debates.");
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, []);

  useLiveRefresh(loadTopics);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
            Fórum
          </h1>
          <p className="max-w-2xl text-content-secondary dark:text-content-dark-secondary">
            Debate ideias sobre economia e história de Angola com a comunidade
            Jindungo. Cria tópicos públicos ou privados e participa nas
            discussões.
          </p>
        </div>

        {isAuthenticated ? (
          <Link href="/forum/novo">
            <Button type="button" className="inline-flex items-center gap-2">
              <MessageSquarePlus className="h-4 w-4" strokeWidth={1.5} />
              Novo tópico
            </Button>
          </Link>
        ) : (
          <Link href="/login?redirect=%2Fforum%2Fnovo">
            <Button type="button" variant="secondary">
              Inicia sessão para debater
            </Button>
          </Link>
        )}
      </header>

      {errorMessage ? (
        <Toast
          variant="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <TopicCardSkeleton />
          <TopicCardSkeleton />
          <TopicCardSkeleton />
          <TopicCardSkeleton />
        </div>
      ) : topics.length === 0 ? (
        <Card hoverLift={false}>
          <CardContent className="space-y-4 py-12 text-center">
            <p className="text-content-secondary dark:text-content-dark-secondary">
              Ainda não há debates públicos. Sê o primeiro a abrir um tópico.
            </p>
            {isAuthenticated ? (
              <Link href="/forum/novo">
                <Button type="button">Criar primeiro tópico</Button>
              </Link>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </div>
      )}
    </div>
  );
}
