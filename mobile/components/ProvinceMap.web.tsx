import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";
import type { ProvinceMapProps } from "./ProvinceMap.types";

/** react-native-maps não funciona no Expo Web — só lista de províncias. */
export function ProvinceMap(_props: ProvinceMapProps) {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        O mapa interactivo está disponível no Expo Go (Android/iOS). No browser
        usa a lista de províncias abaixo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginBottom: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.contentSecondary,
  },
});
