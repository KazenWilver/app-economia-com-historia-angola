import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import type { MapProvinceSummary } from "@shared/types";
import {
  ProvinceMap,
  type LatLng,
  type ProvinceMapMarker,
  type ProvincePolygon,
} from "@/components/ProvinceMap";
import { Card, EmptyState, Screen, Title } from "@/components/ui";
import { useThemeColors } from "@/contexts/ThemeContext";
import { useLiveRefresh } from "@/hooks/useLiveRefresh";
import { apiFetch } from "@/lib/api";

interface ProvincesMapResponse {
  data: MapProvinceSummary[];
}

interface GeoJsonFeature {
  type: "Feature";
  properties: {
    id: number;
    name: string;
    code?: string;
    capital?: string | null;
    narratives_count?: number;
  };
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

interface GeoJsonResponse {
  type: "FeatureCollection";
  features: GeoJsonFeature[];
}

function toCoord(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function ringToLatLng(ring: unknown): LatLng[] {
  if (!Array.isArray(ring)) {
    return [];
  }

  return ring
    .map((point) => {
      if (!Array.isArray(point) || point.length < 2) {
        return null;
      }
      const longitude = Number(point[0]);
      const latitude = Number(point[1]);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }
      return { latitude, longitude };
    })
    .filter((item): item is LatLng => item !== null);
}

function geometryToRings(geometry: GeoJsonFeature["geometry"]): LatLng[][] {
  if (geometry.type === "Polygon") {
    const coords = geometry.coordinates as unknown[];
    const outer = ringToLatLng(coords[0]);
    return outer.length >= 3 ? [outer] : [];
  }

  if (geometry.type === "MultiPolygon") {
    const polygons = geometry.coordinates as unknown[];
    return polygons
      .map((polygon) => {
        if (!Array.isArray(polygon)) {
          return null;
        }
        const outer = ringToLatLng(polygon[0]);
        return outer.length >= 3 ? outer : null;
      })
      .filter((item): item is LatLng[] => item !== null);
  }

  return [];
}

export default function MapaScreen() {
  const colors = useThemeColors();
  const [items, setItems] = useState<MapProvinceSummary[]>([]);
  const [polygons, setPolygons] = useState<ProvincePolygon[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const [listData, geoData] = await Promise.all([
        apiFetch<ProvincesMapResponse>("/provinces"),
        apiFetch<GeoJsonResponse>("/provinces/geojson"),
      ]);

      setItems(listData.data);
      setPolygons(
        geoData.features
          .map((feature) => {
            const rings = geometryToRings(feature.geometry);
            if (rings.length === 0) {
              return null;
            }
            return {
              id: feature.properties.id,
              name: feature.properties.name,
              rings,
            };
          })
          .filter((item): item is ProvincePolygon => item !== null),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as províncias.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useLiveRefresh(load);

  const markers = useMemo(
    () =>
      items
        .map((province) => {
          const latitude = toCoord(province.latitude);
          const longitude = toCoord(province.longitude);
          if (latitude === null || longitude === null) {
            return null;
          }
          return { ...province, latitude, longitude };
        })
        .filter((item): item is ProvinceMapMarker => item !== null),
    [items],
  );

  return (
    <Screen>
      <Title
        title="Mapa"
        subtitle="Explora as províncias e as suas narrativas económicas."
      />

      {loading ? (
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 24 }} />
      ) : error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : (
        <>
          <ProvinceMap
            markers={markers}
            polygons={polygons}
            onMarkerPress={(provinceId) =>
              router.push(`/provincia/${provinceId}` as never)
            }
          />

          <FlatList
            style={{ flex: 1 }}
            data={items}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => void load(true)}
                tintColor={colors.bordeaux}
              />
            }
            ListEmptyComponent={
              <EmptyState message="Ainda não há províncias disponíveis." />
            }
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <Card
                onPress={() =>
                  router.push(`/provincia/${item.id}` as never)
                }
              >
                <Text
                  style={[styles.cardTitle, { color: colors.contentPrimary }]}
                >
                  {item.name}
                </Text>
                <Text
                  style={[styles.cardBody, { color: colors.contentSecondary }]}
                >
                  {item.capital ? `Capital: ${item.capital}` : item.code}
                  {typeof item.narratives_count === "number"
                    ? ` · ${item.narratives_count} narrativas`
                    : ""}
                </Text>
              </Card>
            )}
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 32 },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
  },
  error: {
    marginTop: 16,
    fontSize: 14,
  },
});
