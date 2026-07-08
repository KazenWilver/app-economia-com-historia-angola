"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  FileText,
  MessageSquare,
  Trophy,
  Users,
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { AdminStatsCharts } from "@/components/admin/AdminStatsCharts";
import {
  type AdminStatsResponse,
  type AdminStatsTotals,
} from "@/components/admin/stats-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/admin-api";

interface SummaryCard {
  key: keyof AdminStatsTotals;
  label: string;
  description: string;
  href: string;
  icon: typeof Users;
}

const SUMMARY_CARDS: SummaryCard[] = [
  {
    key: "users",
    label: "Utilizadores",
    description: "Contas registadas na plataforma",
    href: "/admin/utilizadores",
    icon: Users,
  },
  {
    key: "contents",
    label: "Conteúdos",
    description: "Artigos, áudios, vídeos e podcasts",
    href: "/admin/conteudos",
    icon: FileText,
  },
  {
    key: "quiz_attempts",
    label: "Quizzes realizados",
    description: "Tentativas concluídas pelos utilizadores",
    href: "/admin/quizzes",
    icon: Trophy,
  },
  {
    key: "topics",
    label: "Tópicos criados",
    description: "Debates abertos no fórum",
    href: "/admin/forum",
    icon: MessageSquare,
  },
];

export default function AdminDashboardPage() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<AdminStatsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await adminFetch<AdminStatsResponse>("/admin/stats", {
        token,
      });
      setStats(data.data);
    } catch (error) {
      setStats(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar as estatísticas.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-content-dark-primary">
            Dashboard
          </h1>
          <p className="mt-2 text-slate-600 dark:text-content-dark-secondary">
            Resumo da actividade e métricas principais do Jindungo.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-content-dark-tertiary">
          <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
          Dados em tempo real da API
        </div>
      </header>

      {errorMessage ? (
        <Toast
          variant="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;
          const value = stats?.totals[card.key];

          return (
            <Link key={card.key} href={card.href} className="block h-full">
              <Card
                hoverLift={false}
                className="h-full border-slate-200 bg-white transition-colors hover:border-bordeaux/40 dark:border-border-dark dark:bg-surface-dark-card"
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base text-slate-900 dark:text-content-dark-primary">
                      {card.label}
                    </CardTitle>
                    <p className="mt-1 text-xs text-slate-500 dark:text-content-dark-tertiary">
                      {card.description}
                    </p>
                  </div>
                  <Icon
                    className="h-5 w-5 shrink-0 text-bordeaux dark:text-bordeaux-dark"
                    strokeWidth={1.5}
                  />
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-9 w-20" />
                  ) : (
                    <p className="font-display text-3xl font-bold text-bordeaux dark:text-bordeaux-dark">
                      {value ?? 0}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : stats ? (
        <AdminStatsCharts stats={stats} />
      ) : null}
    </div>
  );
}
