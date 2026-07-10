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

function isPathLayer(
  layer: L.Layer,
): layer is L.Path & { feature?: ProvinceFeature } {
  return (
    layer instanceof L.Path ||
    layer instanceof L.Polygon ||
    layer instanceof L.CircleMarker
  );
}

function applyFeatureStyle(
  layer: L.Path,
  feature: ProvinceFeature,
  selectedProvinceId: number | null,
) {
  const narrativesCount = feature.properties?.narratives_count ?? 0;
  const provinceId = feature.properties?.id ?? null;
  const isSelected = provinceId === selectedProvinceId;
  const hasNarratives = narrativesCount > 0;

  if (layer instanceof L.CircleMarker) {
    layer.setStyle({
      radius: hasNarratives ? 11 : 8,
      fillColor: isSelected ? BORDEAUX : PETROL,
      color: isSelected ? GOLD : BORDEAUX,
      weight: isSelected ? 3 : 2,
      fillOpacity: 0.9,
    });
    return;
  }

  layer.setStyle({
    fillColor: isSelected ? BORDEAUX : PETROL,
    color: isSelected ? GOLD : BORDEAUX,
    weight: isSelected ? 2.5 : 1.25,
    fillOpacity: isSelected ? 0.55 : hasNarratives ? 0.42 : 0.28,
    opacity: 1,
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
  const isMountedRef = useRef(true);

  onSelectRef.current = onProvinceSelect;
  selectedProvinceIdRef.current = selectedProvinceId;

  useEffect(() => {
    isMountedRef.current = true;
    const container = containerRef.current;

    if (!container || mapRef.current) {
      return;
    }

    if ("_leaflet_id" in container) {
      delete (container as HTMLDivElement & { _leaflet_id?: number })._leaflet_id;
    }

    const map = L.map(container, {
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
        if (isCancelled || !isMountedRef.current || !mapRef.current) {
          return;
        }

        const geoJsonLayer = L.geoJSON(data, {
          style(feature) {
            const typedFeature = feature as ProvinceFeature | undefined;
            const narrativesCount =
              typedFeature?.properties?.narratives_count ?? 0;
            const provinceId = typedFeature?.properties?.id ?? null;
            const isSelected = provinceId === selectedProvinceIdRef.current;
            const hasNarratives = narrativesCount > 0;

            return {
              fillColor: isSelected ? BORDEAUX : PETROL,
              color: isSelected ? GOLD : BORDEAUX,
              weight: isSelected ? 2.5 : 1.25,
              fillOpacity: isSelected ? 0.55 : hasNarratives ? 0.42 : 0.28,
              opacity: 1,
            };
          },
          pointToLayer(feature, latlng) {
            const marker = L.circleMarker(latlng, {
              radius: 8,
              fillColor: PETROL,
              color: BORDEAUX,
              weight: 2,
              fillOpacity: 0.9,
            });

            applyFeatureStyle(
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

            if (isPathLayer(layer)) {
              applyFeatureStyle(
                layer,
                typedFeature,
                selectedProvinceIdRef.current,
              );
            }
          },
        });

        if (isCancelled || !mapRef.current) {
          return;
        }

        geoJsonLayer.addTo(mapRef.current);
        layerRef.current = geoJsonLayer;

        try {
          const bounds = geoJsonLayer.getBounds();
          if (bounds.isValid() && mapRef.current) {
            mapRef.current.fitBounds(bounds, {
              padding: [36, 36],
              maxZoom: 7,
            });
          }
        } catch {
          // Evita crash se o mapa já foi destruído a meio do cálculo.
        }

        requestAnimationFrame(() => {
          if (mapRef.current && isMountedRef.current) {
            mapRef.current.invalidateSize();
          }
        });
      } catch {
        // O painel principal mostra erros de carregamento.
      }
    };

    void loadGeoJson();

    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
      window.removeEventListener("resize", handleResize);

      layerRef.current = null;

      const activeMap = mapRef.current;
      mapRef.current = null;

      if (activeMap) {
        activeMap.off();
        activeMap.remove();
      }

      if (container && "_leaflet_id" in container) {
        delete (container as HTMLDivElement & { _leaflet_id?: number })
          ._leaflet_id;
      }
    };
  }, []);

  useEffect(() => {
    const layer = layerRef.current;
    const map = mapRef.current;

    if (!layer || !map) {
      return;
    }

    try {
      layer.eachLayer((featureLayer) => {
        if (!isPathLayer(featureLayer)) {
          return;
        }

        const feature = featureLayer.feature;
        if (!feature) {
          return;
        }

        applyFeatureStyle(featureLayer, feature, selectedProvinceId);
      });
    } catch {
      // Ignorar se o mapa já não estiver válido.
    }
  }, [selectedProvinceId]);

  return (
    <div
      ref={containerRef}
      className="h-[min(70vh,640px)] w-full rounded-2xl border border-border bg-surface-card shadow-glass dark:border-border-dark dark:bg-surface-dark-card"
      aria-label="Mapa interactivo de Angola"
    />
  );
}
