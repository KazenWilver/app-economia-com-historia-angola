"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/components/content/types";

export interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, title, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.currentTime = value;
    setCurrentTime(value);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface-card p-4 dark:border-border-dark dark:bg-surface-dark-card",
        className,
      )}
    >
      <audio ref={audioRef} src={resolveMediaUrl(src)} preload="metadata">
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

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Volume2
              className="h-4 w-4 shrink-0 text-bordeaux dark:text-bordeaux-dark"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="truncate font-display text-sm font-semibold text-content-primary dark:text-content-dark-primary">
              {title ?? "Áudio"}
            </p>
          </div>

          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(event) => handleSeek(Number(event.target.value))}
            aria-label="Progresso da reprodução"
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-secondary accent-bordeaux dark:bg-surface-dark-secondary dark:accent-bordeaux-dark"
            style={{
              background: `linear-gradient(to right, #8A1538 ${progress}%, #EDF2F7 ${progress}%)`,
            }}
          />

          <div className="flex justify-between font-mono text-xs text-content-tertiary dark:text-content-dark-tertiary">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
