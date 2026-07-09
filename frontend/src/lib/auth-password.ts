import { API_URL } from "@/lib/api";

export interface PasswordResetMessageResponse {
  message: string;
  resetLink?: string;
  dev_reset_link?: string;
  devResetLink?: string;
}

interface ApiErrorPayload {
  message?: string;
  errors?: Record<string, string[]>;
}

function extractErrorMessage(data: ApiErrorPayload): string {
  if (data.errors) {
    const firstError = Object.values(data.errors)[0]?.[0];
    if (firstError) {
      return firstError;
    }
  }

  if (data.message) {
    return data.message;
  }

  return "Ocorreu um erro inesperado. Tenta novamente.";
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error("Resposta inválida do servidor. Tenta novamente.");
  }

  return (await response.json()) as T;
}

export function extractResetLink(
  response: PasswordResetMessageResponse,
): string | undefined {
  return response.resetLink ?? response.devResetLink ?? response.dev_reset_link;
}

export async function requestPasswordReset(
  email: string,
  redirect = "/login",
): Promise<PasswordResetMessageResponse> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, redirect }),
  });

  const data = await readJsonResponse<PasswordResetMessageResponse>(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data));
  }

  const resetLink = extractResetLink(data);

  return {
    ...data,
    resetLink,
    dev_reset_link: resetLink,
    devResetLink: resetLink,
  };
}

export async function resetPassword(payload: {
  email: string;
  token: string;
  password: string;
  passwordConfirmation: string;
}): Promise<PasswordResetMessageResponse> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: payload.email,
      token: payload.token,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    }),
  });

  const data = await readJsonResponse<PasswordResetMessageResponse>(response);

  if (!response.ok) {
    throw new Error(extractErrorMessage(data));
  }

  return data;
}
