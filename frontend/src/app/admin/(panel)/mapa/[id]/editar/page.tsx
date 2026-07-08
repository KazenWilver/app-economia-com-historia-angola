"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapNarrativeForm } from "@/components/admin/MapNarrativeForm";
import {
  emptyMapNarrativeForm,
  formValuesToMapNarrativePayload,
  narrativeToFormValues,
  type AdminMapNarrative,
  type AdminMapNarrativeResponse,
  type AdminProvince,
  type MapNarrativeFormValues,
  type MapNarrativeMutationResponse,
  type ProvincesResponse,
} from "@/components/admin/map-types";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminFetch } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from "@/components/ui";

export default function AdminEditMapNarrativePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const narrativeId = params.id;
  const { token } = useAdminAuth();

  const [provinces, setProvinces] = useState<AdminProvince[]>([]);
  const [narrative, setNarrative] = useState<AdminMapNarrative | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const initialValues = useMemo(
    () => (narrative ? narrativeToFormValues(narrative) : emptyMapNarrativeForm()),
    [narrative],
  );

  const loadData = useCallback(async () => {
    if (!token || !narrativeId) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [provincesData, narrativeData] = await Promise.all([
        adminFetch<ProvincesResponse>("/provinces", { token }),
        adminFetch<AdminMapNarrativeResponse>(
          `/admin/map-narratives/${narrativeId}`,
          { token },
        ),
      ]);
      setProvinces(provincesData.data);
      setNarrative(narrativeData.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar a narrativa.",
      );
      setNarrative(null);
    } finally {
      setIsLoading(false);
    }
  }, [narrativeId, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSubmit = async (values: MapNarrativeFormValues) => {
    if (!token || !narrativeId) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const data = await adminFetch<MapNarrativeMutationResponse>(
        `/map-narratives/${narrativeId}`,
        {
          method: "PUT",
          token,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formValuesToMapNarrativePayload(values)),
        },
      );
      setNarrative(data.narrative);
      setSuccessMessage("Narrativa actualizada com sucesso.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível actualizar a narrativa.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!narrative) {
    return (
      <Card hoverLift={false}>
        <CardContent className="py-10 text-center">
          {errorMessage ?? "Narrativa não encontrada."}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Editar narrativa</h1>
        <p className="mt-2 text-slate-600 dark:text-content-dark-secondary">
          {narrative.title}
        </p>
      </header>

      {successMessage ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </p>
      ) : null}

      <Card hoverLift={false}>
        <CardHeader>
          <CardTitle>Dados da narrativa</CardTitle>
        </CardHeader>
        <CardContent>
          <MapNarrativeForm
            key={`${narrative.id}-${narrative.updated_at}`}
            initialValues={initialValues}
            provinces={provinces}
            submitLabel="Guardar alterações"
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/admin/mapa")}
          />
        </CardContent>
      </Card>
    </div>
  );
}
