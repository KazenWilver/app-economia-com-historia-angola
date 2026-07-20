"use client";

import { useCallback, useMemo, useState } from "react";
import { Shield, UserCheck, UserX } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  ROLE_LABELS,
  type AdminUser,
  type AdminUsersResponse,
  type AdminUserStatusResponse,
} from "@/components/admin/user-types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
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

function statusBadgeClass(isActive: boolean): string {
  return isActive
    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
    : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300";
}

export default function AdminUsersPage() {
  const { token, user: currentAdmin } = useAdminAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<AdminUser | null>(
    null,
  );

  const loadUsers = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) {
        return;
      }

      if (!options?.silent) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const data = await adminFetch<AdminUsersResponse>("/admin/users", {
          token,
        });
        setUsers(data.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os utilizadores.",
        );
        setUsers([]);
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [token],
  );

  useLiveRefresh(loadUsers, { enabled: Boolean(token) });

  const filteredUsers = useMemo(() => {
    if (statusFilter === "active") {
      return users.filter((user) => user.is_active);
    }

    if (statusFilter === "inactive") {
      return users.filter((user) => !user.is_active);
    }

    return users;
  }, [statusFilter, users]);

  const updateUserStatus = async (
    user: AdminUser,
    isActive: boolean,
  ): Promise<boolean> => {
    if (!token) {
      return false;
    }

    setBusyId(user.id);
    setErrorMessage(null);

    try {
      const data = await adminFetch<AdminUserStatusResponse>(
        `/admin/users/${user.id}`,
        {
          method: "PUT",
          token,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_active: isActive }),
        },
      );
      setSuccessMessage(data.message);
      await loadUsers();
      return true;
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível actualizar o utilizador.",
      );
      return false;
    } finally {
      setBusyId(null);
    }
  };

  const confirmDeactivateUser = async () => {
    if (!userToDeactivate) {
      return;
    }

    const success = await updateUserStatus(userToDeactivate, false);

    if (success) {
      setUserToDeactivate(null);
    }
  };

  const canChangeStatus = (user: AdminUser): boolean => {
    if (user.role === "admin") {
      return false;
    }

    if (currentAdmin?.id === user.id) {
      return false;
    }

    return true;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-content-primary dark:text-content-dark-primary">
          Utilizadores
        </h1>
        <p className="mt-2 text-content-secondary dark:text-content-dark-secondary">
          Consultar contas registadas e activar ou desactivar acesso à
          plataforma.
        </p>
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
                : "border-border bg-surface-card text-content-secondary hover:border-bordeaux hover:text-bordeaux dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-secondary",
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
      ) : filteredUsers.length === 0 ? (
        <Card hoverLift={false}>
          <CardContent className="py-10 text-center text-content-secondary dark:text-content-dark-secondary">
            Nenhum utilizador encontrado neste filtro.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface-card dark:border-border-dark dark:bg-surface-dark-card">
          <table className="min-w-full divide-y divide-border text-left text-sm dark:divide-border-dark">
            <thead className="bg-surface-secondary dark:bg-surface-dark-secondary">
              <tr>
                <th className="px-4 py-3 font-display font-semibold text-content-secondary dark:text-content-dark-primary">
                  Nome
                </th>
                <th className="px-4 py-3 font-display font-semibold text-content-secondary dark:text-content-dark-primary">
                  Perfil
                </th>
                <th className="px-4 py-3 font-display font-semibold text-content-secondary dark:text-content-dark-primary">
                  Estado
                </th>
                <th className="px-4 py-3 font-display font-semibold text-content-secondary dark:text-content-dark-primary">
                  Registado
                </th>
                <th className="px-4 py-3 font-display font-semibold text-content-secondary dark:text-content-dark-primary">
                  Acções
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {filteredUsers.map((user) => {
                const isBusy = busyId === user.id;
                const canToggle = canChangeStatus(user);

                return (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-content-primary dark:text-content-dark-primary">
                        {user.name}
                      </p>
                      <p className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
                        {user.email}
                        {user.phone ? ` · ${user.phone}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                          user.role === "admin"
                            ? "bg-bordeaux/10 text-bordeaux dark:bg-bordeaux-dark/20 dark:text-bordeaux-dark"
                            : "bg-surface-secondary text-content-secondary dark:bg-surface-dark-secondary dark:text-content-dark-secondary",
                        )}
                      >
                        {user.role === "admin" ? (
                          <Shield className="h-3.5 w-3.5" strokeWidth={1.5} />
                        ) : null}
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          statusBadgeClass(user.is_active),
                        )}
                      >
                        {user.is_active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-content-secondary dark:text-content-dark-secondary">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      {canToggle ? (
                        <div className="flex flex-wrap gap-2">
                          {user.is_active ? (
                            <Button
                              type="button"
                              variant="destructive"
                              className="min-h-9 px-3 py-1.5"
                              isLoading={isBusy}
                              onClick={() => setUserToDeactivate(user)}
                            >
                              <UserX className="h-4 w-4" strokeWidth={1.5} />
                              Desactivar
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              variant="secondary"
                              className="min-h-9 px-3 py-1.5"
                              isLoading={isBusy}
                              onClick={() => void updateUserStatus(user, true)}
                            >
                              <UserCheck className="h-4 w-4" strokeWidth={1.5} />
                              Activar
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-content-tertiary dark:text-content-dark-tertiary">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={userToDeactivate !== null}
        onClose={() => setUserToDeactivate(null)}
        title="Desactivar conta"
      >
        <Card hoverLift={false} className="border-border dark:border-border-dark">
          <CardContent className="space-y-6 py-6">
            <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
              Deseja desactivar essa conta?
            </p>

            {userToDeactivate ? (
              <p className="text-sm font-semibold text-content-primary dark:text-content-dark-primary">
                {userToDeactivate.name}
                <span className="mt-1 block text-xs font-normal text-content-tertiary dark:text-content-dark-tertiary">
                  {userToDeactivate.email}
                </span>
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                className="min-h-11"
                onClick={() => setUserToDeactivate(null)}
              >
                Não
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="min-h-11"
                isLoading={busyId === userToDeactivate?.id}
                onClick={() => void confirmDeactivateUser()}
              >
                Sim
              </Button>
            </div>
          </CardContent>
        </Card>
      </Modal>
    </div>
  );
}
