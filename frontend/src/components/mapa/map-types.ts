export type {
  MapGeoJsonFeature,
  MapGeoJsonFeatureProperties,
  MapGeoJsonResponse,
  MapNarrative,
  MapProvinceDetail,
  MapProvinceDetailResponse,
  MapProvinceSummary,
} from "@shared/types";

export function formatMapPeriod(period: string | null): string | null {
  if (!period) {
    return null;
  }

  return period.charAt(0).toUpperCase() + period.slice(1);
}
