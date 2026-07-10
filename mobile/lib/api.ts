import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Emulador Android → 10.0.2.2
 * Expo Go no telemóvel → define EXPO_PUBLIC_API_URL com o IP da máquina
 * Ex.: EXPO_PUBLIC_API_URL=http://192.168.1.10:8000/api
 */
function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "");
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.experienceUrl ??
    "";

  if (Platform.OS === "android" && !hostUri.includes("exp.direct")) {
    return "http://10.0.2.2:8000/api";
  }

  const lanHost = hostUri.split(":")[0];
  if (lanHost && lanHost !== "localhost" && lanHost !== "127.0.0.1") {
    return `http://${lanHost}:8000/api`;
  }

  return "http://localhost:8000/api";
}

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

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
