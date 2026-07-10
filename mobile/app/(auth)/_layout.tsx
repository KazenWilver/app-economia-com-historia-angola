import { Stack } from "expo-router";
import { colors } from "@/lib/theme";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.surfaceDark },
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="registar" />
      <Stack.Screen name="recuperar-palavra-passe" />
      <Stack.Screen name="redefinir-palavra-passe" />
    </Stack>
  );
}
