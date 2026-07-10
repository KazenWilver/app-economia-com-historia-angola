import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { colors } from "@/lib/theme";
import type { ProvinceMapProps } from "./ProvinceMap.types";

const ANGOLA_REGION = {
  latitude: -12.5,
  longitude: 17.5,
  latitudeDelta: 14,
  longitudeDelta: 14,
};

export function ProvinceMap({ markers, onMarkerPress }: ProvinceMapProps) {
  if (markers.length === 0) {
    return null;
  }

  return (
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
              province.capital ? `Capital: ${province.capital}` : undefined
            }
            onCalloutPress={() => onMarkerPress(province.id)}
          />
        ))}
      </MapView>
    </View>
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
});
