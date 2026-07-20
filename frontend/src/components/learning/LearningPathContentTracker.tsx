"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiFetch } from "@/lib/api";

/**
 * Garante que, com sessão activa, a API regista a leitura do conteúdo
 * no trilho educativo (o SSR pode não enviar o token Sanctum).
 */
export function LearningPathContentTracker({ slug }: { slug: string }) {
  const { isAuthenticated } = useAuth();
  const doneRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || doneRef.current) {
      return;
    }

    doneRef.current = true;
    void apiFetch(`/contents/${slug}`, { cacheTtlMs: 0 }).catch(() => {
      doneRef.current = false;
    });
  }, [isAuthenticated, slug]);

  return null;
}
