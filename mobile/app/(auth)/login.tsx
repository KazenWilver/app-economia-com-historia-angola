import { Link, Redirect, router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { Field, PrimaryButton } from "@/components/ui";
import { colors } from "@/lib/theme";

export default function LoginScreen() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Redirect href="/(tabs)/explorar" />;
  }

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/explorar");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>🌶️ Jindungo</Text>
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>
          Continua a explorar a economia e a história de Angola.
        </Text>

        <View style={styles.form}>
          <Field
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholder="utilizador@jindungo.ao"
          />
          <Field
            label="Palavra-passe"
            secureTextEntry
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label="Entrar"
            onPress={() => void handleSubmit()}
            isLoading={submitting}
          />

          <Link href="/(auth)/registar" style={styles.link}>
            Ainda não tens conta? Registar
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surfaceDark },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  brand: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.bordeauxDark,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.contentDarkPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    fontSize: 15,
    lineHeight: 22,
    color: colors.contentDarkSecondary,
  },
  form: {
    backgroundColor: colors.surfaceDarkCard,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
  error: {
    color: colors.error,
    marginBottom: 12,
    fontSize: 13,
  },
  link: {
    marginTop: 18,
    textAlign: "center",
    color: colors.bordeauxDark,
    fontWeight: "700",
  },
});
