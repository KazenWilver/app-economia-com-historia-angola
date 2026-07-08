"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { API_URL } from "@/lib/api";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "user" | "admin";
  avatar_url: string | null;
}

interface AuthResponse {
  user: AdminUser;
  token: string;
}

interface MeResponse {
  user: AdminUser;
}

interface AdminAuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
    adminKey: string,
  ) => Promise<AdminUser>;
  logout: () => Promise<void>;
}

/** Storage exclusiva do painel — nunca partilhada com o site público. */
export const ADMIN_TOKEN_STORAGE_KEY = "jindungo_admin_token";
export const ADMIN_USER_STORAGE_KEY = "jindungo_admin_user";

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(
  undefined,
);

function readStoredAdminUser(): AdminUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(ADMIN_USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
    return null;
  }
}

function readStoredAdminToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
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

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  // Estado inicial idêntico no servidor e no cliente (evita hydration mismatch).
  // A sessão só é lida do localStorage depois do mount.
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback(
    (nextUser: AdminUser | null, nextToken: string | null) => {
      if (nextToken && nextUser) {
        localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, nextToken);
        localStorage.setItem(ADMIN_USER_STORAGE_KEY, JSON.stringify(nextUser));
      } else {
        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
        localStorage.removeItem(ADMIN_USER_STORAGE_KEY);
      }

      setToken(nextToken);
      setUser(nextUser);
    },
    [],
  );

  const clearSession = useCallback(() => {
    persistSession(null, null);
  }, [persistSession]);

  const fetchMe = useCallback(
    async (authToken: string) => {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Sessão de administrador inválida.");
      }

      const data = (await response.json()) as MeResponse;

      if (data.user.role !== "admin") {
        throw new Error("Conta sem permissões de administrador.");
      }

      persistSession(data.user, authToken);
      return data.user;
    },
    [persistSession],
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const storedToken = readStoredAdminToken();
      const storedUser = readStoredAdminUser();

      if (!storedToken) {
        if (!cancelled) {
          setIsLoading(false);
        }
        return;
      }

      if (storedUser?.role === "admin" && !cancelled) {
        setToken(storedToken);
        setUser(storedUser);
        setIsLoading(false);

        try {
          await fetchMe(storedToken);
        } catch {
          if (!cancelled) {
            clearSession();
          }
        }
        return;
      }

      try {
        await fetchMe(storedToken);
      } catch {
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

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

      if (data.user.role !== "admin") {
        throw new Error(
          "Esta conta não tem permissões de administrador. Usa o login público em /login.",
        );
      }

      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession],
  );

  const register = useCallback(
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

      if (data.user.role !== "admin") {
        throw new Error("O registo não devolveu uma conta de administrador.");
      }

      persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession],
  );

  const logout = useCallback(async () => {
    const activeToken = token ?? readStoredAdminToken();
    clearSession();

    if (activeToken) {
      void fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
      }).catch(() => {
        // Sessão admin já limpa localmente.
      });
    }
  }, [clearSession, token]);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      isAdmin: Boolean(user && token && user.role === "admin"),
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  );

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth deve ser usado dentro de AdminAuthProvider.");
  }

  return context;
}
