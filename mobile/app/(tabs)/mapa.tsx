import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import type { MapProvinceSummary } from "@shared/types";
import { ProvinceMap, type ProvinceMapMarker } from "@/components/ProvinceMap";
import { Card, EmptyState, Screen, Title } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

interface ProvincesMapResponse {
  data: MapProvinceSummary[];
}

function toCoord(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function MapaScreen() {
  const [items, setItems] = useState<MapProvinceSummary[]>([]);
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
      const data = await apiFetch<ProvincesMapResponse>("/provinces");
      setItems(data.data);
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

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

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
        <Text style={styles.error}>{error}</Text>
      ) : (
        <>
          <ProvinceMap
            markers={markers}
            onMarkerPress={(provinceId) =>
              router.push(`/provincia/${provinceId}` as never)
            }
          />

          <FlatList
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
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={styles.cardBody}>
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
    color: colors.contentPrimary,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
    color: colors.contentSecondary,
  },
  error: {
    marginTop: 16,
    color: colors.error,
    fontSize: 14,
  },
});
