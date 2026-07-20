"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { ContentExclusiveGate } from "@/components/content/ContentExclusiveGate";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui";

export default function JindungoDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(`/jindungo/${slug}`)}`);
    }
  }, [isAuthLoading, isAuthenticated, router, slug]);

  if (isAuthLoading || !isAuthenticated || !slug) {
    return (
      <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-8 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto w-full max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/jindungo"
          className="mb-2 inline-flex items-center gap-2 font-display text-sm font-semibold text-gold transition-colors hover:text-gold/80 dark:text-gold-dark dark:hover:text-gold-dark/80"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
          Voltar aos Textos Jindungo
        </Link>
      </div>
      <ContentExclusiveGate slug={slug} />
    </div>
  );
}
