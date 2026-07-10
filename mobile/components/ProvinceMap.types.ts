import type { MapProvinceSummary } from "@shared/types";

export type ProvinceMapMarker = MapProvinceSummary & {
  latitude: number;
  longitude: number;
};

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type ProvincePolygon = {
  id: number;
  name: string;
  rings: LatLng[][];
};

export interface ProvinceMapProps {
  markers: ProvinceMapMarker[];
  polygons?: ProvincePolygon[];
  onMarkerPress: (provinceId: number) => void;
  onReset?: () => void;
}
