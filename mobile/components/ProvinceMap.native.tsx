import { useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polygon } from "react-native-maps";
import { colors } from "@/lib/theme";
import type { ProvinceMapProps } from "./ProvinceMap.types";

const ANGOLA_REGION = {
  latitude: -12.5,
  longitude: 17.5,
  latitudeDelta: 14,
  longitudeDelta: 14,
};

export function ProvinceMap({
  markers,
  polygons = [],
  onMarkerPress,
  onReset,
}: ProvinceMapProps) {
  const mapRef = useRef<MapView | null>(null);

  if (markers.length === 0 && polygons.length === 0) {
    return null;
  }

  const handleReset = () => {
    mapRef.current?.animateToRegion(ANGOLA_REGION, 400);
    onReset?.();
  };

  return (
    <View style={styles.mapWrap}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={ANGOLA_REGION}
      >
        {polygons.map((province) =>
          province.rings.map((ring, index) => (
            <Polygon
              key={`${province.id}-${index}`}
              coordinates={ring}
              strokeColor={colors.bordeaux}
              fillColor="rgba(138, 21, 56, 0.22)"
              strokeWidth={1.5}
              tappable
              onPress={() => onMarkerPress(province.id)}
            />
          )),
        )}

        {markers.map((province) => (
          <Marker
            key={province.id}
            coordinate={{
              latitude: province.latitude,
              longitude: province.longitude,
            }}
            title={province.name}
            description={
              province.capital ? `Capital: ${province.capital}` : undefined
            }
            onCalloutPress={() => onMarkerPress(province.id)}
            onPress={() => onMarkerPress(province.id)}
          />
        ))}
      </MapView>

      <Pressable style={styles.resetBtn} onPress={handleReset}>
        <Text style={styles.resetText}>Centrar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    height: 280,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    flex: 1,
  },
  resetBtn: {
    position: "absolute",
    right: 12,
    top: 12,
    backgroundColor: colors.surfaceCard,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.bordeaux,
  },
});
