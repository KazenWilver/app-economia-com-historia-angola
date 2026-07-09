"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { MapGeoJsonResponse } from "@/components/mapa/map-types";
import { API_URL } from "@/lib/api";
import "leaflet/dist/leaflet.css";

const ANGOLA_CENTER: L.LatLngExpression = [-12.5, 17.5];
const DEFAULT_ZOOM = 6;

const PETROL = "#2C7A7B";
const BORDEAUX = "#8A1538";
const GOLD = "#D4AF37";

interface InteractiveMapProps {
  selectedProvinceId: number | null;
  onProvinceSelect: (provinceId: number) => void;
}

type ProvinceFeature = GeoJSON.Feature<
  GeoJSON.Geometry,
  {
    id?: number;
    name?: string;
    capital?: string | null;
    narratives_count?: number;
  }
>;

function applyMarkerStyle(
  marker: L.CircleMarker,
  feature: ProvinceFeature,
  selectedProvinceId: number | null,
) {
  const narrativesCount = feature.properties?.narratives_count ?? 0;
  const provinceId = feature.properties?.id ?? null;
  const isSelected = provinceId === selectedProvinceId;

  marker.setStyle({
    radius: narrativesCount > 0 ? 11 : 8,
    fillColor: isSelected ? BORDEAUX : PETROL,
    color: isSelected ? GOLD : BORDEAUX,
    weight: isSelected ? 3 : 2,
    fillOpacity: 0.9,
  });
}

export function InteractiveMap({
  selectedProvinceId,
  onProvinceSelect,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const onSelectRef = useRef(onProvinceSelect);
  const selectedProvinceIdRef = useRef(selectedProvinceId);

  onSelectRef.current = onProvinceSelect;
  selectedProvinceIdRef.current = selectedProvinceId;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      center: ANGOLA_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    mapRef.current = map;

    let isCancelled = false;

    const loadGeoJson = async () => {
      try {
        const response = await fetch(`${API_URL}/provinces/geojson`);
        if (!response.ok) {
          throw new Error("Failed to load map data");
        }

        const data = (await response.json()) as MapGeoJsonResponse;
        if (isCancelled || !mapRef.current) {
          return;
        }

        const geoJsonLayer = L.geoJSON(data, {
          pointToLayer(feature, latlng) {
            const marker = L.circleMarker(latlng, {
              radius: 8,
              fillColor: PETROL,
              color: BORDEAUX,
              weight: 2,
              fillOpacity: 0.9,
            });

            applyMarkerStyle(
              marker,
              feature as ProvinceFeature,
              selectedProvinceIdRef.current,
            );

            return marker;
          },
          onEachFeature(feature, layer) {
            const typedFeature = feature as ProvinceFeature;
            const name = typedFeature.properties?.name ?? "Província";
            const capital = typedFeature.properties?.capital;
            const narrativesCount =
              typedFeature.properties?.narratives_count ?? 0;
            const provinceId = typedFeature.properties?.id;

            layer.bindTooltip(
              `<strong>${name}</strong>${capital ? `<br/>Capital: ${capital}` : ""}${narrativesCount > 0 ? `<br/>${narrativesCount} narrativa(s)` : ""}`,
              {
                direction: "top",
                opacity: 0.95,
              },
            );

            layer.on("click", () => {
              if (typeof provinceId === "number") {
                onSelectRef.current(provinceId);
              }
            });
          },
        }).addTo(mapRef.current);

        layerRef.current = geoJsonLayer;

        const bounds = geoJsonLayer.getBounds();
        if (bounds.isValid()) {
          mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 7 });
        }
      } catch {
        // O painel principal mostra erros de carregamento.
      }
    };

    void loadGeoJson();

    return () => {
      isCancelled = true;
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) {
      return;
    }

    layer.eachLayer((featureLayer) => {
      if (!(featureLayer instanceof L.CircleMarker)) {
        return;
      }

      const feature = (
        featureLayer as L.CircleMarker & { feature?: ProvinceFeature }
      ).feature;

      if (!feature) {
        return;
      }

      applyMarkerStyle(featureLayer, feature, selectedProvinceId);
    });
  }, [selectedProvinceId]);

  return (
    <div
      ref={containerRef}
      className="h-[min(70vh,640px)] w-full rounded-2xl border border-border shadow-glass dark:border-border-dark"
      aria-label="Mapa interactivo de Angola"
    />
  );
}
