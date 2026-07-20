import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";

export default function IndexScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const colors = useThemeColors();

  if (isLoading) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.surface }]}>
        <Text style={[styles.brand, { color: colors.bordeaux }]}>
          Economia com História – Angola
        </Text>
        <Text style={[styles.tagline, { color: colors.contentSecondary }]}>
          Plataforma educativa
        </Text>
        <ActivityIndicator color={colors.bordeaux} style={styles.loader} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/explorar" />;
  }

  return (
    <View style={[styles.splash, { backgroundColor: colors.surface }]}>
      <View style={styles.topRow}>
        <View />
        <ThemeToggle size={40} />
      </View>
      <Text style={[styles.brand, { color: colors.bordeaux }]}>
        Economia com História – Angola
      </Text>
      <Text style={[styles.tagline, { color: colors.contentSecondary }]}>
        Plataforma educativa
      </Text>
      <Text style={[styles.copy, { color: colors.contentSecondary }]}>
        Explora conteúdos, quizzes, o fórum e o mapa interactivo das
        províncias.
      </Text>

      <Pressable
        style={[styles.primaryCta, { backgroundColor: colors.bordeaux }]}
        onPress={() => router.push("/(tabs)/explorar")}
      >
        <Text style={[styles.primaryCtaText, { color: colors.white }]}>
          Explorar
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.secondaryCta,
          { borderColor: colors.border, backgroundColor: colors.surfaceCard },
        ]}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text
          style={[styles.secondaryCtaText, { color: colors.contentPrimary }]}
        >
          Entrar
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/registar")}>
        <Text style={[styles.link, { color: colors.bordeaux }]}>
          Criar conta
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  topRow: {
    position: "absolute",
    top: 56,
    right: 20,
    left: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  brand: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  tagline: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
  },
  copy: {
    marginTop: 16,
    marginBottom: 32,
    maxWidth: 320,
    fontSize: 15,
    lineHeight: 22,
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  primaryCtaText: {
    fontSize: 16,
    fontWeight: "700",
  },
  secondaryCta: {
    width: "100%",
    maxWidth: 320,
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  secondaryCtaText: {
    fontSize: 16,
    fontWeight: "700",
  },
  link: {
    fontWeight: "700",
    fontSize: 14,
  },
});
