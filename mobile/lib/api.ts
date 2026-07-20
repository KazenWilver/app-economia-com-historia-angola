import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Extrai o host LAN a partir de hostUri do Expo.
 * Formatos comuns: "192.168.1.10:8081", "exp://192.168.1.10:8081",
 * "http://192.168.1.10:8081".
 *
 * Bug antigo: `hostUri.split(":")[0]` em URLs com protocolo gerava
 * `http://http:8000/api` e a app falhava no Expo Go.
 */
function extractLanHost(hostUri: string): string | null {
  if (!hostUri.trim()) {
    return null;
  }

  try {
    const normalized = hostUri.includes("://")
      ? hostUri
      : `http://${hostUri}`;
    const { hostname } = new URL(normalized);
    if (
      hostname &&
      hostname !== "localhost" &&
      hostname !== "127.0.0.1" &&
      hostname !== "http" &&
      hostname !== "https" &&
      hostname !== "exp"
    ) {
      return hostname;
    }
  } catch {
    const withoutProtocol = hostUri.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
    const hostPort = withoutProtocol.split("/")[0] ?? "";
    const host = hostPort.split(":")[0]?.trim() ?? "";
    if (
      host &&
      host !== "localhost" &&
      host !== "127.0.0.1" &&
      host !== "http" &&
      host !== "https" &&
      host !== "exp"
    ) {
      return host;
    }
  }

  return null;
}

function readExpoHostUri(): string {
  const expoConfig = Constants.expoConfig as
    | { hostUri?: string }
    | null
    | undefined;
  const manifest2 = (
    Constants as {
      manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
    }
  ).manifest2;
  const experienceUrl =
    typeof Constants.experienceUrl === "string"
      ? Constants.experienceUrl
      : "";

  return (
    expoConfig?.hostUri ??
    manifest2?.extra?.expoClient?.hostUri ??
    experienceUrl ??
    ""
  );
}

/**
 * Emulador Android → 10.0.2.2
 * Expo Go no telemóvel → IP LAN do PC (automático via hostUri, ou EXPO_PUBLIC_API_URL)
 * Ex.: EXPO_PUBLIC_API_URL=http://192.168.1.10:8000/api
 */
function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  const lanHost = extractLanHost(readExpoHostUri());
  if (lanHost) {
    return `http://${lanHost}:8000/api`;
  }

  // Só o emulador Android usa 10.0.2.2 (não o telemóvel físico).
  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000/api";
  }

  return "http://localhost:8000/api";
}

import { notifyDataChanged } from "@/lib/data-refresh";

export const API_URL = resolveApiUrl();

export const TOKEN_STORAGE_KEY = "jindungo_mobile_token";
export const USER_STORAGE_KEY = "jindungo_mobile_user";

export function buildAuthHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
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
    // ignore
  }

  return "Ocorreu um erro inesperado. Tenta novamente.";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {},
): Promise<T> {
  const { token, headers, ...rest } = options;
  const method = (rest.method ?? "GET").toUpperCase();

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        ...buildAuthHeaders(token),
        ...(headers as Record<string, string> | undefined),
      },
    });
  } catch {
    throw new Error(
      `Sem ligação à API (${API_URL}). Confirma que o backend está a correr e que o telemóvel está na mesma rede Wi‑Fi.`,
    );
  }

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  if (method !== "GET") {
    notifyDataChanged();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
