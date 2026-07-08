import {
  getMemoryCache,
  invalidateMemoryCache,
  setMemoryCache,
} from "@/lib/memory-cache";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export const TOKEN_STORAGE_KEY = "jindungo_token";
export const USER_STORAGE_KEY = "jindungo_user";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function buildAuthHeaders(token?: string | null): HeadersInit {
  const authToken = token ?? getStoredToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  return headers;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & {
    token?: string | null;
    cacheTtlMs?: number;
    cacheKey?: string;
    skipCache?: boolean;
  } = {},
): Promise<T> {
  const {
    token,
    headers,
    cacheTtlMs = 0,
    cacheKey,
    skipCache = false,
    ...rest
  } = options;

  const method = (rest.method ?? "GET").toUpperCase();
  const key = cacheKey ?? `${method}:${path}`;

  if (method === "GET" && cacheTtlMs > 0 && !skipCache) {
    const cached = getMemoryCache<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      ...buildAuthHeaders(token),
      ...(headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data = (await response.json()) as T;

  if (method === "GET" && cacheTtlMs > 0) {
    setMemoryCache(key, data, cacheTtlMs);
  }

  if (method !== "GET") {
    invalidateMemoryCache("GET:");
  }

  return data;
}
