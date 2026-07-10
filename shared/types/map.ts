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

export interface AdminProvince {
  id: number;
  name: string;
  code: string;
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

export interface AdminProvincesResponse {
  data: AdminProvince[];
}

export interface MapNarrativeMutationResponse {
  message: string;
  narrative: AdminMapNarrative;
}
