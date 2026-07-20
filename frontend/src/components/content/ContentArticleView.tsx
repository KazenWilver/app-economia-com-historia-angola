"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LearningPathContentTracker } from "@/components/learning/LearningPathContentTracker";
import { AudioPlayer } from "@/components/content/AudioPlayer";
import { CommentSection } from "@/components/content/CommentSection";
import { ContentImage } from "@/components/content/ContentImage";
import { ContentStatistics } from "@/components/content/ContentStatistics";
import { VideoPlayer } from "@/components/content/VideoPlayer";
import {
  type ContentDetail,
  type ContentType,
  isImageMediaUrl,
} from "@/components/content/types";
import { Badge, type BadgeType } from "@/components/ui";
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

interface ContentArticleViewProps {
  content: ContentDetail;
  /** Pré-visualização no painel admin (sem comentários nem tracker do trilho). */
  mode?: "public" | "admin-preview";
  backHref?: string;
  backLabel?: string;
  statusBanner?: string | null;
}

export function ContentArticleView({
  content,
  mode = "public",
  backHref = "/explorar",
  backLabel = "Voltar a Explorar",
  statusBanner = null,
}: ContentArticleViewProps) {
  const publishedDate = formatPublishedDate(content.published_at);
  const showAudioPlayer =
    content.media_url &&
    (content.type === "audio" || content.type === "podcast");
  const showVideoPlayer = content.media_url && content.type === "video";
  const showImageMedia =
    content.media_url && isImageMediaUrl(content.media_url);
  const isAdminPreview = mode === "admin-preview";

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
      {!isAdminPreview ? (
        <LearningPathContentTracker slug={content.slug} />
      ) : null}
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 font-display text-sm font-semibold text-bordeaux transition-colors hover:text-bordeaux/80 dark:text-bordeaux-dark dark:hover:text-bordeaux-dark/80"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        {backLabel}
      </Link>

      {statusBanner ? (
        <div className="mb-6 rounded-xl border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-100">
          {statusBanner}
        </div>
      ) : null}

      <article className="space-y-8">
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge type={BADGE_TYPES[content.type]}>
              {TYPE_LABELS[content.type]}
            </Badge>
            {content.is_exclusive ? (
              <Badge type="jindungo" className="normal-case">
                Exclusivo
              </Badge>
            ) : null}
            {content.category ? (
              <span className="text-xs font-medium tracking-display text-content-tertiary dark:text-content-dark-tertiary">
                {content.category.name}
              </span>
            ) : null}
          </div>

          <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary sm:text-4xl">
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
              "prose max-w-none text-content-secondary dark:prose-invert dark:text-content-dark-secondary",
              "whitespace-pre-wrap leading-7",
            )}
          >
            {content.body}
          </div>
        ) : null}

        {content.statistics_data ? (
          <ContentStatistics data={content.statistics_data} />
        ) : null}

        {!isAdminPreview ? (
          <CommentSection contentSlug={content.slug} />
        ) : null}
      </article>
    </div>
  );
}
