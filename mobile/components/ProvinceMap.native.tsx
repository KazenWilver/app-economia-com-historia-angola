import { useMemo, useState } from "react";
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Polygon as SvgPolygon,
  RadialGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";
import { useThemeColors } from "@/contexts/ThemeContext";
import type { LatLng, ProvinceMapProps } from "./ProvinceMap.types";

const MAP_HEIGHT = 300;
const PADDING = 14;

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

function ringCentroid(ring: LatLng[]): LatLng | null {
  if (ring.length === 0) {
    return null;
  }

  let lat = 0;
  let lng = 0;
  for (const point of ring) {
    lat += point.latitude;
    lng += point.longitude;
  }

  return {
    latitude: lat / ring.length,
    longitude: lng / ring.length,
  };
}

/**
 * Mapa choropleth só com Angola: nomes, capitais e visual refinado.
 */
export function ProvinceMap({
  markers,
  polygons = [],
  onMarkerPress,
  onReset,
}: ProvinceMapProps) {
  const colors = useThemeColors();
  const [width, setWidth] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

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

  const labelEntries = useMemo(() => {
    return polygons
      .map((province) => {
        const outer = province.rings[0];
        const center = outer ? ringCentroid(outer) : null;
        if (!center) {
          return null;
        }
        return { id: province.id, name: province.name, center };
      })
      .filter(
        (item): item is { id: number; name: string; center: LatLng } =>
          item !== null,
      );
  }, [polygons]);

  if (markers.length === 0 && polygons.length === 0) {
    return null;
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const handlePress = (provinceId: number) => {
    setSelectedId(provinceId);
    onMarkerPress(provinceId);
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
          <Defs>
            <RadialGradient id="angolaGlow" cx="50%" cy="20%" r="70%">
              <Stop offset="0%" stopColor={colors.bordeaux} stopOpacity={0.16} />
              <Stop offset="55%" stopColor={colors.petrol} stopOpacity={0.08} />
              <Stop offset="100%" stopColor={colors.surfaceSecondary} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <SvgPolygon
            points={`0,0 ${width},0 ${width},${MAP_HEIGHT} 0,${MAP_HEIGHT}`}
            fill="url(#angolaGlow)"
          />

          {polygons.map((province) =>
            province.rings.map((ring, index) => {
              const points = ring
                .map((point) => {
                  const { x, y } = project(point, bounds, width, MAP_HEIGHT);
                  return `${x},${y}`;
                })
                .join(" ");
              const isSelected = selectedId === province.id;

              return (
                <SvgPolygon
                  key={`${province.id}-${index}`}
                  points={points}
                  fill={isSelected ? `${colors.bordeaux}B3` : `${colors.petrol}80`}
                  stroke={isSelected ? colors.gold : colors.bordeaux}
                  strokeWidth={isSelected ? 2.4 : 1.4}
                  onPress={() => handlePress(province.id)}
                />
              );
            }),
          )}

          {labelEntries.map((entry) => {
            const { x, y } = project(entry.center, bounds, width, MAP_HEIGHT);
            const isSelected = selectedId === entry.id;
            const shortName =
              entry.name.length > 12
                ? `${entry.name.slice(0, 11)}…`
                : entry.name;

            return (
              <SvgText
                key={`label-${entry.id}`}
                x={x}
                y={y}
                fill={isSelected ? colors.white : colors.contentPrimary}
                fontSize={9}
                fontWeight="700"
                textAnchor="middle"
                alignmentBaseline="middle"
                onPress={() => handlePress(entry.id)}
              >
                {shortName}
              </SvgText>
            );
          })}

          {labelEntries.map((entry) => {
            const marker = markers.find((item) => item.id === entry.id);
            if (!marker?.capital) {
              return null;
            }
            const { x, y } = project(entry.center, bounds, width, MAP_HEIGHT);
            return (
              <Circle
                key={`capital-${entry.id}`}
                cx={x}
                cy={y + 8}
                r={2.5}
                fill={colors.gold}
                stroke={colors.bordeaux}
                strokeWidth={0.8}
              />
            );
          })}

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
                    onPress={() => handlePress(province.id)}
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
        onPress={() => {
          setSelectedId(null);
          onReset?.();
        }}
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
