"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { MapNarrativeForm } from "@/components/admin/MapNarrativeForm";
import {
  emptyMapNarrativeForm,
  formValuesToMapNarrativePayload,
  type AdminProvince,
  type MapNarrativeFormValues,
  type MapNarrativeMutationResponse,
  type ProvincesResponse,
} from "@/components/admin/map-types";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { adminFetch } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function AdminCreateMapNarrativePage() {
  const router = useRouter();
  const { token } = useAdminAuth();
  const [provinces, setProvinces] = useState<AdminProvince[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadProvinces = useCallback(async () => {
    if (!token) return;
    try {
      const data = await adminFetch<ProvincesResponse>("/provinces", { token });
      setProvinces(data.data);
    } catch {
      setErrorMessage("Não foi possível carregar as províncias.");
    }
  }, [token]);

  useEffect(() => {
    void loadProvinces();
  }, [loadProvinces]);

  const handleSubmit = async (values: MapNarrativeFormValues) => {
    if (!token) {
      setErrorMessage("Sessão de administrador inválida.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await adminFetch<MapNarrativeMutationResponse>("/map-narratives", {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formValuesToMapNarrativePayload(values)),
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a narrativa.",
      );
      setIsSubmitting(false);
      return;
    }

    router.push("/admin/mapa?created=1");
  };

  const initialValues = {
    ...emptyMapNarrativeForm(),
    province_id: provinces[0] ? String(provinces[0].id) : "",
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Nova narrativa</h1>
      </header>

      <Card hoverLift={false}>
        <CardHeader>
          <CardTitle>Dados da narrativa</CardTitle>
        </CardHeader>
        <CardContent>
          <MapNarrativeForm
            key={provinces.length}
            initialValues={initialValues}
            provinces={provinces}
            submitLabel="Criar narrativa"
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
