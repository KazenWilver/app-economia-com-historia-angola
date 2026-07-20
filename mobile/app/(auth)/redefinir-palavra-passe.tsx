import { Link, router, useLocalSearchParams } from "expo-router";
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
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";

export default function RedefinirPalavraPasseScreen() {
  const colors = useThemeColors();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const [email, setEmail] = useState(params.email ?? "");
  const [token, setToken] = useState(params.token ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!email.trim() || !token.trim() || !password || !passwordConfirmation) {
      setError("Preenche todos os campos.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    setSubmitting(true);

    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          token: token.trim(),
          password,
          password_confirmation: passwordConfirmation,
        }),
      });

      setSuccess("Palavra-passe actualizada. Podes iniciar sessão.");
      setTimeout(() => router.replace("/(auth)/login"), 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível redefinir a palavra-passe.",
      );
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
          Nova palavra-passe
        </Text>
        <Text style={[styles.subtitle, { color: colors.contentSecondary }]}>
          Define uma nova palavra-passe para a tua conta.
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
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label="Token"
            autoCapitalize="none"
            value={token}
            onChangeText={setToken}
          />
          <Field
            label="Nova palavra-passe"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Field
            label="Confirmar palavra-passe"
            secureTextEntry
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
          />

          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          ) : null}
          {success ? (
            <Text style={[styles.success, { color: colors.success }]}>
              {success}
            </Text>
          ) : null}

          <PrimaryButton
            label="Guardar"
            onPress={() => void handleSubmit()}
            isLoading={submitting}
          />

          <Link
            href="/(auth)/login"
            style={[styles.link, { color: colors.bordeaux }]}
          >
            Voltar ao login
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
  success: {
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  link: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "700",
  },
});
