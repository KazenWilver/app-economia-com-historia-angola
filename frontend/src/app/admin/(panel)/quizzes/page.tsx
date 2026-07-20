"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  formatTimeLimit,
  type AdminQuiz,
  type AdminQuizzesResponse,
} from "@/components/admin/quiz-types";
import { AdminConfirmDeleteModal } from "@/components/admin/AdminConfirmDeleteModal";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { adminFetch } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "active" | "inactive";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminQuizzesPage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [quizToDelete, setQuizToDelete] = useState<AdminQuiz | null>(null);

  const loadQuizzes = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) {
        return;
      }

      if (!options?.silent) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const data = await adminFetch<AdminQuizzesResponse>("/admin/quizzes", {
          token,
        });
        setQuizzes(data.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os quizzes.",
        );
        setQuizzes([]);
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [token],
  );

  useLiveRefresh(loadQuizzes, { enabled: Boolean(token) });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("created") === "1") {
      setSuccessMessage("Quiz criado com sucesso.");
      void loadQuizzes({ silent: true });
      router.replace("/admin/quizzes");
    }
  }, [loadQuizzes, router]);

  const filteredQuizzes = useMemo(() => {
    if (statusFilter === "all") {
      return quizzes;
    }

    if (statusFilter === "active") {
      return quizzes.filter((quiz) => quiz.is_active);
    }

    return quizzes.filter((quiz) => !quiz.is_active);
  }, [quizzes, statusFilter]);

  const confirmDelete = async () => {
    if (!token || !quizToDelete) {
      return;
    }

    setBusyId(quizToDelete.id);
    setErrorMessage(null);

    try {
      await adminFetch(`/quizzes/${quizToDelete.id}`, {
        method: "DELETE",
        token,
      });
      setQuizzes((current) =>
        current.filter((item) => item.id !== quizToDelete.id),
      );
      setSuccessMessage("Quiz eliminado com sucesso.");
      setQuizToDelete(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível eliminar o quiz.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const toggleActive = async (quiz: AdminQuiz) => {
    if (!token) {
      return;
    }

    setBusyId(quiz.id);
    setErrorMessage(null);

    try {
      await adminFetch(`/quizzes/${quiz.id}`, {
        method: "PUT",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !quiz.is_active }),
      });

      setQuizzes((current) =>
        current.map((item) =>
          item.id === quiz.id ? { ...item, is_active: !item.is_active } : item,
        ),
      );
      setSuccessMessage(quiz.is_active ? "Quiz desactivado." : "Quiz activado.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível actualizar o quiz.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary">
            Quizzes
          </h1>
          <p className="mt-2 text-content-secondary dark:text-content-dark-secondary">
            Cria e gere quizzes interactivos para a plataforma.
          </p>
        </div>
        <Link href="/admin/quizzes/novo">
          <Button type="button">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Novo quiz
          </Button>
        </Link>
      </header>

      {successMessage ? (
        <Toast variant="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      ) : null}
      {errorMessage ? (
        <Toast variant="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              statusFilter === filter.value
                ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                : "bg-surface-secondary text-content-secondary hover:bg-surface-secondary dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <Card hoverLift={false} className="border-border bg-surface-card dark:border-border-dark dark:bg-surface-dark-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <p className="p-8 text-center text-content-secondary dark:text-content-dark-secondary">
              Nenhum quiz encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-secondary text-content-secondary dark:border-border-dark dark:bg-surface-dark-secondary dark:text-content-dark-secondary">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Título</th>
                    <th className="px-4 py-3 font-semibold">Perguntas</th>
                    <th className="px-4 py-3 font-semibold">Tempo</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Actualizado</th>
                    <th className="px-4 py-3 font-semibold">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuizzes.map((quiz) => (
                    <tr
                      key={quiz.id}
                      className="border-b border-border last:border-b-0 dark:border-border-dark"
                    >
                      <td className="px-4 py-3 font-medium text-content-primary dark:text-content-dark-primary">
                        {quiz.title}
                      </td>
                      <td className="px-4 py-3 text-content-secondary dark:text-content-dark-secondary">
                        {quiz.questions_count ?? 0}
                      </td>
                      <td className="px-4 py-3 text-content-secondary dark:text-content-dark-secondary">
                        {formatTimeLimit(quiz.time_limit_seconds)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={busyId === quiz.id}
                          onClick={() => void toggleActive(quiz)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            quiz.is_active
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                              : "bg-surface-secondary text-content-secondary dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
                          )}
                        >
                          {quiz.is_active ? "Activo" : "Inactivo"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-content-secondary dark:text-content-dark-secondary">
                        {formatDate(quiz.updated_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/quizzes/${quiz.id}/editar`}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-bordeaux hover:bg-bordeaux/10 dark:text-bordeaux-dark"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                            Editar
                          </Link>
                          <button
                            type="button"
                            disabled={busyId === quiz.id}
                            onClick={() => setQuizToDelete(quiz)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminConfirmDeleteModal
        isOpen={quizToDelete !== null}
        title="Eliminar quiz"
        message="Deseja eliminar este quiz? Esta acção não pode ser anulada."
        itemLabel={quizToDelete?.title}
        itemDetail={
          quizToDelete
            ? `${quizToDelete.questions_count ?? 0} pergunta(s) · ${formatTimeLimit(quizToDelete.time_limit_seconds)}`
            : undefined
        }
        isLoading={busyId === quizToDelete?.id}
        onCancel={() => setQuizToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
