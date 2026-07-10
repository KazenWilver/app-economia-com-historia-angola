import type { MapProvinceSummary } from "@shared/types";

export type ProvinceMapMarker = MapProvinceSummary & {
  latitude: number;
  longitude: number;
};

export interface ProvinceMapProps {
  markers: ProvinceMapMarker[];
  onMarkerPress: (provinceId: number) => void;
}
