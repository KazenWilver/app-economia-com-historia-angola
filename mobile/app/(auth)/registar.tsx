import { Link, Redirect, router } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
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

    if (!name.trim() || !email.trim() || !password || !passwordConfirmation) {
      setError("Preenche todos os campos obrigatórios.");
      return;
    }

    if (password !== passwordConfirmation) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    if (!provinceId) {
      setError("Selecciona uma província.");
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
        err instanceof Error
          ? err.message
          : "Não foi possível concluir o registo.",
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

          <Text style={styles.provinceLabel}>Província</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.provinceRow}
          >
            {provinces.map((province) => {
              const active = provinceId === String(province.id);
              return (
                <Pressable
                  key={province.id}
                  onPress={() => setProvinceId(String(province.id))}
                  style={[
                    styles.provinceChip,
                    active && styles.provinceChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.provinceChipText,
                      active && styles.provinceChipTextActive,
                    ]}
                  >
                    {province.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <PrimaryButton
            label="Registar"
            onPress={() => void handleSubmit()}
            isLoading={submitting}
          />

          <Link href="/(auth)/login" style={styles.link}>
            Já tens conta? Entrar
          </Link>

          <Text style={styles.legal}>
            Ao registar-te, aceitas os{" "}
            <Text
              style={styles.legalLink}
              onPress={() => router.push("/termos" as never)}
            >
              Termos
            </Text>{" "}
            e a{" "}
            <Text
              style={styles.legalLink}
              onPress={() => router.push("/privacidade" as never)}
            >
              Privacidade
            </Text>
            .
          </Text>
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
  provinceLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.contentDarkSecondary,
    marginBottom: 8,
  },
  provinceRow: {
    gap: 8,
    paddingBottom: 12,
  },
  provinceChip: {
    borderWidth: 1,
    borderColor: colors.borderDark,
    backgroundColor: colors.surfaceDark,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  provinceChipActive: {
    borderColor: colors.bordeauxDark,
    backgroundColor: "rgba(225, 29, 72, 0.15)",
  },
  provinceChipText: {
    fontSize: 13,
    color: colors.contentDarkSecondary,
    fontWeight: "600",
  },
  provinceChipTextActive: {
    color: colors.bordeauxDark,
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
  legal: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    color: colors.contentDarkSecondary,
    textAlign: "center",
  },
  legalLink: {
    color: colors.bordeauxDark,
    fontWeight: "700",
  },
});
