import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Appearance, useColorScheme } from "react-native";
import {
  THEME_STORAGE_KEY,
  getThemeColors,
  type ThemeColors,
  type ThemeMode,
} from "@/lib/theme";

interface ThemeContextValue {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>(
    systemScheme === "dark" ? "dark" : "light",
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (cancelled) {
          return;
        }
        if (stored === "light" || stored === "dark") {
          setThemeState(stored);
        } else {
          const system = Appearance.getColorScheme() === "dark" ? "dark" : "light";
          setThemeState(system);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    setThemeState(next);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const next: ThemeMode = current === "dark" ? "light" : "dark";
      void AsyncStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  }, []);

  const colors = useMemo(() => getThemeColors(theme), [theme]);

  const value = useMemo(
    () => ({
      theme,
      colors,
      isDark: theme === "dark",
      setTheme,
      toggleTheme,
    }),
    [theme, colors, setTheme, toggleTheme],
  );

  if (!ready) {
    return (
      <ThemeContext.Provider
        value={{
          theme: "light",
          colors: getThemeColors("light"),
          isDark: false,
          setTheme: () => undefined,
          toggleTheme: () => undefined,
        }}
      >
        {children}
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de ThemeProvider");
  }
  return context;
}

export function useThemeColors(): ThemeColors {
  return useTheme().colors;
}
