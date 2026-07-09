export interface MapProvinceSummary {
  id: number;
  name: string;
  code: string;
  capital: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  narratives_count?: number;
}

export interface MapNarrative {
  id: number;
  province_id: number;
  title: string;
  narrative_text: string;
  period: string | null;
  display_order: number;
}

export interface MapProvinceDetail extends MapProvinceSummary {
  narratives: MapNarrative[];
}

export interface MapProvinceDetailResponse {
  data: MapProvinceDetail;
}

export interface MapGeoJsonFeatureProperties {
  id: number;
  name: string;
  code: string;
  capital: string | null;
  narratives_count: number;
}

export interface MapGeoJsonFeature {
  type: "Feature";
  properties: MapGeoJsonFeatureProperties;
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
}

export interface MapGeoJsonResponse {
  type: "FeatureCollection";
  features: MapGeoJsonFeature[];
}

export function formatMapPeriod(period: string | null): string | null {
  if (!period) {
    return null;
  }

  return period.charAt(0).toUpperCase() + period.slice(1);
}
