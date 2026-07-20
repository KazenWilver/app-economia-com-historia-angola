"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  type AdminMapNarrative,
  type AdminMapNarrativesResponse,
} from "@/components/admin/map-types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Toast } from "@/components/ui/Toast";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { adminFetch } from "@/lib/admin-api";

export default function AdminMapaPage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [narratives, setNarratives] = useState<AdminMapNarrative[]>([]);
  const [provinceFilter, setProvinceFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const loadNarratives = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!token) return;

      if (!options?.silent) {
        setIsLoading(true);
      }
      setErrorMessage(null);

      try {
        const data = await adminFetch<AdminMapNarrativesResponse>(
          "/admin/map-narratives",
          { token },
        );
        setNarratives(data.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as narrativas.",
        );
        setNarratives([]);
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [token],
  );

  useLiveRefresh(loadNarratives, { enabled: Boolean(token) });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("created") === "1") {
      setSuccessMessage("Narrativa criada com sucesso.");
      void loadNarratives({ silent: true });
      router.replace("/admin/mapa");
    }
  }, [loadNarratives, router]);

  const provinces = useMemo(() => {
    const map = new Map<number, string>();
    narratives.forEach((item) => {
      if (item.province) {
        map.set(item.province.id, item.province.name);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [narratives]);

  const filteredNarratives = useMemo(() => {
    if (provinceFilter === "all") return narratives;
    return narratives.filter(
      (item) => String(item.province_id) === provinceFilter,
    );
  }, [narratives, provinceFilter]);

  const handleDelete = async (narrative: AdminMapNarrative) => {
    if (!token) return;
    if (!window.confirm(`Eliminar "${narrative.title}"?`)) return;

    setBusyId(narrative.id);
    try {
      await adminFetch(`/map-narratives/${narrative.id}`, {
        method: "DELETE",
        token,
      });
      setNarratives((current) =>
        current.filter((item) => item.id !== narrative.id),
      );
      setSuccessMessage("Narrativa eliminada com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível eliminar.",
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
            Mapa
          </h1>
          <p className="mt-2 text-content-secondary dark:text-content-dark-secondary">
            Gere narrativas histórico-económicas por província. O período
            histórico contextualiza cada narrativa; a ordem de exibição define a
            sequência no mapa público.
          </p>
        </div>
        <Link href="/admin/mapa/novo">
          <Button type="button">
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Nova narrativa
          </Button>
        </Link>
      </header>

      {successMessage ? (
        <Toast variant="success" message={successMessage} onClose={() => setSuccessMessage(null)} />
      ) : null}
      {errorMessage ? (
        <Toast variant="error" message={errorMessage} onClose={() => setErrorMessage(null)} />
      ) : null}

      {provinces.length > 0 ? (
        <select
          value={provinceFilter}
          onChange={(event) => setProvinceFilter(event.target.value)}
          className="rounded-lg border border-border bg-surface-card px-3 py-2 text-sm dark:border-border-dark dark:bg-surface-dark-secondary"
        >
          <option value="all">Todas as províncias</option>
          {provinces.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </select>
      ) : null}

      <Card hoverLift={false}>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : filteredNarratives.length === 0 ? (
            <p className="p-8 text-center text-content-secondary dark:text-content-dark-secondary">
              Nenhuma narrativa encontrada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-secondary dark:border-border-dark dark:bg-surface-dark-secondary">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Título</th>
                    <th className="px-4 py-3 font-semibold">Província</th>
                    <th
                      className="px-4 py-3 font-semibold"
                      title="Etiqueta temporal ou temática visível no mapa público"
                    >
                      Período histórico
                    </th>
                    <th
                      className="px-4 py-3 font-semibold"
                      title="Posição na lista quando a província tem várias narrativas (menor = primeiro)"
                    >
                      Ordem
                    </th>
                    <th className="px-4 py-3 font-semibold">Acções</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNarratives.map((narrative) => (
                    <tr key={narrative.id} className="border-b border-border dark:border-border-dark">
                      <td className="px-4 py-3 font-medium">{narrative.title}</td>
                      <td className="px-4 py-3">{narrative.province?.name ?? "—"}</td>
                      <td className="px-4 py-3">{narrative.period ?? "—"}</td>
                      <td className="px-4 py-3">{narrative.display_order}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/mapa/${narrative.id}/editar`}
                            className="inline-flex items-center gap-1 text-bordeaux dark:text-bordeaux-dark"
                          >
                            <Pencil className="h-4 w-4" strokeWidth={1.5} />
                            Editar
                          </Link>
                          <button
                            type="button"
                            disabled={busyId === narrative.id}
                            onClick={() => void handleDelete(narrative)}
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
    </div>
  );
}
