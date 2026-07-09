"use client";

import { cn } from "@/lib/utils";
import { formatMediaTime } from "@/components/content/media-player-utils";

export interface MediaSeekBarProps {
  currentTime: number;
  duration: number;
  progress: number;
  onSeekStart: () => void;
  onSeek: (value: number) => void;
  onSeekEnd: () => void;
  className?: string;
}

export function MediaSeekBar({
  currentTime,
  duration,
  progress,
  onSeekStart,
  onSeek,
  onSeekEnd,
  className,
}: MediaSeekBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={currentTime}
        onPointerDown={onSeekStart}
        onChange={(event) => onSeek(Number(event.target.value))}
        onPointerUp={onSeekEnd}
        onKeyUp={onSeekEnd}
        aria-label="Progresso da reprodução"
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-secondary accent-bordeaux dark:bg-surface-dark-secondary dark:accent-bordeaux-dark"
        style={{
          background: `linear-gradient(to right, #8A1538 ${progress}%, #EDF2F7 ${progress}%)`,
        }}
      />

      <div className="flex justify-between font-mono text-xs text-content-tertiary dark:text-content-dark-tertiary">
        <span>{formatMediaTime(currentTime)}</span>
        <span>{formatMediaTime(duration)}</span>
      </div>
    </div>
  );
}
