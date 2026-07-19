"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  API_URL,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "@/lib/api";
import type {
  AuthResponse,
  MeResponse,
  UpdateProfilePayload,
  User,
} from "@shared/types";

export type { UpdateProfilePayload, User } from "@shared/types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  /**
   * true apenas enquanto a sessão local (localStorage) ainda não foi lida.
   * Não espera por /auth/me — a revalidação corre em background.
   */
  isLoading: boolean;
  /** true enquanto /auth/me está a revalidar a sessão em background. */
  isValidating: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    provinceId: number,
  ) => Promise<User>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
  registerAdmin: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    adminKey: string,
  ) => Promise<User>;
  logout: () => Promise<void>;
  getFirstName: (name: string) => string;
  setWelcomeMessage: (name: string) => void;
  consumeWelcomeMessage: () => string | null;
}

const WELCOME_STORAGE_KEY = "jindungo_welcome";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function readStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function readStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY);
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

export function AuthProvider({ children }: { children: ReactNode }) {
  // Estado inicial idêntico no servidor e no 1.º render do cliente (evita hydration mismatch).
  // A sessão local é restaurada em useLayoutEffect — antes do paint do browser.
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);

  const persistSession = useCallback((nextUser: User | null, nextToken: string | null) => {
    if (nextToken && nextUser) {
      localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    }

    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    persistSession(null, null);
    sessionStorage.removeItem(WELCOME_STORAGE_KEY);
  }, [persistSession]);

  const fetchMe = useCallback(async (authToken: string) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Sessão inválida.");
    }

    const data = (await response.json()) as MeResponse;
    persistSession(data.user, authToken);
    return data.user;
  }, [persistSession]);

  useLayoutEffect(() => {
    let cancelled = false;

    const storedToken = readStoredToken();
    const storedUser = readStoredUser();

    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    if (storedUser) {
      // Sessão optimista: UI autenticada no 1.º paint; /auth/me em background.
      setToken(storedToken);
      setUser(storedUser);
      setIsLoading(false);
      setIsValidating(true);

      void fetchMe(storedToken)
        .catch(() => {
          if (!cancelled) {
            clearSession();
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsValidating(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }

    // Token sem user em cache (caso raro): só aqui esperamos /auth/me.
    // Páginas públicas já mostram "Entrar"; rotas protegidas mantêm o ecrã de carga.
    setToken(storedToken);
    setIsValidating(true);

    void fetchMe(storedToken)
      .catch(() => {
        if (!cancelled) {
          clearSession();
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsValidating(false);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clearSession, fetchMe]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const data = (await response.json()) as AuthResponse;
      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession],
  );

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      const activeToken = token ?? readStoredToken();

      if (!activeToken) {
        throw new Error("Sessão inválida.");
      }

      const hasAvatarFile = payload.avatar instanceof File;
      let response: Response;

      if (hasAvatarFile) {
        const formData = new FormData();
        formData.append("_method", "PUT");

        if (payload.name !== undefined) {
          formData.append("name", payload.name);
        }
        if (payload.email !== undefined) {
          formData.append("email", payload.email);
        }
        if (payload.phone !== undefined) {
          formData.append("phone", payload.phone ?? "");
        }
        if (payload.province_id !== undefined) {
          formData.append("province_id", String(payload.province_id));
        }
        if (payload.avatar_url !== undefined && payload.avatar_url !== null) {
          formData.append("avatar_url", payload.avatar_url);
        }
        formData.append("avatar", payload.avatar as File);

        response = await fetch(`${API_URL}/auth/profile`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
          body: formData,
        });
      } else {
        const jsonPayload: Record<string, unknown> = { ...payload };
        delete jsonPayload.avatar;

        response = await fetch(`${API_URL}/auth/profile`, {
          method: "PUT",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
          body: JSON.stringify(jsonPayload),
        });
      }

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const data = (await response.json()) as { user: User };
      persistSession(data.user, activeToken);
      return data.user;
    },
    [persistSession, token],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      passwordConfirmation: string,
      provinceId: number,
    ) => {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          province_id: provinceId,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const data = (await response.json()) as AuthResponse;
      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession],
  );

  const registerAdmin = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      passwordConfirmation: string,
      adminKey: string,
    ) => {
      const response = await fetch(`${API_URL}/auth/admin/register`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
          admin_key: adminKey,
        }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const data = (await response.json()) as AuthResponse;
      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    const activeToken = token ?? readStoredToken();
    clearSession();

    if (activeToken) {
      void fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
      }).catch(() => {
        // A sessão local já foi limpa.
      });
    }
  }, [clearSession, token]);

  const setWelcomeMessage = useCallback((name: string) => {
    sessionStorage.setItem(WELCOME_STORAGE_KEY, getFirstName(name));
  }, []);

  const consumeWelcomeMessage = useCallback(() => {
    const message = sessionStorage.getItem(WELCOME_STORAGE_KEY);
    if (message) {
      sessionStorage.removeItem(WELCOME_STORAGE_KEY);
    }
    return message;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isValidating,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      updateProfile,
      registerAdmin,
      logout,
      getFirstName,
      setWelcomeMessage,
      consumeWelcomeMessage,
    }),
    [
      user,
      token,
      isLoading,
      isValidating,
      login,
      register,
      updateProfile,
      registerAdmin,
      logout,
      setWelcomeMessage,
      consumeWelcomeMessage,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
