"use client";

import { cn } from "@/lib/utils";
import { resolveMediaUrl } from "@/components/content/types";

export interface VideoPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

export function VideoPlayer({ src, title, className }: VideoPlayerProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-black dark:border-border-dark",
        className,
      )}
    >
      <video
        className="aspect-video w-full bg-black"
        controls
        preload="metadata"
        playsInline
        aria-label={title ?? "Vídeo"}
      >
        <source src={resolveMediaUrl(src)} />
        O teu navegador não suporta reprodução de vídeo.
      </video>
    </div>
  );
}
