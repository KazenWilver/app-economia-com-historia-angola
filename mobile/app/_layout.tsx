import "react-native-gesture-handler";
import "../global.css";
import * as Linking from "expo-linking";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { API_URL } from "@/lib/api";
import { parsePasswordResetLink } from "@/lib/password-reset";

SplashScreen.preventAutoHideAsync();

function handleIncomingUrl(url: string | null) {
  if (!url) {
    return;
  }

  const parsed = parsePasswordResetLink(url);
  if (!parsed?.token) {
    return;
  }

  router.push({
    pathname: "/(auth)/redefinir-palavra-passe",
    params: parsed,
  } as never);
}

function RootNavigator() {
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (__DEV__) {
      console.log("[Jindungo] API_URL =", API_URL);
    }
    void SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    void Linking.getInitialURL().then(handleIncomingUrl);
    const subscription = Linking.addEventListener("url", (event) => {
      handleIncomingUrl(event.url);
    });
    return () => subscription.remove();
  }, []);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surfaceCard },
          headerTintColor: colors.bordeaux,
          headerTitleStyle: {
            fontWeight: "700",
            color: colors.contentPrimary,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="conteudo/[slug]"
          options={{ title: "Conteúdo", headerBackTitle: "Voltar" }}
        />
        <Stack.Screen
          name="quiz/[id]"
          options={{ title: "Quiz", headerBackTitle: "Voltar" }}
        />
        <Stack.Screen
          name="provincia/[id]"
          options={{ title: "Província", headerBackTitle: "Voltar" }}
        />
        <Stack.Screen
          name="forum/[id]"
          options={{ title: "Tópico", headerBackTitle: "Voltar" }}
        />
        <Stack.Screen
          name="forum/novo"
          options={{ title: "Novo tópico", headerBackTitle: "Voltar" }}
        />
        <Stack.Screen
          name="ranking"
          options={{ title: "Ranking", headerBackTitle: "Voltar" }}
        />
        <Stack.Screen
          name="jindungo"
          options={{ title: "Jindungo", headerBackTitle: "Voltar" }}
        />
        <Stack.Screen
          name="termos"
          options={{ title: "Termos", headerBackTitle: "Voltar" }}
        />
        <Stack.Screen
          name="privacidade"
          options={{ title: "Privacidade", headerBackTitle: "Voltar" }}
        />
        <Stack.Screen name="+not-found" options={{ title: "Não encontrado" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
