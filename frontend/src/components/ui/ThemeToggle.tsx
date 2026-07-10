"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Activar modo claro" : "Activar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-lg text-content-secondary transition-colors",
        "hover:bg-surface-secondary hover:text-content-primary",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bordeaux",
        "dark:text-content-dark-secondary dark:hover:bg-surface-dark-secondary dark:hover:text-content-dark-primary",
        "dark:focus-visible:outline-bordeaux-dark",
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      ) : (
        <Moon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
      )}
    </button>
  );
}
