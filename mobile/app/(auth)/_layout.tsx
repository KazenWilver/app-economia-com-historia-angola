import { Stack } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surface },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="registar" />
      <Stack.Screen name="recuperar-palavra-passe" />
      <Stack.Screen name="redefinir-palavra-passe" />
    </Stack>
  );
}
