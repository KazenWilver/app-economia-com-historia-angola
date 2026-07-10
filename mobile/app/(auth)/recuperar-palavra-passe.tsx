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
import { Field, PrimaryButton } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { parsePasswordResetLink } from "@/lib/password-reset";
import { colors } from "@/lib/theme";

interface ForgotResponse {
  message: string;
  resetLink?: string;
  dev_reset_link?: string;
  devResetLink?: string;
}

export default function RecuperarPalavraPasseScreen() {
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
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>🌶️ Jindungo</Text>
        <Text style={styles.title}>Recuperar palavra-passe</Text>
        <Text style={styles.subtitle}>
          Indica o email da tua conta para receberes o link de redefinição.
        </Text>

        <View style={styles.form}>
          <Field
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

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

          <Link href="/(auth)/login" style={styles.link}>
            Voltar ao login
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
  success: {
    color: colors.success,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  resetContinue: {
    marginTop: 12,
  },
  link: {
    marginTop: 18,
    textAlign: "center",
    color: colors.bordeauxDark,
    fontWeight: "700",
  },
});
