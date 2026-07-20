"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ContentArticleView } from "@/components/content/ContentArticleView";
import { JindungoAccessPanel } from "@/components/content/JindungoAccessPanel";
import {
  API_URL,
  type ContentDetail,
  type ContentDetailResponse,
} from "@/components/content/types";
import { Button, Card, CardContent, Skeleton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { buildAuthHeaders, getStoredToken } from "@/lib/api";

interface ContentExclusiveGateProps {
  slug: string;
}

export function ContentExclusiveGate({ slug }: ContentExclusiveGateProps) {
  const { token, isLoading: authLoading } = useAuth();
  const publicToken = token ?? getStoredToken();
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(publicToken) || authLoading);
  const [needsLogin, setNeedsLogin] = useState(!publicToken && !authLoading);
  const [needsJindungoAccess, setNeedsJindungoAccess] = useState(false);
  const [accessReady, setAccessReady] = useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!publicToken) {
      setIsLoading(false);
      setNeedsLogin(true);
      setNeedsJindungoAccess(false);
      setContent(null);
      return;
    }

    let cancelled = false;

    async function loadExclusive() {
      setIsLoading(true);
      setNeedsLogin(false);
      setNeedsJindungoAccess(false);

      try {
        const response = await fetch(`${API_URL}/contents/${slug}`, {
          headers: buildAuthHeaders(publicToken),
        });

        if (cancelled) {
          return;
        }

        if (response.status === 401) {
          setNeedsLogin(true);
          setContent(null);
          return;
        }

        if (response.status === 403) {
          const payload = (await response.json().catch(() => null)) as {
            code?: string;
          } | null;
          if (payload?.code === "jindungo_access_required") {
            setNeedsJindungoAccess(true);
          } else {
            setNeedsLogin(true);
          }
          setContent(null);
          return;
        }

        if (!response.ok) {
          setNeedsLogin(true);
          setContent(null);
          return;
        }

        const data = (await response.json()) as ContentDetailResponse;
        setContent(data.data);
      } catch {
        if (!cancelled) {
          setNeedsLogin(true);
          setContent(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadExclusive();

    return () => {
      cancelled = true;
    };
  }, [authLoading, publicToken, slug, accessReady]);

  if (isLoading || authLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/explorar"
          className="mb-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-bordeaux dark:text-bordeaux-dark"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Voltar a Explorar
        </Link>
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (content) {
    return <ContentArticleView content={content} />;
  }

  if (needsJindungoAccess && publicToken) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/jindungo"
          className="inline-flex items-center gap-2 font-display text-sm font-semibold text-bordeaux dark:text-bordeaux-dark"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Voltar à biblioteca Jindungo
        </Link>
        <JindungoAccessPanel
          token={publicToken}
          onAccessChange={(hasAccess) => {
            if (hasAccess) {
              setAccessReady((value) => !value);
            }
          }}
        />
      </div>
    );
  }

  if (needsLogin) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/explorar"
          className="mb-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-bordeaux dark:text-bordeaux-dark"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Voltar a Explorar
        </Link>
        <Card hoverLift={false}>
          <CardContent className="space-y-4 py-10 text-center">
            <p className="font-display text-xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
              Conteúdo exclusivo
            </p>
            <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
              Inicia sessão para aceder a este conteúdo exclusivo.
            </p>
            <Link href={`/login?redirect=${encodeURIComponent(`/explorar/${slug}`)}`}>
              <Button type="button">Iniciar sessão</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
