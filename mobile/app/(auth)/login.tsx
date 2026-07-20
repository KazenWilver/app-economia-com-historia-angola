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
import { ThemeToggle } from "@/components/ThemeToggle";
import { Field, PrimaryButton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";

export default function LoginScreen() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && isAuthenticated) {
    return <Redirect href="/(tabs)/explorar" />;
  }

  const handleSubmit = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError("Preenche o email e a palavra-passe.");
      return;
    }

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
      style={[styles.flex, { backgroundColor: colors.surface }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topRow}>
          <Text style={[styles.brand, { color: colors.bordeaux }]}>
            Economia com História – Angola
          </Text>
          <ThemeToggle size={40} />
        </View>
        <Text style={[styles.title, { color: colors.contentPrimary }]}>
          Entrar
        </Text>
        <Text style={[styles.subtitle, { color: colors.contentSecondary }]}>
          Continua a explorar a economia e a história de Angola.
        </Text>

        <View
          style={[
            styles.form,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.border,
            },
          ]}
        >
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

          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          ) : null}

          <PrimaryButton
            label="Entrar"
            onPress={() => void handleSubmit()}
            isLoading={submitting}
          />

          <Link
            href={"/(auth)/recuperar-palavra-passe" as never}
            style={[styles.link, { color: colors.bordeaux }]}
          >
            Esqueceste a palavra-passe?
          </Link>

          <Link
            href="/(auth)/registar"
            style={[styles.link, { color: colors.bordeaux }]}
          >
            Ainda não tens conta? Registar
          </Link>

          <Link
            href="/(tabs)/explorar"
            style={[styles.guestLink, { color: colors.contentSecondary }]}
          >
            Continuar sem conta
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  brand: {
    fontSize: 18,
    fontWeight: "800",
    flexShrink: 1,
    maxWidth: "78%",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
  },
  error: {
    marginBottom: 12,
    fontSize: 13,
  },
  link: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "700",
  },
  guestLink: {
    marginTop: 12,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 13,
  },
});
