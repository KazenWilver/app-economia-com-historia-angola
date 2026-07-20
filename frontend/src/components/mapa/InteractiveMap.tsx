"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import L from "leaflet";
import type { MapGeoJsonResponse } from "@/components/mapa/map-types";
import { API_URL } from "@/lib/api";
import "leaflet/dist/leaflet.css";

gsap.registerPlugin(useGSAP);

const ANGOLA_CENTER: L.LatLngExpression = [-12.5, 17.5];
const DEFAULT_ZOOM = 6;
const MAX_BOUNDS = L.latLngBounds(
  L.latLng(-18.2, 11.4),
  L.latLng(-4.2, 24.2),
);

const PETROL = "#2C7A7B";
const BORDEAUX = "#8A1538";
const GOLD = "#D4AF37";
const EMPTY_FILL = "#3D8B8C";

export interface InteractiveMapHandle {
  resetView: () => void;
  locateUser: () => void;
  centerOnSelection: () => void;
}

interface InteractiveMapProps {
  selectedProvinceId: number | null;
  onProvinceSelect: (provinceId: number) => void;
  onReady?: (handle: InteractiveMapHandle) => void;
  /** Vista elevada 2.5D (perspetiva) — sem tiles 3D do mundo. */
  immersive?: boolean;
  /** Atmosfera nocturna só no mapa. */
  nightMode?: boolean;
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

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function isPathLayer(
  layer: L.Layer,
): layer is L.Path & { feature?: ProvinceFeature } {
  return (
    layer instanceof L.Path ||
    layer instanceof L.Polygon ||
    layer instanceof L.CircleMarker
  );
}

function getLayerCenter(layer: L.Layer): L.LatLng | null {
  if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
    return layer.getBounds().getCenter();
  }
  if (layer instanceof L.CircleMarker) {
    return layer.getLatLng();
  }
  return null;
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
      fillOpacity: 0.95,
      className: isSelected
        ? "jindungo-province-path is-selected"
        : "jindungo-province-path",
    });
    return;
  }

  layer.setStyle({
    fillColor: isSelected ? BORDEAUX : hasNarratives ? PETROL : EMPTY_FILL,
    color: isSelected ? GOLD : BORDEAUX,
    weight: isSelected ? 2.75 : 1.35,
    fillOpacity: isSelected ? 0.78 : hasNarratives ? 0.58 : 0.36,
    opacity: 1,
    className: isSelected
      ? "jindungo-province-path is-selected"
      : "jindungo-province-path",
  });
}

