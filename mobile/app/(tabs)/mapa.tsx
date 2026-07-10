import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import type { MapProvinceSummary } from "@shared/types";
import { Card, EmptyState, Screen, Title } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

interface ProvincesMapResponse {
  data: MapProvinceSummary[];
}

const ANGOLA_REGION = {
  latitude: -12.5,
  longitude: 17.5,
  latitudeDelta: 14,
  longitudeDelta: 14,
};

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
        .filter((item): item is MapProvinceSummary & {
          latitude: number;
          longitude: number;
        } => item !== null),
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
          {Platform.OS !== "web" && markers.length > 0 ? (
            <View style={styles.mapWrap}>
              <MapView style={styles.map} initialRegion={ANGOLA_REGION}>
                {markers.map((province) => (
                  <Marker
                    key={province.id}
                    coordinate={{
                      latitude: province.latitude,
                      longitude: province.longitude,
                    }}
                    title={province.name}
                    description={
                      province.capital
                        ? `Capital: ${province.capital}`
                        : undefined
                    }
                    onCalloutPress={() =>
                      router.push(`/provincia/${province.id}` as never)
                    }
                  />
                ))}
              </MapView>
            </View>
          ) : null}

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
  mapWrap: {
    height: 220,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
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
