import { Link, Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ProvincesResponse } from "@shared/types";
import { useAuth } from "@/contexts/AuthContext";
import { Field, PrimaryButton } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function RegisterScreen() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [provinces, setProvinces] = useState<ProvincesResponse["data"]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void apiFetch<ProvincesResponse>("/provinces")
      .then((data) => {
        setProvinces(data.data);
        if (data.data[0]) {
          setProvinceId(String(data.data[0].id));
        }
      })
      .catch(() => {
        setError("Não foi possível carregar as províncias.");
      });
  }, []);

  if (!isLoading && isAuthenticated) {
    return <Redirect href="/(tabs)/explorar" />;
  }

  const handleSubmit = async () => {
    setError(null);

    if (!provinceId) {
      setError("Selecciona uma província (usa o ID numérico).");
      return;
    }

    setSubmitting(true);

    try {
      await register(
        name.trim(),
        email.trim(),
        password,
        passwordConfirmation,
        Number(provinceId),
      );
      router.replace("/(tabs)/explorar");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível concluir o registo.",
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
        <Text style={styles.title}>Criar conta</Text>
        <Text style={styles.subtitle}>
          Junta-te à comunidade e explora conteúdos, quizzes e o mapa.
        </Text>

        <View style={styles.form}>
          <Field label="Nome" value={name} onChangeText={setName} />
          <Field
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Field
            label="Palavra-passe"
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
          <Field
            label={`Província (ID)${provinces[0] ? ` — ex.: ${provinces[0].id} = ${provinces[0].name}` : ""}`}
            keyboardType="number-pad"
            value={provinceId}
            onChangeText={setProvinceId}
            placeholder="1"
          />

          {provinces.length > 0 ? (
            <Text style={styles.hint}>
              IDs:{" "}
              {provinces
                .slice(0, 6)
                .map((p) => `${p.id}=${p.name}`)
                .join(" · ")}
              {provinces.length > 6 ? " …" : ""}
            </Text>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label="Registar"
            onPress={() => void handleSubmit()}
            isLoading={submitting}
          />

          <Link href="/(auth)/login" style={styles.link}>
            Já tens conta? Entrar
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
  hint: {
    marginBottom: 12,
    fontSize: 12,
    color: colors.contentDarkSecondary,
    lineHeight: 18,
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
