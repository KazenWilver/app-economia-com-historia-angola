import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bordeaux: {
          DEFAULT: "#8A1538",
          dark: "#E11D48",
        },
        identity: {
          gray: "#4A5568",
        },
        gold: {
          DEFAULT: "#D4AF37",
          dark: "#F6E05E",
        },
        petrol: {
          DEFAULT: "#2C7A7B",
          dark: "#4FD1C5",
        },
        terracotta: "#DD6B20",
        surface: {
          DEFAULT: "#F5F5F7",
          card: "#FFFFFF",
          secondary: "#EEEEF0",
          dark: "#0F172A",
          "dark-card": "#1E293B",
          "dark-secondary": "#334155",
        },
        content: {
          primary: "#1A202C",
          secondary: "#4A5568",
          tertiary: "#A0AEC0",
          "dark-primary": "#F8FAFC",
          "dark-secondary": "#CBD5E1",
          "dark-tertiary": "#64748B",
        },
        border: {
          DEFAULT: "#E5E5EA",
          dark: "#334155",
        },
        success: {
          light: "#059669",
          dark: "#10B981",
        },
        error: {
          light: "#DC2626",
          dark: "#EF4444",
        },
        info: {
          light: "#2563EB",
          dark: "#60A5FA",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      letterSpacing: {
        display: "-0.02em",
      },
      boxShadow: {
        chrome: "0 1px 0 rgb(15 23 42 / 0.04)",
        soft: "0 4px 16px -4px rgb(15 23 42 / 0.08)",
        "card-hover": "0 8px 24px -8px rgb(138 21 56 / 0.12)",
        glass: "0 8px 32px rgb(15 23 42 / 0.10)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.5s infinite linear",
        "scale-in": "scale-in 0.2s ease-out",
      },
    },
  },
};

export default config;
