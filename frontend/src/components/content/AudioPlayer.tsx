"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useMemo } from "react";
import { MediaSeekBar } from "@/components/content/MediaSeekBar";
import { resolveMediaUrl } from "@/components/content/media-player-utils";
import { useMediaPlayback } from "@/components/content/useMediaPlayback";
import { cn } from "@/lib/utils";

export interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

export function AudioPlayer({ src, title, className }: AudioPlayerProps) {
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
  } = useMediaPlayback<HTMLAudioElement>(mediaSrc);

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-card p-4 dark:border-border-dark dark:bg-surface-dark-card",
        className,
      )}
    >
      <audio
        ref={mediaRef}
        key={mediaSrc}
        src={mediaSrc}
        preload="metadata"
        crossOrigin="anonymous"
      >
        <track kind="captions" />
      </audio>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => void togglePlayback()}
          aria-label={isPlaying ? "Pausar áudio" : "Reproduzir áudio"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-bordeaux text-white transition-colors hover:bg-bordeaux/90 dark:bg-bordeaux-dark dark:hover:bg-bordeaux-dark/90"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" strokeWidth={1.5} />
          ) : (
            <Play className="h-5 w-5 translate-x-0.5" strokeWidth={1.5} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Volume2
              className="h-4 w-4 shrink-0 text-bordeaux dark:text-bordeaux-dark"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="truncate font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary">
              {title ?? "Áudio"}
            </p>
          </div>

          <MediaSeekBar
            currentTime={displayedTime}
            duration={duration}
            progress={progress}
            onSeekStart={beginSeek}
            onSeek={seekTo}
            onSeekEnd={endSeek}
          />
        </div>
      </div>
    </div>
  );
}
