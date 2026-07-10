import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type {
  AuthResponse,
  MeResponse,
  UpdateProfilePayload,
  User,
} from "@shared/types";
import {
  API_URL,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  parseApiError,
} from "@/lib/api";

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
    provinceId: number,
  ) => Promise<User>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<User>;
  logout: () => Promise<void>;
  getFirstName: (name: string) => string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback(async (nextUser: User, nextToken: string) => {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_STORAGE_KEY, USER_STORAGE_KEY]);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem(TOKEN_STORAGE_KEY),
          AsyncStorage.getItem(USER_STORAGE_KEY),
        ]);

        if (!storedToken) {
          return;
        }

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser) as User);
            setToken(storedToken);
          } catch {
            // ignore invalid cache
          }
        }

        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.status === 401 || response.status === 403) {
          await clearSession();
          return;
        }

        if (!response.ok) {
          // Mantém sessão em cache se a API estiver temporariamente indisponível.
          return;
        }

        const data = (await response.json()) as MeResponse;
        if (!cancelled) {
          await persistSession(data.user, storedToken);
        }
      } catch {
        // Mantém sessão em cache em falhas de rede.
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
  }, [clearSession, persistSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      let response: Response;

      try {
        response = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
      } catch {
        throw new Error(
          `Sem ligação à API (${API_URL}). Confirma que o backend está a correr.`,
        );
      }

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as AuthResponse;
      await persistSession(data.user, data.token);
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
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as AuthResponse;
      await persistSession(data.user, data.token);
      return data.user;
    },
    [persistSession],
  );

  const updateProfile = useCallback(
    async (payload: UpdateProfilePayload) => {
      if (!token) {
        throw new Error("Sessão inválida.");
      }

      let response: Response;

      if (payload.avatar) {
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

        const avatar = payload.avatar as unknown as {
          uri: string;
          name: string;
          type: string;
        };

        // Web: precisa de File/Blob real. Native: FormData aceita { uri, name, type }.
        // Sem isto, o Laravel recebe "avatar" como string e valida como avatar_url.
        if (Platform.OS === "web") {
          const fileResponse = await fetch(avatar.uri);
          const blob = await fileResponse.blob();
          const mime = avatar.type || blob.type || "image/jpeg";
          const fileName =
            avatar.name && !avatar.name.includes("blob")
              ? avatar.name
              : `avatar.${mime.split("/")[1] === "png" ? "png" : "jpg"}`;
          formData.append("avatar", new File([blob], fileName, { type: mime }));
        } else {
          formData.append(
            "avatar",
            {
              uri: avatar.uri,
              name: avatar.name,
              type: avatar.type || "image/jpeg",
            } as unknown as Blob,
          );
        }

        response = await fetch(`${API_URL}/auth/profile`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
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
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(jsonPayload),
        });
      }

      if (!response.ok) {
        throw new Error(await parseApiError(response));
      }

      const data = (await response.json()) as { user: User };
      await persistSession(data.user, token);
      return data.user;
    },
    [persistSession, token],
  );

  const logout = useCallback(async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } catch {
        // ignore network errors on logout
      }
    }

    await clearSession();
  }, [clearSession, token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      updateProfile,
      logout,
      getFirstName,
    }),
    [user, token, isLoading, login, register, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
