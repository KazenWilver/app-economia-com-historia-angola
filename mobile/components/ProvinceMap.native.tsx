import { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Polygon as SvgPolygon } from "react-native-svg";
import { useThemeColors } from "@/contexts/ThemeContext";
import type { LatLng, ProvinceMapProps } from "./ProvinceMap.types";

const MAP_HEIGHT = 280;
const PADDING = 12;

type Bounds = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

function collectBounds(points: LatLng[]): Bounds | null {
  if (points.length === 0) {
    return null;
  }

  let minLat = points[0].latitude;
  let maxLat = points[0].latitude;
  let minLng = points[0].longitude;
  let maxLng = points[0].longitude;

  for (const point of points) {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  }

  // Margem mínima para evitar divisão por zero em polígonos degenerados.
  if (maxLat - minLat < 0.01) {
    minLat -= 0.05;
    maxLat += 0.05;
  }
  if (maxLng - minLng < 0.01) {
    minLng -= 0.05;
    maxLng += 0.05;
  }

  return { minLat, maxLat, minLng, maxLng };
}

function project(
  point: LatLng,
  bounds: Bounds,
  width: number,
  height: number,
): { x: number; y: number } {
  const usableW = Math.max(width - PADDING * 2, 1);
  const usableH = Math.max(height - PADDING * 2, 1);
  const latSpan = bounds.maxLat - bounds.minLat;
  const lngSpan = bounds.maxLng - bounds.minLng;
  const scale = Math.min(usableW / lngSpan, usableH / latSpan);
  const offsetX = (usableW - lngSpan * scale) / 2;
  const offsetY = (usableH - latSpan * scale) / 2;

  return {
    x: PADDING + offsetX + (point.longitude - bounds.minLng) * scale,
    y: PADDING + offsetY + (bounds.maxLat - point.latitude) * scale,
  };
}

/**
 * Mapa choropleth só com Angola (sem basemap mundial).
 * Cumpre o pedido do professor: não mostrar áreas fora do território.
 */
export function ProvinceMap({
  markers,
  polygons = [],
  onMarkerPress,
  onReset,
}: ProvinceMapProps) {
  const colors = useThemeColors();
  const [width, setWidth] = useState(0);

  const allPoints = useMemo(() => {
    const points: LatLng[] = [];
    for (const province of polygons) {
      for (const ring of province.rings) {
        points.push(...ring);
      }
    }
    if (points.length === 0) {
      for (const marker of markers) {
        points.push({
          latitude: marker.latitude,
          longitude: marker.longitude,
        });
      }
    }
    return points;
  }, [markers, polygons]);

  const bounds = useMemo(() => collectBounds(allPoints), [allPoints]);

  if (markers.length === 0 && polygons.length === 0) {
    return null;
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <View
      style={[
        styles.mapWrap,
        {
          borderColor: colors.border,
          backgroundColor: colors.surfaceSecondary,
        },
      ]}
      onLayout={handleLayout}
    >
      {width > 0 && bounds ? (
        <Svg width={width} height={MAP_HEIGHT}>
          {polygons.map((province) =>
            province.rings.map((ring, index) => {
              const points = ring
                .map((point) => {
                  const { x, y } = project(point, bounds, width, MAP_HEIGHT);
                  return `${x},${y}`;
                })
                .join(" ");

              return (
                <SvgPolygon
                  key={`${province.id}-${index}`}
                  points={points}
                  fill={`${colors.petrol}6B`}
                  stroke={colors.bordeaux}
                  strokeWidth={1.5}
                  onPress={() => onMarkerPress(province.id)}
                />
              );
            }),
          )}

          {polygons.length === 0
            ? markers.map((province) => {
                const { x, y } = project(
                  {
                    latitude: province.latitude,
                    longitude: province.longitude,
                  },
                  bounds,
                  width,
                  MAP_HEIGHT,
                );
                return (
                  <Circle
                    key={province.id}
                    cx={x}
                    cy={y}
                    r={7}
                    fill={colors.petrol}
                    stroke={colors.bordeaux}
                    strokeWidth={2}
                    onPress={() => onMarkerPress(province.id)}
                  />
                );
              })
            : null}
        </Svg>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Pressable
        style={[
          styles.resetBtn,
          {
            backgroundColor: colors.surfaceCard,
            borderColor: colors.border,
          },
        ]}
        onPress={handleReset}
        accessibilityLabel="Repor vista do mapa de Angola"
      >
        <Text style={[styles.resetText, { color: colors.bordeaux }]}>
          Centrar
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    height: MAP_HEIGHT,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
  },
  placeholder: {
    flex: 1,
  },
  resetBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
