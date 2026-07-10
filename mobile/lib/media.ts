import { API_URL } from "@/lib/api";
import type { ContentType } from "@shared/types";

function getApiOrigin(): string {
  return API_URL.replace(/\/api$/, "");
}

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

function stripUrlNoise(url: string): string {
  return url.split("#")[0]?.split("?")[0] ?? url;
}

/** Como na web: tipo audio/podcast manda; URL só como fallback. */
export function isAudioType(type: ContentType, url: string): boolean {
  if (type === "audio" || type === "podcast") {
    return true;
  }

  if (type === "video") {
    return false;
  }

  const clean = stripUrlNoise(url).toLowerCase();
  if (/\/(audio|podcast|audios)\//i.test(clean)) {
    return true;
  }

  return /\.(mp3|m4a|aac|wav|ogg)$/i.test(clean);
}

export function isVideoType(type: ContentType, url: string): boolean {
  if (type === "video") {
    return true;
  }

  if (type === "audio" || type === "podcast") {
    return false;
  }

  const clean = stripUrlNoise(url).toLowerCase();
  if (/\/videos?\//i.test(clean)) {
    return true;
  }

  return /\.(mp4|webm|mov|m4v)$/i.test(clean);
}

export function isImageUrl(url: string): boolean {
  const clean = stripUrlNoise(url).toLowerCase();
  return (
    /\.(jpe?g|png|gif|webp)$/i.test(clean) ||
    clean.includes("/avatars/") ||
    /\/images?\//i.test(clean)
  );
}

export function formatMediaTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
