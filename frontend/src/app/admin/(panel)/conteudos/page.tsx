"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Archive, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  STATUS_LABELS,
  TYPE_LABELS,
  type AdminContent,
  type AdminContentsResponse,
  type ContentStatus,
  type ContentType,
} from "@/components/admin/content-types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { adminFetch } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { value: ContentStatus | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Rascunhos" },
  { value: "published", label: "Publicados" },
  { value: "archived", label: "Arquivados" },
];

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusBadgeClass(status: ContentStatus): string {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "archived":
      return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300";
  }
}

export default function AdminContentsPage() {
  const { token } = useAdminAuth();
  const [contents, setContents] = useState<AdminContent[]>([]);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | "all">(
    "all",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadContents = useCallback(async () => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await adminFetch<AdminContentsResponse>("/admin/contents", {
        token,
      });
      setContents(data.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os conteúdos.",
      );
      setContents([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadContents();
  }, [loadContents]);

  const filteredContents = useMemo(() => {
    if (statusFilter === "all") {
      return contents;
    }

    return contents.filter((content) => content.status === statusFilter);
  }, [contents, statusFilter]);

  const updateStatus = async (content: AdminContent, status: ContentStatus) => {
    if (!token) {
      return;
    }

    setBusyId(content.id);
    setErrorMessage(null);

    try {
      await adminFetch(`/contents/${content.id}`, {
        method: "PUT",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setSuccessMessage(
        status === "published"
          ? "Conteúdo publicado."
          : status === "archived"
            ? "Conteúdo arquivado."
            : "Conteúdo marcado como rascunho.",
      );
      await loadContents();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível actualizar o estado.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const deleteContent = async (content: AdminContent) => {
    if (!token) {
      return;
    }

    const confirmed = window.confirm(
      `Eliminar permanentemente «${content.title}»? Esta acção não pode ser anulada.`,
    );

    if (!confirmed) {
      return;
    }

    setBusyId(content.id);
    setErrorMessage(null);

    try {
      await adminFetch(`/contents/${content.id}`, {
        method: "DELETE",
        token,
      });
      setSuccessMessage("Conteúdo eliminado.");
      await loadContents();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível eliminar o conteúdo.",
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
            Conteúdos
          </h1>
          <p className="mt-2 text-slate-600 dark:text-content-dark-secondary">
            Criar, editar, publicar e arquivar conteúdos da plataforma.
          </p>
        </div>
        <Link href="/admin/conteudos/novo">
          <Button type="button">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Novo conteúdo
          </Button>
        </Link>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-colors",
              statusFilter === filter.value
                ? "border-bordeaux bg-bordeaux text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-bordeaux hover:text-bordeaux dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-secondary",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {successMessage ? (
        <Toast
          variant="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      ) : null}

      {errorMessage ? (
        <Toast
          variant="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : filteredContents.length === 0 ? (
        <Card hoverLift={false}>
          <CardContent className="py-10 text-center text-slate-600 dark:text-content-dark-secondary">
            Nenhum conteúdo encontrado neste filtro.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-border-dark dark:bg-surface-dark-card">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-border-dark">
            <thead className="bg-slate-50 dark:bg-surface-dark-secondary">
              <tr>
                <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                  Título
                </th>
                <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                  Tipo
                </th>
                <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                  Estado
                </th>
                <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                  Actualizado
                </th>
                <th className="px-4 py-3 font-display font-semibold text-slate-700 dark:text-content-dark-primary">
                  Acções
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-border-dark">
              {filteredContents.map((content) => {
                const isBusy = busyId === content.id;

                return (
                  <tr key={content.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-content-dark-primary">
                        {content.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-content-dark-tertiary">
                        {content.category?.name ?? "Sem categoria"} ·{" "}
                        {content.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-content-dark-secondary">
                      {TYPE_LABELS[content.type as ContentType]}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          statusBadgeClass(content.status),
                        )}
                      >
                        {STATUS_LABELS[content.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-content-dark-secondary">
                      {formatDate(content.updated_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/conteudos/${content.id}/editar`}>
                          <Button
                            type="button"
                            variant="ghost"
                            className="min-h-9 px-3 py-1.5"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                            Editar
                          </Button>
                        </Link>

                        {content.status !== "published" ? (
                          <Button
                            type="button"
                            variant="secondary"
                            className="min-h-9 px-3 py-1.5"
                            isLoading={isBusy}
                            onClick={() =>
                              void updateStatus(content, "published")
                            }
                          >
                            <Eye className="h-4 w-4" strokeWidth={1.5} />
                            Publicar
                          </Button>
                        ) : null}

                        {content.status !== "archived" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="min-h-9 px-3 py-1.5"
                            isLoading={isBusy}
                            onClick={() =>
                              void updateStatus(content, "archived")
                            }
                          >
                            <Archive className="h-4 w-4" strokeWidth={1.5} />
                            Arquivar
                          </Button>
                        ) : null}

                        <Button
                          type="button"
                          variant="destructive"
                          className="min-h-9 px-3 py-1.5"
                          isLoading={isBusy}
                          onClick={() => void deleteContent(content)}
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
