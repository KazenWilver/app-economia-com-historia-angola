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
import { ThemeToggle } from "@/components/ThemeToggle";
import { Field, PrimaryButton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";

export default function RegisterScreen() {
  const { register, isAuthenticated, isLoading } = useAuth();
  const colors = useThemeColors();
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
          Criar conta
        </Text>
        <Text style={[styles.subtitle, { color: colors.contentSecondary }]}>
          Junta-te à comunidade e explora conteúdos, quizzes e o mapa.
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

          <Text
            style={[styles.provinceLabel, { color: colors.contentSecondary }]}
          >
            Província
          </Text>
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
                    {
                      borderColor: active ? colors.bordeaux : colors.border,
                      backgroundColor: active
                        ? colors.bordeauxMuted
                        : colors.surface,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.provinceChipText,
                      {
                        color: active
                          ? colors.bordeaux
                          : colors.contentSecondary,
                      },
                    ]}
                  >
                    {province.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          ) : null}

          <PrimaryButton
            label="Registar"
            onPress={() => void handleSubmit()}
            isLoading={submitting}
          />

          <Link
            href="/(auth)/login"
            style={[styles.link, { color: colors.bordeaux }]}
          >
            Já tens conta? Entrar
          </Link>

          <Text style={[styles.legal, { color: colors.contentSecondary }]}>
            Ao registar-te, aceitas os{" "}
            <Text
              style={[styles.legalLink, { color: colors.bordeaux }]}
              onPress={() => router.push("/termos" as never)}
            >
              Termos
            </Text>{" "}
            e a{" "}
            <Text
              style={[styles.legalLink, { color: colors.bordeaux }]}
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
  provinceLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  provinceRow: {
    gap: 8,
    paddingBottom: 12,
  },
  provinceChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  provinceChipText: {
    fontSize: 13,
    fontWeight: "600",
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
  legal: {
    marginTop: 16,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  legalLink: {
    fontWeight: "700",
  },
});
