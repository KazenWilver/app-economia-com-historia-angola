import { API_URL } from "@/lib/api";
import type { ContentType } from "@shared/types";

function getApiOrigin(): string {
  return API_URL.replace(/\/api$/, "");
}

/**
 * Reescreve URLs com localhost/127.0.0.1 para o host actual da API
 * (necessário no telemóvel quando a BD guarda APP_URL=localhost).
 */
function rewriteLocalhostHost(url: string): string {
  const match = url.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i);
  if (!match) {
    return url;
  }

  return `${getApiOrigin()}${match[3] ?? ""}`;
}

function extractStoragePath(url: string): string | null {
  const apiOrigin = getApiOrigin();
  const normalized = rewriteLocalhostHost(url);

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    if (normalized.startsWith(`${apiOrigin}/storage/`)) {
      return normalized.slice(`${apiOrigin}/storage/`.length);
    }

    if (normalized.includes("/api/media/")) {
      return normalized.split("/api/media/")[1] ?? null;
    }

    // Qualquer /storage/ noutro host (ex. Docker interno)
    const storageIdx = normalized.indexOf("/storage/");
    if (storageIdx !== -1) {
      return normalized.slice(storageIdx + "/storage/".length);
    }

    return null;
  }

  if (normalized.startsWith("/storage/")) {
    return normalized.slice("/storage/".length);
  }

  if (normalized.startsWith("/api/media/")) {
    return normalized.slice("/api/media/".length);
  }

  return null;
}

/** Resolve URL de media/avatar para stream da API (compatível com telemóvel na LAN). */
export function resolveMediaUrl(url: string | null | undefined): string | null {
  if (!url) {
    return null;
  }

  const normalized = rewriteLocalhostHost(url);
  const storagePath = extractStoragePath(normalized);

  if (storagePath) {
    return `${API_URL}/media/${storagePath}`;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    return `${getApiOrigin()}${normalized}`;
  }

  return normalized;
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
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url) || url.includes("/avatars/");
}

export function formatMediaTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
