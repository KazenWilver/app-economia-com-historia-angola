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

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "user" | "admin";
  avatar_url: string | null;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface MeResponse {
  user: User;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => Promise<User>;
  logout: () => Promise<void>;
  getFirstName: (name: string) => string;
  setWelcomeMessage: (name: string) => void;
  consumeWelcomeMessage: () => string | null;
}

const TOKEN_STORAGE_KEY = "jindungo_token";
const WELCOME_STORAGE_KEY = "jindungo_welcome";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistToken = useCallback((value: string | null) => {
    if (value) {
      localStorage.setItem(TOKEN_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    setToken(value);
  }, []);

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
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        await fetchMe(storedToken);
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrap();
  }, [fetchMe]);

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
      persistToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [persistToken],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      passwordConfirmation: string,
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
        }),
      });

      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }

      const data = (await response.json()) as AuthResponse;
      persistToken(data.token);
      setUser(data.user);
      return data.user;
    },
    [persistToken],
  );

  const logout = useCallback(async () => {
    const activeToken = token ?? localStorage.getItem(TOKEN_STORAGE_KEY);

    if (activeToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${activeToken}`,
          },
        });
      } catch {
        // Mesmo com falha de rede, limpamos a sessão local.
      }
    }

    persistToken(null);
    setUser(null);
    sessionStorage.removeItem(WELCOME_STORAGE_KEY);
  }, [persistToken, token]);

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
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      getFirstName,
      setWelcomeMessage,
      consumeWelcomeMessage,
    }),
    [
      user,
      token,
      isLoading,
      login,
      register,
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