function createProvinceLabel(name: string, isSelected: boolean): L.DivIcon {
  return L.divIcon({
    className: `jindungo-province-label${isSelected ? " is-selected" : ""}`,
    html: `<span class="jindungo-province-label__text">${escapeHtml(name)}</span>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createContentIcons(narrativesCount: number): L.DivIcon | null {
  if (narrativesCount <= 0) {
    return null;
  }

  const showVideo = narrativesCount >= 3;
  const bookSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>`;
  const videoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`;

  return L.divIcon({
    className: "jindungo-content-icons",
    html: `<div class="jindungo-content-icons__row">${bookSvg}${showVideo ? videoSvg : ""}<span class="jindungo-content-icons__count">${narrativesCount}</span></div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

function createHoverCardHtml(
  name: string,
  capital: string | null | undefined,
  narrativesCount: number,
): string {
  const capitalLine = capital
    ? `<p class="jindungo-hover-card__meta">Capital: ${escapeHtml(capital)}</p>`
    : "";
  const countLabel =
    narrativesCount === 1 ? "1 narrativa" : `${narrativesCount} narrativas`;
  const bookSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>`;
  const videoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`;
  const icons =
    narrativesCount > 0
      ? `<span class="jindungo-hover-card__icons">${bookSvg}${narrativesCount >= 3 ? videoSvg : ""}</span>`
      : "";

  return `<div class="jindungo-hover-card">
    <p class="jindungo-hover-card__title">${escapeHtml(name)}</p>
    ${capitalLine}
    <p class="jindungo-hover-card__count">${icons}<span>${countLabel}</span></p>
  </div>`;
}

function flyToProvince(map: L.Map, layer: L.Layer) {
  if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.flyToBounds(bounds, {
        padding: [56, 56],
        maxZoom: 8.5,
        duration: 1.05,
        easeLinearity: 0.25,
      });
    }
    return;
  }
  if (layer instanceof L.CircleMarker) {
    map.flyTo(layer.getLatLng(), 8, { duration: 0.9 });
  }
}

export function InteractiveMap({
  selectedProvinceId,
  onProvinceSelect,
  onReady,
  immersive = false,
  nightMode = false,
  className,
}: InteractiveMapProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.GeoJSON | null>(null);
  const labelsLayerRef = useRef<L.LayerGroup | null>(null);
  const capitalsLayerRef = useRef<L.LayerGroup | null>(null);
  const iconsLayerRef = useRef<L.LayerGroup | null>(null);
  const labelMarkersRef = useRef<Map<number, L.Marker>>(new Map());
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const initialBoundsRef = useRef<L.LatLngBounds | null>(null);
  const onSelectRef = useRef(onProvinceSelect);
  const onReadyRef = useRef(onReady);
  const selectedProvinceIdRef = useRef(selectedProvinceId);
  const isMountedRef = useRef(true);
  const lastFlownIdRef = useRef<number | null>(null);

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
      lastFlownIdRef.current = null;
      if (bounds?.isValid()) {
        map.flyToBounds(bounds, {
          padding: [28, 28],
          maxZoom: 7,
          duration: 0.9,
        });
      } else {
        map.flyTo(ANGOLA_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
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
        flyToProvince(map, featureLayer);
      });
    },
  });

  useGSAP(
    () => {
      if (!stageRef.current) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(stageRef.current, { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        stageRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
      );
    },
    { scope: stageRef },
  );

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
      maxZoom: 10,
      maxBounds: MAX_BOUNDS,
      maxBoundsViscosity: 1,
      scrollWheelZoom: true,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    const labelsLayer = L.layerGroup().addTo(map);
    const capitalsLayer = L.layerGroup().addTo(map);
    const iconsLayer = L.layerGroup().addTo(map);
    labelsLayerRef.current = labelsLayer;
    capitalsLayerRef.current = capitalsLayer;
    iconsLayerRef.current = iconsLayer;

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
      if (inAngola) {
        mapRef.current.flyTo(event.latlng, 8, { duration: 0.85 });
      } else {
        getHandle().resetView();
      }
    });

    mapRef.current = map;

    let isCancelled = false;

    const playEntranceAnimation = () => {
      if (!containerRef.current) {
        return;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (prefersReducedMotion) {
        return;
      }

      const paths = containerRef.current.querySelectorAll(
        ".leaflet-overlay-pane path.jindungo-province-path",
      );
      const labels = containerRef.current.querySelectorAll(
        ".jindungo-province-label",
      );
      const capitals = containerRef.current.querySelectorAll(
        ".jindungo-capital-dot",
      );
      const icons = containerRef.current.querySelectorAll(
        ".jindungo-content-icons",
      );

      gsap.fromTo(
        paths,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.55,
          stagger: 0.028,
          ease: "power2.out",
        },
      );
      gsap.fromTo(
        labels,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.02,
          delay: 0.25,
          ease: "power2.out",
        },
      );
      gsap.fromTo(
        capitals,
        { opacity: 0, scale: 0.4 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          stagger: 0.015,
          delay: 0.45,
          ease: "back.out(1.6)",
        },
      );
      gsap.fromTo(
        icons,
        { opacity: 0, y: 8 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.02,
          delay: 0.55,
          ease: "power2.out",
        },
      );
    };

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

        labelMarkersRef.current.clear();
        labelsLayer.clearLayers();
        capitalsLayer.clearLayers();
        iconsLayer.clearLayers();

        const geoJsonLayer = L.geoJSON(data, {
          style(feature) {
            const typedFeature = feature as ProvinceFeature | undefined;
            const narrativesCount =
              typedFeature?.properties?.narratives_count ?? 0;
            const provinceId = typedFeature?.properties?.id ?? null;
            const isSelected = provinceId === selectedProvinceIdRef.current;
            const hasNarratives = narrativesCount > 0;

            return {
              fillColor: isSelected
                ? BORDEAUX
                : hasNarratives
                  ? PETROL
                  : EMPTY_FILL,
              color: isSelected ? GOLD : BORDEAUX,
              weight: isSelected ? 2.75 : 1.35,
              fillOpacity: isSelected ? 0.78 : hasNarratives ? 0.58 : 0.36,
              opacity: 1,
              className: isSelected
                ? "jindungo-province-path is-selected"
                : "jindungo-province-path",
            };
          },
          pointToLayer(feature, latlng) {
            const marker = L.circleMarker(latlng, {
              radius: 8,
              fillColor: PETROL,
              color: BORDEAUX,
              weight: 2,
              fillOpacity: 0.95,
              className: "jindungo-province-path",
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
              createHoverCardHtml(name, capital, narrativesCount),
              {
                direction: "top",
                opacity: 1,
                sticky: true,
                className: "jindungo-hover-tooltip",
                offset: [0, -8],
              },
            );

            layer.on("click", () => {
              if (typeof provinceId === "number") {
                onSelectRef.current(provinceId);
              }
            });

            layer.on("mouseover", () => {
              if (!isPathLayer(layer)) {
                return;
              }
              if (typedFeature.properties?.id === selectedProvinceIdRef.current) {
                return;
              }
              layer.setStyle({
                fillOpacity: 0.78,
                weight: 2.4,
              });
              layer.bringToFront();
            });

            layer.on("mouseout", () => {
              if (!isPathLayer(layer)) {
                return;
              }
              applyFeatureStyle(
                layer,
                typedFeature,
                selectedProvinceIdRef.current,
              );
            });

            if (isPathLayer(layer)) {
              applyFeatureStyle(
                layer,
                typedFeature,
                selectedProvinceIdRef.current,
              );

              const center = getLayerCenter(layer);
              if (!center) {
                return;
              }

              const isSelected =
                provinceId === selectedProvinceIdRef.current;

              if (typeof provinceId === "number") {
                const labelMarker = L.marker(center, {
                  icon: createProvinceLabel(name, isSelected),
                  interactive: false,
                  keyboard: false,
                });
                labelMarker.addTo(labelsLayer);
                labelMarkersRef.current.set(provinceId, labelMarker);
              }

              const contentIcon = createContentIcons(narrativesCount);
              if (contentIcon) {
                L.marker(center, {
                  icon: contentIcon,
                  interactive: false,
                  keyboard: false,
                }).addTo(iconsLayer);
              }

              if (capital) {
                const capitalMarker = L.circleMarker(center, {
                  radius: 4,
                  color: "#fff",
                  fillColor: GOLD,
                  fillOpacity: 1,
                  weight: 1.5,
                  className: "jindungo-capital-dot",
                  interactive: false,
                });
                capitalMarker.bindTooltip(`Capital: ${escapeHtml(capital)}`, {
                  direction: "bottom",
                  opacity: 0.95,
                  className: "jindungo-map-tooltip",
                });
                capitalMarker.addTo(capitalsLayer);
              }
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
            mapRef.current.setMaxBounds(bounds.pad(0.08));
            mapRef.current.fitBounds(bounds, {
              padding: [28, 28],
              maxZoom: 7,
            });
          }
        } catch {
          // Evita crash se o mapa já foi destruído a meio do cálculo.
        }

        requestAnimationFrame(() => {
          if (mapRef.current && isMountedRef.current) {
            mapRef.current.invalidateSize();
            playEntranceAnimation();
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
      labelsLayerRef.current = null;
      capitalsLayerRef.current = null;
      iconsLayerRef.current = null;
      labelMarkersRef.current.clear();
      userMarkerRef.current = null;
      initialBoundsRef.current = null;
      lastFlownIdRef.current = null;

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

    if (selectedProvinceId === null) {
      lastFlownIdRef.current = null;
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

        const provinceId = feature.properties?.id;
        const name = feature.properties?.name ?? "Província";
        if (typeof provinceId === "number") {
          const labelMarker = labelMarkersRef.current.get(provinceId);
          if (labelMarker) {
            labelMarker.setIcon(
              createProvinceLabel(name, provinceId === selectedProvinceId),
            );
          }
        }

        if (
          selectedProvinceId !== null &&
          provinceId === selectedProvinceId
        ) {
          featureLayer.bringToFront();
          if (lastFlownIdRef.current !== selectedProvinceId) {
            lastFlownIdRef.current = selectedProvinceId;
            flyToProvince(map, featureLayer);
          }
        }
      });
    } catch {
      // Ignorar se o mapa já não estiver válido.
    }
  }, [selectedProvinceId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const timer = window.setTimeout(() => {
      map.invalidateSize({ animate: false });
    }, 320);

    return () => window.clearTimeout(timer);
  }, [immersive, nightMode]);

  const mapClassName = [
    "jindungo-angola-map",
    className ??
      "h-full min-h-[420px] w-full rounded-2xl border border-border bg-surface-secondary shadow-glass dark:border-border-dark dark:bg-surface-dark-secondary",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={stageRef}
      className={`jindungo-map-stage${immersive ? " is-immersive" : ""}${nightMode ? " is-night" : ""}`}
    >
      <div className="jindungo-map-stage__glow" aria-hidden />
      <div className="jindungo-map-stage__floor" aria-hidden />
      <div className="jindungo-map-tilt">
        <div
          ref={containerRef}
          className={mapClassName}
          aria-label="Mapa interactivo de Angola"
        />
      </div>
    </div>
  );
}
