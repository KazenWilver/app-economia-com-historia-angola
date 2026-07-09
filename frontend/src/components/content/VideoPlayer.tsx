"use client";

import { Maximize, Pause, Play, Video } from "lucide-react";
import { useMemo, useRef } from "react";
import { MediaSeekBar } from "@/components/content/MediaSeekBar";
import { resolveMediaUrl } from "@/components/content/media-player-utils";
import { useMediaPlayback } from "@/components/content/useMediaPlayback";
import { cn } from "@/lib/utils";

export interface VideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

export function VideoPlayer({ src, title, className }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaSrc = useMemo(() => resolveMediaUrl(src), [src]);
  const {
    mediaRef,
    isPlaying,
    duration,
    displayedTime,
    progress,
    togglePlayback,
    beginSeek,
    seekTo,
    endSeek,
  } = useMediaPlayback<HTMLVideoElement>(mediaSrc);

  const enterFullscreen = async () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await container.requestFullscreen();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface-card dark:border-border-dark dark:bg-surface-dark-card",
        className,
      )}
    >
      <div className="relative aspect-video bg-black">
        <video
          ref={mediaRef}
          key={mediaSrc}
          className="h-full w-full object-contain"
          preload="metadata"
          playsInline
          crossOrigin="anonymous"
          aria-label={title ?? "Vídeo"}
          src={mediaSrc}
          onClick={() => void togglePlayback()}
        >
          O teu navegador não suporta reprodução de vídeo.
        </video>

        {!isPlaying && (
          <button
            type="button"
            onClick={() => void togglePlayback()}
            aria-label="Reproduzir vídeo"
            className="absolute inset-0 flex items-center justify-center bg-black/35 transition-colors hover:bg-black/45"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-bordeaux text-white shadow-lg dark:bg-bordeaux-dark">
              <Play className="h-7 w-7 translate-x-0.5" strokeWidth={1.5} />
            </span>
          </button>
        )}
      </div>

      <div className="space-y-3 border-t border-border p-4 dark:border-border-dark">
        <div className="flex items-center gap-2">
          <Video
            className="h-4 w-4 shrink-0 text-bordeaux dark:text-bordeaux-dark"
            strokeWidth={1.5}
            aria-hidden
          />
          <p className="truncate font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary">
            {title ?? "Vídeo"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void togglePlayback()}
            aria-label={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bordeaux text-white transition-colors hover:bg-bordeaux/90 dark:bg-bordeaux-dark dark:hover:bg-bordeaux-dark/90"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <Play className="h-4 w-4 translate-x-0.5" strokeWidth={1.5} />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <MediaSeekBar
              currentTime={displayedTime}
              duration={duration}
              progress={progress}
              onSeekStart={beginSeek}
              onSeek={seekTo}
              onSeekEnd={endSeek}
            />
          </div>

          <button
            type="button"
            onClick={() => void enterFullscreen()}
            aria-label="Ecrã inteiro"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border text-content-secondary transition-colors hover:bg-surface-secondary dark:border-border-dark dark:text-content-dark-secondary dark:hover:bg-surface-dark-secondary"
          >
            <Maximize className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
