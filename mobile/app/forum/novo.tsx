import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { ForumsResponse, TopicMutationResponse } from "@shared/types";
import { Card, Field, PrimaryButton, Screen } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function NovoTopicoScreen() {
  const { token, isAuthenticated } = useAuth();
  const [forumId, setForumId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [theme, setTheme] = useState("");
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
        <Text style={styles.error}>Inicia sessão para criar um tópico.</Text>
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
          is_private: false,
          is_visible: true,
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
      <Text style={styles.title}>Novo tópico</Text>
      <Card>
        <Field
          label="Título"
          variant="light"
          value={title}
          onChangeText={setTitle}
        />
        <Field
          label="Descrição"
          variant="light"
          value={description}
          onChangeText={setDescription}
          multiline
          style={styles.multiline}
        />
        <Field
          label="Tema (opcional)"
          variant="light"
          value={theme}
          onChangeText={setTheme}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
    color: colors.contentPrimary,
    marginBottom: 16,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  actions: { marginTop: 4 },
  error: {
    marginBottom: 12,
    color: colors.error,
    fontSize: 14,
  },
});
