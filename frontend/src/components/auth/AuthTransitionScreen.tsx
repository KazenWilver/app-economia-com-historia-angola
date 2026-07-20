"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const PUBLIC_MESSAGES = [
  "A preparar a tua viagem pela economia angolana…",
  "Cada província conta uma história diferente.",
  "O conhecimento de ontem ilumina o Angola de amanhã.",
  "A explorar narrativas, quizzes e mapas interactivos…",
];

const ADMIN_MESSAGES = [
  "A preparar o painel de administração…",
  "A organizar conteúdos e utilizadores…",
  "A sincronizar dados da plataforma…",
  "Quase pronto para gerires a experiência educativa…",
];

export interface AuthTransitionScreenProps {
  variant?: "public" | "admin";
  userName?: string | null;
}

export function AuthTransitionScreen({
  variant = "public",
  userName,
}: AuthTransitionScreenProps) {
  const isAdmin = variant === "admin";
  const messages = isAdmin ? ADMIN_MESSAGES : PUBLIC_MESSAGES;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, [messages.length]);

  const firstName = userName?.trim().split(/\s+/)[0];

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center",
        isAdmin
          ? "bg-surface text-content-primary dark:bg-surface-dark dark:text-content-dark-primary"
          : "bg-gradient-to-br from-bordeaux via-[#5C1830] to-petrol text-white",
      )}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={cn(
          "absolute inset-0 opacity-20",
          isAdmin
            ? "bg-[radial-gradient(circle_at_top,rgba(138,21,56,0.45),transparent_55%)]"
            : "bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_55%)]",
        )}
      />

      <div className="relative z-10 flex max-w-lg flex-col items-center">
        <p
          className={cn(
            "max-w-xs font-display text-xl font-extrabold leading-tight sm:text-2xl",
            isAdmin
              ? "text-bordeaux dark:text-bordeaux-dark"
              : "text-white",
          )}
        >
          {isAdmin
            ? "Economia com História – Admin"
            : "Economia com História – Angola"}
        </p>

        {firstName ? (
          <p className="mt-4 font-display text-xl font-semibold">
            Bem-vindo de volta, {firstName}
          </p>
        ) : (
          <p className="mt-4 font-display text-xl font-semibold">
            {isAdmin ? "A entrar no painel…" : "A entrar na plataforma…"}
          </p>
        )}

        <div className="mt-8 flex h-14 w-14 items-center justify-center">
          <span
            className={cn(
              "h-12 w-12 animate-spin rounded-full border-4 border-transparent",
              isAdmin
                ? "border-t-bordeaux border-r-bordeaux/30 dark:border-t-bordeaux-dark dark:border-r-bordeaux-dark/30"
                : "border-t-white border-r-white/30",
            )}
          />
        </div>

        <p
          className={cn(
            "mt-8 min-h-14 text-base leading-relaxed transition-opacity duration-500",
            isAdmin
              ? "text-content-secondary dark:text-content-dark-secondary"
              : "text-white/90",
          )}
        >
          {messages[messageIndex]}
        </p>
      </div>
    </div>
  );
}
