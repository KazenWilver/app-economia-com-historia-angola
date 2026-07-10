import { API_URL } from "@/lib/api";
import type { ContentType } from "@shared/types";

function extractStoragePath(url: string): string | null {
  const apiOrigin = API_URL.replace(/\/api$/, "");

  if (url.startsWith("http://") || url.startsWith("https://")) {
    if (url.startsWith(`${apiOrigin}/storage/`)) {
      return url.slice(`${apiOrigin}/storage/`.length);
    }

    if (url.includes("/api/media/")) {
      return url.split("/api/media/")[1] ?? null;
    }

    return null;
  }

  if (url.startsWith("/storage/")) {
    return url.slice("/storage/".length);
  }

  if (url.startsWith("/api/media/")) {
    return url.slice("/api/media/".length);
  }

  return null;
}

/** Resolve URL de media para stream da API (compatível com telemóvel na LAN). */
export function resolveMediaUrl(url: string): string {
  const storagePath = extractStoragePath(url);

  if (storagePath) {
    return `${API_URL}/media/${storagePath}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    const origin = API_URL.replace(/\/api$/, "");
    return `${origin}${url}`;
  }

  return url;
}

export function isAudioType(type: ContentType, url: string): boolean {
  if (type === "audio" || type === "podcast") {
    return true;
  }

  return /\.(mp3|m4a|aac|wav|ogg)(\?|$)/i.test(url);
}

export function isVideoType(type: ContentType, url: string): boolean {
  if (type === "video") {
    return true;
  }

  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url);
}

export function formatMediaTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
