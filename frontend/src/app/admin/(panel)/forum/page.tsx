"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  type AdminTopic,
  type AdminTopicsResponse,
} from "@/components/admin/forum-types";
import { AdminConfirmDeleteModal } from "@/components/admin/AdminConfirmDeleteModal";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type VisibilityFilter = "all" | "visible" | "hidden";

const FILTERS: { value: VisibilityFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "visible", label: "Visíveis" },
  { value: "hidden", label: "Ocultos" },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminForumPage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [topics, setTopics] = useState<AdminTopic[]>([]);
  const [filter, setFilter] = useState<VisibilityFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<AdminTopic | null>(null);

  const loadTopics = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await adminFetch<AdminTopicsResponse>("/admin/topics", {
        token,
      });
      setTopics(data.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os tópicos.",
      );
      setTopics([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadTopics();
  }, [loadTopics]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("created") === "1") {
      setSuccessMessage("Tópico criado com sucesso.");
      router.replace("/admin/forum");
    }
  }, [router]);

  const filteredTopics = useMemo(() => {
    if (filter === "visible") {
      return topics.filter((topic) => topic.is_visible);
    }
    if (filter === "hidden") {
      return topics.filter((topic) => !topic.is_visible);
    }
    return topics;
  }, [topics, filter]);

  const confirmDelete = async () => {
    if (!token || !topicToDelete) {
      return;
    }

    setBusyId(topicToDelete.id);
    setErrorMessage(null);

    try {
      await adminFetch(`/topics/${topicToDelete.id}`, {
        method: "DELETE",
        token,
      });
      setTopics((current) =>
        current.filter((item) => item.id !== topicToDelete.id),
      );
      setSuccessMessage("Tópico eliminado com sucesso.");
      setTopicToDelete(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível eliminar.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const toggleVisible = async (topic: AdminTopic) => {
    if (!token) return;
    setBusyId(topic.id);
    try {
      await adminFetch(`/topics/${topic.id}`, {
        method: "PUT",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_visible: !topic.is_visible }),
      });
      setTopics((current) =>
        current.map((item) =>
          item.id === topic.id
            ? { ...item, is_visible: !item.is_visible }
            : item,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível actualizar.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-content-dark-primary">
            Fórum
          </h1>
          <p className="mt-2 text-slate-600 dark:text-content-dark-secondary">
            Modera debates e gere tópicos de discussão.
          </p>
        </div>
        <Link href="/admin/forum/novo">
          <Button type="button">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Novo tópico
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
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              filter === item.value
                ? "bg-bordeaux text-white dark:bg-bordeaux-dark"
                : "bg-slate-100 text-slate-700 dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Card hoverLift={false} className="border-slate-200 bg-white dark:border-border-dark dark:bg-surface-dark-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredTopics.length === 0 ? (
            <p className="p-8 text-center text-slate-600 dark:text-content-dark-secondary">
              Nenhum tópico encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-border-dark">
                <thead className="bg-slate-50 dark:bg-surface-dark-secondary">
                  <tr>
                    <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                      Título
                    </th>
                    <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                      Fórum
                    </th>
                    <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                      Respostas
                    </th>
                    <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                      Estado
                    </th>
                    <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                      Criado
                    </th>
                    <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                      Acções
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
                  {filteredTopics.map((topic) => (
                    <tr key={topic.id}>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-content-dark-primary">
                        {topic.title}
                        {topic.is_private ? (
                          <span className="ml-2 text-xs text-amber-700">Privado</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">{topic.forum?.name ?? "—"}</td>
                      <td className="px-4 py-3">{topic.replies_count ?? 0}</td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={busyId === topic.id}
                          onClick={() => void toggleVisible(topic)}
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            topic.is_visible
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700",
                          )}
                        >
                          {topic.is_visible ? "Visível" : "Oculto"}
                        </button>
                      </td>
                      <td className="px-4 py-3">{formatDate(topic.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/forum/${topic.id}/editar`}
                            className="inline-flex items-center gap-1 text-bordeaux hover:underline dark:text-bordeaux-dark"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                            Editar
                          </Link>
                          <button
                            type="button"
                            disabled={busyId === topic.id}
                            onClick={() => setTopicToDelete(topic)}
                            className="inline-flex items-center gap-1 text-red-600"
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
        isOpen={topicToDelete !== null}
        title="Eliminar tópico"
        message="Deseja eliminar este tópico? Esta acção não pode ser anulada."
        itemLabel={topicToDelete?.title}
        itemDetail={
          topicToDelete
            ? `${topicToDelete.forum?.name ?? "Fórum"} · ${topicToDelete.replies_count ?? 0} resposta(s)`
            : undefined
        }
        isLoading={busyId === topicToDelete?.id}
        onCancel={() => setTopicToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
