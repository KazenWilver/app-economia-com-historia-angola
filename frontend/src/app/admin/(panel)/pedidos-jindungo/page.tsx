"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ShieldAlert, ShieldOff, X } from "lucide-react";
import type {
  AdminJindungoAccessRequestsResponse,
  JindungoAccessMutationResponse,
  JindungoAccessRequestItem,
  JindungoAccessStatus,
} from "@shared/types";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { adminFetch } from "@/lib/admin-api";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | JindungoAccessStatus;

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "pending", label: "Pendentes" },
  { value: "approved", label: "Aprovados" },
  { value: "rejected", label: "Rejeitados" },
];

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
  none: "Sem pedido",
};

function formatDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadgeClass(status: string): string {
  if (status === "approved") {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300";
  }
  if (status === "rejected") {
    return "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
  }
  return "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200";
}

export default function AdminJindungoAccessPage() {
  const { token } = useAdminAuth();
  const [requests, setRequests] = useState<JindungoAccessRequestItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadRequests = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) {
        return;
      }

      if (!options?.silent) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const query =
          statusFilter === "all"
            ? ""
            : `?status=${encodeURIComponent(statusFilter)}`;
        const data = await adminFetch<AdminJindungoAccessRequestsResponse>(
          `/admin/jindungo-access-requests${query}`,
          { token },
        );
        setRequests(data.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os pedidos.",
        );
        setRequests([]);
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [statusFilter, token],
  );

  // Recarrega ao mudar o filtro (useLiveRefresh não reage a mudanças do callback).
  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  useLiveRefresh(loadRequests, {
    enabled: Boolean(token),
    runOnMount: false,
  });

  const pendingCount = useMemo(
    () => requests.filter((item) => item.status === "pending").length,
    [requests],
  );

  const review = async (
    item: JindungoAccessRequestItem,
    status: "approved" | "rejected",
  ) => {
    if (!token) {
      return;
    }

    setBusyId(item.id);
    setErrorMessage(null);

    try {
      const data = await adminFetch<JindungoAccessMutationResponse>(
        `/admin/jindungo-access-requests/${item.id}`,
        {
          method: "PATCH",
          token,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      setSuccessMessage(data.message);
      await loadRequests({ silent: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível actualizar o pedido.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-display text-sm font-semibold uppercase tracking-wider text-bordeaux dark:text-bordeaux-dark">
          Moderação
        </p>
        <h1 className="font-display text-3xl font-bold tracking-display text-content-primary dark:text-content-dark-primary">
          Pedidos Jindungo
        </h1>
        <p className="max-w-2xl text-sm text-content-secondary dark:text-content-dark-secondary">
          Aprova, rejeita ou revoga o acesso à biblioteca exclusiva Jindungo.
          {statusFilter === "pending" && pendingCount > 0
            ? ` Tens ${pendingCount} pendente(s) neste filtro.`
            : null}
        </p>
      </header>

      {errorMessage ? (
        <Toast
          variant="error"
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      ) : null}
      {successMessage ? (
        <Toast
          variant="success"
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      ) : null}

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            type="button"
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "rounded-full border px-4 py-2 font-display text-sm font-semibold transition-colors",
              statusFilter === filter.value
                ? "border-bordeaux bg-bordeaux text-white dark:border-bordeaux-dark dark:bg-bordeaux-dark"
                : "border-border bg-surface-card text-content-secondary hover:border-bordeaux hover:text-bordeaux dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-secondary",
            )}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card hoverLift={false}>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <ShieldAlert
              className="h-8 w-8 text-content-tertiary dark:text-content-dark-tertiary"
              strokeWidth={1.5}
            />
            <p className="font-display text-lg font-semibold text-content-primary dark:text-content-dark-primary">
              Sem pedidos neste filtro
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((item) => (
            <Card key={item.id} hoverLift={false} className="p-0">
              <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-base font-bold text-content-primary dark:text-content-dark-primary">
                      {item.user?.name ?? `Utilizador #${item.id}`}
                    </p>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        statusBadgeClass(item.status),
                      )}
                    >
                      {STATUS_LABEL[item.status] ?? item.status}
                    </span>
                  </div>
                  <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
                    {item.user?.email ?? "—"}
                  </p>
                  {item.message ? (
                    <p className="rounded-xl bg-surface-secondary px-3 py-2 text-sm text-content-primary dark:bg-surface-dark-secondary dark:text-content-dark-primary">
                      {item.message}
                    </p>
                  ) : null}
                  <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
                    Pedido em {formatDate(item.created_at)}
                    {item.reviewed_at
                      ? ` · Decisão em ${formatDate(item.reviewed_at)}`
                      : null}
                    {item.reviewer ? ` · por ${item.reviewer.name}` : null}
                  </p>
                  {item.admin_note ? (
                    <p className="text-xs text-content-secondary dark:text-content-dark-secondary">
                      Nota: {item.admin_note}
                    </p>
                  ) : null}
                </div>

                {item.status === "pending" ? (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      isLoading={busyId === item.id}
                      onClick={() => void review(item, "approved")}
                    >
                      <Check className="h-4 w-4" strokeWidth={1.5} />
                      Aprovar
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={busyId === item.id}
                      onClick={() => void review(item, "rejected")}
                    >
                      <X className="h-4 w-4" strokeWidth={1.5} />
                      Rejeitar
                    </Button>
                  </div>
                ) : null}

                {item.status === "approved" ? (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      isLoading={busyId === item.id}
                      onClick={() => void review(item, "rejected")}
                    >
                      <ShieldOff className="h-4 w-4" strokeWidth={1.5} />
                      Revogar acesso
                    </Button>
                  </div>
                ) : null}

                {item.status === "rejected" ? (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      isLoading={busyId === item.id}
                      onClick={() => void review(item, "approved")}
                    >
                      <Check className="h-4 w-4" strokeWidth={1.5} />
                      Restaurar acesso
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
