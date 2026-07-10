import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/lib/theme";

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <Text style={styles.brand}>🌶️ Jindungo</Text>
        <Text style={styles.tagline}>Economia com História – Angola</Text>
        <ActivityIndicator color={colors.bordeauxDark} style={styles.loader} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/explorar" />;
  }

  return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.surfaceDark,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  brand: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.bordeauxDark,
    letterSpacing: -0.5,
  },
  tagline: {
    marginTop: 12,
    fontSize: 16,
    color: colors.contentDarkSecondary,
    textAlign: "center",
  },
  loader: {
    marginTop: 28,
  },
});
