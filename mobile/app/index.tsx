import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
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

  return (
    <View style={styles.splash}>
      <Text style={styles.brand}>🌶️ Jindungo</Text>
      <Text style={styles.tagline}>Economia com História – Angola</Text>
      <Text style={styles.copy}>
        Explora conteúdos, quizzes, o fórum e o mapa interactivo das
        províncias.
      </Text>

      <Pressable
        style={styles.primaryCta}
        onPress={() => router.push("/(tabs)/explorar")}
      >
        <Text style={styles.primaryCtaText}>Explorar</Text>
      </Pressable>

      <Pressable
        style={styles.secondaryCta}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.secondaryCtaText}>Entrar</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/registar")}>
        <Text style={styles.link}>Criar conta</Text>
      </Pressable>
    </View>
  );
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
  copy: {
    marginTop: 16,
    marginBottom: 32,
    maxWidth: 320,
    fontSize: 15,
    lineHeight: 22,
    color: colors.contentDarkSecondary,
    textAlign: "center",
  },
  loader: {
    marginTop: 28,
  },
  primaryCta: {
    width: "100%",
    maxWidth: 320,
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: colors.bordeaux,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryCtaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryCta: {
    width: "100%",
    maxWidth: 320,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  secondaryCtaText: {
    color: colors.contentDarkPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    color: colors.bordeauxDark,
    fontWeight: "700",
    fontSize: 14,
  },
});
