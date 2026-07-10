import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  ForumReply,
  PublicTopicResponse,
  RepliesResponse,
} from "@shared/types";
import { Card, Field, PrimaryButton, Screen } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

function ReplyTree({
  replies,
  depth = 0,
  currentUserId,
  onReply,
  onDelete,
}: {
  replies: ForumReply[];
  depth?: number;
  currentUserId?: number;
  onReply: (parentId: number) => void;
  onDelete: (replyId: number) => void;
}) {
  return (
    <>
      {replies.map((reply) => (
        <View
          key={reply.id}
          style={[styles.replyWrap, depth > 0 && { marginLeft: 12 }]}
        >
          <Card>
            <Text style={styles.replyAuthor}>{reply.user.name}</Text>
            <Text style={styles.replyBody}>{reply.body}</Text>
            <View style={styles.replyActions}>
              <Pressable onPress={() => onReply(reply.id)}>
                <Text style={styles.replyAction}>Responder</Text>
              </Pressable>
              {currentUserId === reply.user.id ? (
                <Pressable onPress={() => onDelete(reply.id)}>
                  <Text style={[styles.replyAction, styles.deleteAction]}>
                    Eliminar
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </Card>
          {reply.replies?.length ? (
            <ReplyTree
              replies={reply.replies}
              depth={depth + 1}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
            />
          ) : null}
        </View>
      ))}
    </>
  );
}

export default function ForumTopicScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token, isAuthenticated } = useAuth();
  const [topic, setTopic] = useState<PublicTopicResponse["data"] | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [body, setBody] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [topicData, repliesData] = await Promise.all([
        apiFetch<PublicTopicResponse>(`/topics/${id}`, { token }),
        apiFetch<RepliesResponse>(`/topics/${id}/replies`, { token }),
      ]);
      setTopic(topicData.data);
      setReplies(repliesData.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o tópico.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleReply = async () => {
    if (!token || !id || !body.trim()) {
      setError("Escreve uma resposta antes de enviar.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiFetch(`/topics/${id}/replies`, {
        method: "POST",
        token,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body: body.trim(),
          ...(parentId ? { parent_id: parentId } : {}),
        }),
      });
      setBody("");
      setParentId(null);
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível publicar a resposta.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (replyId: number) => {
    if (!token || !id) {
      return;
    }

    try {
      await apiFetch(`/topics/${id}/replies/${replyId}`, {
        method: "DELETE",
        token,
      });
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível eliminar a resposta.",
      );
    }
  };

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (error && !topic) {
    return (
      <Screen>
        <Text style={styles.error}>{error}</Text>
      </Screen>
    );
  }

  if (!topic) {
    return (
      <Screen>
        <Text style={styles.error}>Tópico não encontrado.</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>{topic.title}</Text>
      <Text style={styles.meta}>
        {topic.author?.name ?? "Autor"}
        {topic.theme ? ` · ${topic.theme}` : ""}
        {topic.is_private ? " · Privado" : ""}
      </Text>
      {topic.description ? (
        <Card>
          <Text style={styles.description}>{topic.description}</Text>
        </Card>
      ) : null}

      <Text style={styles.section}>Respostas</Text>
      {replies.length === 0 ? (
        <Text style={styles.empty}>Ainda não há respostas.</Text>
      ) : (
        <ReplyTree
          replies={replies}
          currentUserId={user?.id}
          onReply={(replyId) => {
            setParentId(replyId);
            setError(null);
          }}
          onDelete={(replyId) => void handleDelete(replyId)}
        />
      )}

      {isAuthenticated ? (
        <Card>
          {parentId ? (
            <View style={styles.replyingTo}>
              <Text style={styles.replyingToText}>
                A responder à mensagem #{parentId}
              </Text>
              <Pressable onPress={() => setParentId(null)}>
                <Text style={styles.replyAction}>Cancelar</Text>
              </Pressable>
            </View>
          ) : null}
          <Field
            label="A tua resposta"
            variant="light"
            value={body}
            onChangeText={setBody}
            multiline
            style={styles.replyInput}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            label={parentId ? "Publicar resposta aninhada" : "Publicar resposta"}
            onPress={() => void handleReply()}
            isLoading={submitting}
          />
        </Card>
      ) : (
        <Text style={styles.empty}>Inicia sessão para responder.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.contentPrimary,
    marginBottom: 8,
  },
  meta: {
    fontSize: 13,
    color: colors.contentTertiary,
    marginBottom: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.contentSecondary,
  },
  section: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "800",
    color: colors.contentPrimary,
  },
  empty: {
    marginBottom: 16,
    fontSize: 14,
    color: colors.contentSecondary,
  },
  replyWrap: { marginBottom: 4 },
  replyAuthor: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.bordeaux,
    marginBottom: 6,
  },
  replyBody: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.contentPrimary,
  },
  replyActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
  },
  replyAction: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.petrol,
  },
  deleteAction: {
    color: colors.error,
  },
  replyingTo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 13,
    color: colors.contentSecondary,
    fontWeight: "600",
  },
  replyInput: {
    minHeight: 96,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  error: {
    marginBottom: 12,
    color: colors.error,
    fontSize: 14,
  },
});
