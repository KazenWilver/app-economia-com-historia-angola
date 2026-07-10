export type ThemeMode = "light" | "dark";

export const THEME_STORAGE_KEY = "jindungo_theme";

/** Paleta alinhada com frontend/tailwind.config.ts */
export const lightColors = {
  bordeaux: "#8A1538",
  bordeauxAccent: "#8A1538",
  bordeauxMuted: "#FCE7F3",
  petrol: "#2C7A7B",
  petrolAccent: "#2C7A7B",
  gold: "#D4AF37",
  goldAccent: "#D4AF37",
  surface: "#F5F5F7",
  surfaceCard: "#FFFFFF",
  surfaceSecondary: "#EEEEF0",
  surfaceElevated: "#FFFFFF",
  contentPrimary: "#1A202C",
  contentSecondary: "#4A5568",
  contentTertiary: "#A0AEC0",
  border: "#E5E5EA",
  white: "#FFFFFF",
  error: "#DC2626",
  success: "#059669",
  info: "#2563EB",
  overlay: "rgba(15, 23, 42, 0.45)",
  /** Compat legado (auth / headers) */
  bordeauxDark: "#E11D48",
  petrolDark: "#4FD1C5",
  goldDark: "#F6E05E",
  surfaceDark: "#0F172A",
  surfaceDarkCard: "#1E293B",
  contentDarkPrimary: "#F8FAFC",
  contentDarkSecondary: "#CBD5E1",
  borderDark: "#334155",
} as const;

export const darkColors = {
  bordeaux: "#E11D48",
  bordeauxAccent: "#E11D48",
  bordeauxMuted: "rgba(225, 29, 72, 0.18)",
  petrol: "#4FD1C5",
  petrolAccent: "#4FD1C5",
  gold: "#F6E05E",
  goldAccent: "#F6E05E",
  surface: "#0F172A",
  surfaceCard: "#1E293B",
  surfaceSecondary: "#334155",
  surfaceElevated: "#1E293B",
  contentPrimary: "#F8FAFC",
  contentSecondary: "#CBD5E1",
  contentTertiary: "#64748B",
  border: "#334155",
  white: "#FFFFFF",
  error: "#EF4444",
  success: "#10B981",
  info: "#60A5FA",
  overlay: "rgba(0, 0, 0, 0.55)",
  bordeauxDark: "#E11D48",
  petrolDark: "#4FD1C5",
  goldDark: "#F6E05E",
  surfaceDark: "#0F172A",
  surfaceDarkCard: "#1E293B",
  contentDarkPrimary: "#F8FAFC",
  contentDarkSecondary: "#CBD5E1",
  borderDark: "#334155",
} as const;

export type ThemeColors = {
  bordeaux: string;
  bordeauxAccent: string;
  bordeauxMuted: string;
  petrol: string;
  petrolAccent: string;
  gold: string;
  goldAccent: string;
  surface: string;
  surfaceCard: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  contentPrimary: string;
  contentSecondary: string;
  contentTertiary: string;
  border: string;
  white: string;
  error: string;
  success: string;
  info: string;
  overlay: string;
  bordeauxDark: string;
  petrolDark: string;
  goldDark: string;
  surfaceDark: string;
  surfaceDarkCard: string;
  contentDarkPrimary: string;
  contentDarkSecondary: string;
  borderDark: string;
};

export function getThemeColors(mode: ThemeMode): ThemeColors {
  return mode === "dark" ? darkColors : lightColors;
}

/** Fallback estático (light) — preferir useThemeColors() nos ecrãs. */
export const colors = lightColors;

export const TYPE_LABELS: Record<string, string> = {
  texto: "Texto",
  audio: "Áudio",
  video: "Vídeo",
  podcast: "Podcast",
  jindungo: "Jindungo",
};
