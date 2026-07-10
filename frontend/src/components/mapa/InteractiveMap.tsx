"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { MapGeoJsonResponse } from "@/components/mapa/map-types";
import { API_URL } from "@/lib/api";
import "leaflet/dist/leaflet.css";

const ANGOLA_CENTER: L.LatLngExpression = [-12.5, 17.5];
const DEFAULT_ZOOM = 6;
const MAX_BOUNDS = L.latLngBounds(
  L.latLng(-19.5, 10.5),
  L.latLng(-3.5, 25.5),
);

const PETROL = "#2C7A7B";
const BORDEAUX = "#8A1538";
const GOLD = "#D4AF37";

export interface InteractiveMapHandle {
  resetView: () => void;
  locateUser: () => void;
  centerOnSelection: () => void;
}

interface InteractiveMapProps {
  selectedProvinceId: number | null;
  onProvinceSelect: (provinceId: number) => void;
  onReady?: (handle: InteractiveMapHandle) => void;
  className?: string;
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
  onReady,
  className,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const initialBoundsRef = useRef<L.LatLngBounds | null>(null);
  const onSelectRef = useRef(onProvinceSelect);
  const onReadyRef = useRef(onReady);
  const selectedProvinceIdRef = useRef(selectedProvinceId);
  const isMountedRef = useRef(true);

  onSelectRef.current = onProvinceSelect;
  onReadyRef.current = onReady;
  selectedProvinceIdRef.current = selectedProvinceId;

  const getHandle = (): InteractiveMapHandle => ({
    resetView: () => {
      const map = mapRef.current;
      const bounds = initialBoundsRef.current;
      if (!map) {
        return;
      }
      if (bounds?.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
      } else {
        map.setView(ANGOLA_CENTER, DEFAULT_ZOOM);
      }
    },
    locateUser: () => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      map.locate({ setView: false, maxZoom: 10, enableHighAccuracy: true });
    },
    centerOnSelection: () => {
      const map = mapRef.current;
      const layer = layerRef.current;
      const selectedId = selectedProvinceIdRef.current;
      if (!map || !layer || selectedId === null) {
        return;
      }

      layer.eachLayer((featureLayer) => {
        if (!isPathLayer(featureLayer) || !featureLayer.feature) {
          return;
        }
        if (featureLayer.feature.properties?.id !== selectedId) {
          return;
        }
        if (
          featureLayer instanceof L.Polygon ||
          featureLayer instanceof L.Polyline
        ) {
          const bounds = featureLayer.getBounds();
          if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [48, 48], maxZoom: 9 });
          }
        } else if (featureLayer instanceof L.CircleMarker) {
          map.setView(featureLayer.getLatLng(), 8);
        }
      });
    },
  });

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
      minZoom: 5,
      maxZoom: 12,
      maxBounds: MAX_BOUNDS,
      maxBoundsViscosity: 0.85,
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    map.on("locationfound", (event: L.LocationEvent) => {
      if (!mapRef.current || !isMountedRef.current) {
        return;
      }

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      userMarkerRef.current = L.circleMarker(event.latlng, {
        radius: 8,
        color: GOLD,
        fillColor: BORDEAUX,
        fillOpacity: 0.9,
        weight: 2,
      })
        .bindTooltip("A tua localização", { direction: "top" })
        .addTo(mapRef.current);

      const inAngola = MAX_BOUNDS.contains(event.latlng);
      mapRef.current.setView(event.latlng, inAngola ? 8 : DEFAULT_ZOOM, {
        animate: true,
      });
    });

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
            initialBoundsRef.current = bounds;
            mapRef.current.fitBounds(bounds, {
              padding: [40, 40],
              maxZoom: 7,
            });
          }
        } catch {
          // Evita crash se o mapa já foi destruído a meio do cálculo.
        }

        requestAnimationFrame(() => {
          if (mapRef.current && isMountedRef.current) {
            mapRef.current.invalidateSize();
            onReadyRef.current?.(getHandle());
          }
        });
      } catch {
        // O painel principal mostra erros de carregamento.
      }
    };

    void loadGeoJson();
    onReadyRef.current?.(getHandle());

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
      userMarkerRef.current = null;
      initialBoundsRef.current = null;

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
      className={
        className ??
        "h-full min-h-[420px] w-full rounded-2xl border border-border bg-surface-card shadow-glass dark:border-border-dark dark:bg-surface-dark-card"
      }
      aria-label="Mapa interactivo de Angola"
    />
  );
}
