import { API_URL } from "@/lib/api";
import { notifyDataChanged } from "@/lib/data-refresh";
import { invalidateMemoryCache } from "@/lib/memory-cache";
import { ADMIN_TOKEN_STORAGE_KEY } from "@/contexts/AdminAuthContext";

export function getStoredAdminToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
}

export function buildAdminHeaders(
  token?: string | null,
  extra?: HeadersInit,
): HeadersInit {
  const authToken = token ?? getStoredAdminToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  if (extra) {
    Object.assign(headers, extra);
  }

  return headers;
}

export async function parseApiError(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      message?: string;
      errors?: Record<string, string[]>;
    };

    if (data.errors) {
      const firstError = Object.values(data.errors)[0]?.[0];
      if (firstError) {
        return firstError;
      }
    }

    if (data.message) {
      return data.message;
    }
  } catch {
    // Ignorar JSON inválido.
  }

  return "Ocorreu um erro inesperado. Tenta novamente.";
}

export async function adminFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const method = (rest.method ?? "GET").toUpperCase();

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: buildAdminHeaders(token, headers),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  if (method !== "GET") {
    invalidateMemoryCache();
    notifyDataChanged();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export { API_URL };
