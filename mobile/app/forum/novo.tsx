import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ForumsResponse, TopicMutationResponse } from "@shared/types";
import { Card, Field, PrimaryButton, Screen } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";

export default function NovoTopicoScreen() {
  const { token, isAuthenticated } = useAuth();
  const colors = useThemeColors();
  const [forumId, setForumId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    void apiFetch<ForumsResponse>("/forums", { token })
      .then((data) => {
        if (data.data[0]) {
          setForumId(data.data[0].id);
        } else {
          setError("Não há fóruns disponíveis para criar tópicos.");
        }
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar os fóruns.",
        );
      });
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return (
      <Screen>
        <Text style={[styles.error, { color: colors.error }]}>
          Inicia sessão para criar um tópico.
        </Text>
        <PrimaryButton
          label="Ir para login"
          onPress={() => router.replace("/(auth)/login")}
        />
      </Screen>
    );
  }

  const handleSubmit = async () => {
    if (!token || !forumId) {
      setError("Fórum indisponível.");
      return;
    }

    if (!title.trim()) {
      setError("O título é obrigatório.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await apiFetch<TopicMutationResponse>("/topics", {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forum_id: forumId,
          title: title.trim(),
          description: description.trim() || null,
          theme: theme.trim() || null,
          is_private: isPrivate,
          is_visible: !isPrivate,
        }),
      });

      router.replace(`/forum/${response.topic.id}` as never);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar o tópico.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.contentPrimary }]}>
        Novo tópico
      </Text>
      <Card>
        <Field
          label="Título"
          value={title}
          onChangeText={setTitle}
        />
        <Field
          label="Descrição"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.multiline}
        />
        <Field
          label="Tema (opcional)"
          value={theme}
          onChangeText={setTheme}
        />
        <Pressable
          onPress={() => setIsPrivate((value) => !value)}
          style={styles.privacyRow}
        >
          <View
            style={[
              styles.checkbox,
              {
                borderColor: colors.border,
                backgroundColor: colors.surfaceCard,
              },
              isPrivate && {
                backgroundColor: colors.bordeaux,
                borderColor: colors.bordeaux,
              },
            ]}
          />
          <View style={styles.privacyText}>
            <Text
              style={[styles.privacyTitle, { color: colors.contentPrimary }]}
            >
              Tópico privado
            </Text>
            <Text
              style={[styles.privacyHint, { color: colors.contentTertiary }]}
            >
              Só tu e administradores o conseguem ver. Não aparece na lista
              pública.
            </Text>
          </View>
        </Pressable>
        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
        <View style={styles.actions}>
          <PrimaryButton
            label="Publicar"
            onPress={() => void handleSubmit()}
            isLoading={submitting}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  privacyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    marginTop: 2,
  },
  privacyText: { flex: 1 },
  privacyTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  privacyHint: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
  },
  actions: { marginTop: 4 },
  error: {
    marginBottom: 12,
    fontSize: 14,
  },
});
