import { API_URL } from "@/lib/api";

export interface PasswordResetMessageResponse {
  message: string;
  dev_reset_link?: string;
}

async function parseErrorMessage(response: Response): Promise<string> {
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

  const data = (await response.json()) as PasswordResetMessageResponse;

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return data;
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

  const data = (await response.json()) as PasswordResetMessageResponse;

  if (!response.ok) {
    throw new Error(data.message ?? (await parseErrorMessage(response)));
  }

  return data;
}
