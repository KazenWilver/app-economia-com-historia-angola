import { Link, router } from "expo-router";
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
import { parsePasswordResetLink } from "@/lib/password-reset";

interface ForgotResponse {
  message: string;
  resetLink?: string;
  dev_reset_link?: string;
  devResetLink?: string;
}

export default function RecuperarPalavraPasseScreen() {
  const colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetParams, setResetParams] = useState<{
    email: string;
    token: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const goToReset = (params: { email: string; token: string }) => {
    router.push({
      pathname: "/(auth)/redefinir-palavra-passe",
      params,
    } as never);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    setResetParams(null);

    if (!email.trim()) {
      setError("Indica o teu email.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await apiFetch<ForgotResponse>("/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          redirect: "/login",
        }),
      });

      setSuccess(
        "Pedido registado. Se o email existir na plataforma, podes recuperar a palavra-passe.",
      );

      const link =
        data.resetLink ?? data.devResetLink ?? data.dev_reset_link ?? null;
      const parsed = link
        ? parsePasswordResetLink(link, email.trim())
        : null;

      if (parsed) {
        setResetParams(parsed);
        goToReset(parsed);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível pedir a recuperação.",
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
            🌶️ Jindungo
          </Text>
          <ThemeToggle size={40} />
        </View>
        <Text style={[styles.title, { color: colors.contentPrimary }]}>
          Recuperar palavra-passe
        </Text>
        <Text style={[styles.subtitle, { color: colors.contentSecondary }]}>
          Indica o email da tua conta para receberes o link de redefinição.
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

          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          ) : null}
          {success ? (
            <Text style={[styles.success, { color: colors.success }]}>
              {success}
            </Text>
          ) : null}

          <PrimaryButton
            label="Enviar pedido"
            onPress={() => void handleSubmit()}
            isLoading={submitting}
          />

          {resetParams ? (
            <View style={styles.resetContinue}>
              <PrimaryButton
                label="Continuar para redefinir"
                onPress={() => goToReset(resetParams)}
              />
            </View>
          ) : null}

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
    fontSize: 26,
    fontWeight: "800",
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
  resetContinue: {
    marginTop: 12,
  },
  link: {
    marginTop: 16,
    textAlign: "center",
    fontWeight: "700",
  },
});
