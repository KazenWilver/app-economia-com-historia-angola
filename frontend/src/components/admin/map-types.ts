import type { Province } from "@shared/types";

export interface AdminProvince extends Province {
  capital: string | null;
  narratives_count?: number;
}

export interface AdminMapNarrative {
  id: number;
  province_id: number;
  title: string;
  narrative_text: string;
  period: string | null;
  display_order: number;
  province?: AdminProvince;
  created_at: string;
  updated_at: string;
}

export interface AdminMapNarrativesResponse {
  data: AdminMapNarrative[];
}

export interface AdminMapNarrativeResponse {
  data: AdminMapNarrative;
}

export interface ProvincesResponse {
  data: AdminProvince[];
}

export interface MapNarrativeMutationResponse {
  message: string;
  narrative: AdminMapNarrative;
}

export interface MapNarrativeFormValues {
  province_id: string;
  title: string;
  narrative_text: string;
  period: string;
  display_order: string;
}

export function emptyMapNarrativeForm(): MapNarrativeFormValues {
  return {
    province_id: "",
    title: "",
    narrative_text: "",
    period: "",
    display_order: "0",
  };
}

export function narrativeToFormValues(
  narrative: AdminMapNarrative,
): MapNarrativeFormValues {
  return {
    province_id: String(narrative.province_id),
    title: narrative.title,
    narrative_text: narrative.narrative_text,
    period: narrative.period ?? "",
    display_order: String(narrative.display_order),
  };
}

export function formValuesToMapNarrativePayload(values: MapNarrativeFormValues) {
  return {
    province_id: Number(values.province_id),
    title: values.title.trim(),
    narrative_text: values.narrative_text.trim(),
    period: values.period.trim() || null,
    display_order: values.display_order.trim()
      ? Number(values.display_order)
      : 0,
  };
}
