"use client";

import Link from "next/link";
import {
  BookOpen,
  Map,
  MessageSquare,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const shortcuts = [
  {
    href: "/explorar",
    label: "Explorar conteúdos",
    description: "Continua a descobrir narrativas multimédia.",
    icon: BookOpen,
  },
  {
    href: "/quiz",
    label: "Quizzes",
    description: "Testa o teu conhecimento e ganha pontos.",
    icon: Sparkles,
  },
  {
    href: "/ranking",
    label: "Ranking",
    description: "Vê a tua posição a nível nacional ou regional.",
    icon: Trophy,
  },
  {
    href: "/forum",
    label: "Fórum",
    description: "Participa nos debates da comunidade.",
    icon: MessageSquare,
  },
  {
    href: "/mapa",
    label: "Mapa interactivo",
    description: "Explora a história económica por província.",
    icon: Map,
  },
] as const;

export function ProfileShortcuts() {
  return (
    <Card hoverLift={false}>
      <CardHeader>
        <CardTitle>Atalhos</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {shortcuts.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-11 items-start gap-3 rounded-2xl border border-border p-4 transition-colors hover:border-bordeaux/40 hover:bg-surface-secondary dark:border-border-dark dark:hover:border-bordeaux-dark/40 dark:hover:bg-surface-dark-secondary"
            >
              <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bordeaux/10 text-bordeaux dark:bg-bordeaux-dark/15 dark:text-bordeaux-dark">
                <Icon className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-sm font-semibold tracking-display text-content-primary group-hover:text-bordeaux dark:text-content-dark-primary dark:group-hover:text-bordeaux-dark">
                  {item.label}
                </span>
                <span className="mt-1 block text-xs text-content-secondary dark:text-content-dark-secondary">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
