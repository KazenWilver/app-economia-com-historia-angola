import { API_URL } from "@/lib/api";

export function formatMediaTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

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

export function resolveMediaUrl(url: string): string {
  if (url.startsWith("blob:")) {
    return url;
  }

  const storagePath = extractStoragePath(url);

  if (storagePath) {
    return `${API_URL}/media/${storagePath}`;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return url.startsWith("/") ? url : `/${url}`;
}

export function seekMediaElement(
  element: HTMLMediaElement,
  value: number,
  duration: number,
): number {
  if (!Number.isFinite(value)) {
    return element.currentTime;
  }

  const max = Number.isFinite(duration) && duration > 0 ? duration : value;
  const nextTime = Math.max(0, Math.min(value, max));

  element.currentTime = nextTime;

  return nextTime;
}
