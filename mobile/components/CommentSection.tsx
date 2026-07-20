import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CommentItem, CommentsResponse } from "@shared/types";
import { Field, PrimaryButton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";
import { subscribeDataChanged } from "@/lib/data-refresh";
import { formatPtDate } from "@/lib/format";

function CommentTree({
  comments,
  depth = 0,
  currentUserId,
  onReply,
  onDelete,
}: {
  comments: CommentItem[];
  depth?: number;
  currentUserId?: number;
  onReply: (parentId: number) => void;
  onDelete: (commentId: number) => void;
}) {
  const colors = useThemeColors();

  return (
    <>
      {comments.map((comment) => (
        <View
          key={comment.id}
          style={[
            styles.comment,
            {
              borderColor: colors.border,
              backgroundColor: colors.surfaceSecondary,
            },
            depth > 0 && { marginLeft: 12 },
          ]}
        >
          <Text style={[styles.author, { color: colors.bordeaux }]}>
            {comment.user.name}
          </Text>
          {formatPtDate(comment.created_at) ? (
            <Text style={[styles.date, { color: colors.contentTertiary }]}>
              {formatPtDate(comment.created_at)}
            </Text>
          ) : null}
          <Text style={[styles.body, { color: colors.contentPrimary }]}>
            {comment.body}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={() => onReply(comment.id)}>
              <Text style={[styles.replyAction, { color: colors.petrol }]}>
                Responder
              </Text>
            </Pressable>
            {currentUserId === comment.user.id ? (
              <Pressable onPress={() => onDelete(comment.id)}>
                <Text style={[styles.replyAction, { color: colors.error }]}>
                  Eliminar
                </Text>
              </Pressable>
            ) : null}
          </View>
          {comment.replies?.length ? (
            <CommentTree
              comments={comment.replies}
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

export function CommentSection({ contentSlug }: { contentSlug: string }) {
  const { user, token, isAuthenticated } = useAuth();
  const colors = useThemeColors();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [body, setBody] = useState("");
  const [parentId, setParentId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<CommentsResponse>(
        `/contents/${contentSlug}/comments`,
        { token },
      );
      setComments(data.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar comentários.",
      );
    } finally {
      setLoading(false);
    }
  }, [contentSlug, token]);

  useFocusEffect(
    useCallback(() => {
      void load();
      return subscribeDataChanged(() => {
        void load();
      });
    }, [load]),
  );

  const handleSubmit = async () => {
    if (!token || !body.trim()) {
      setError("Escreve um comentário antes de publicar.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiFetch(`/contents/${contentSlug}/comments`, {
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
          : "Não foi possível publicar o comentário.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!token) {
      return;
    }

    try {
      await apiFetch(`/contents/${contentSlug}/comments/${commentId}`, {
        method: "DELETE",
        token,
      });
      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível eliminar o comentário.",
      );
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: colors.contentPrimary }]}>
        Comentários
      </Text>

      {loading ? (
        <Text style={[styles.hint, { color: colors.contentSecondary }]}>
          A carregar…
        </Text>
      ) : comments.length === 0 ? (
        <Text style={[styles.hint, { color: colors.contentSecondary }]}>
          Ainda não há comentários.
        </Text>
      ) : (
        <CommentTree
          comments={comments}
          currentUserId={user?.id}
          onReply={(id) => {
            setParentId(id);
            setError(null);
          }}
          onDelete={(id) => void handleDelete(id)}
        />
      )}

      {isAuthenticated ? (
        <View style={styles.form}>
          {parentId ? (
            <View style={styles.replyingTo}>
              <Text style={[styles.hint, { color: colors.contentSecondary }]}>
                A responder ao comentário #{parentId}
              </Text>
              <Pressable onPress={() => setParentId(null)}>
                <Text style={[styles.replyAction, { color: colors.petrol }]}>
                  Cancelar
                </Text>
              </Pressable>
            </View>
          ) : null}
          <Field
            label="O teu comentário"
            value={body}
            onChangeText={setBody}
            multiline
            style={styles.input}
          />
          {error ? (
            <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
          ) : null}
          <PrimaryButton
            label={parentId ? "Publicar resposta" : "Publicar"}
            onPress={() => void handleSubmit()}
            isLoading={submitting}
          />
        </View>
      ) : (
        <Text style={[styles.hint, { color: colors.contentSecondary }]}>
          Inicia sessão para comentar.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4 },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  comment: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  author: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  date: {
    fontSize: 11,
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  replyAction: {
    fontSize: 13,
    fontWeight: "700",
  },
  replyingTo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  form: { marginTop: 8 },
  input: {
    minHeight: 88,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  hint: {
    fontSize: 14,
    marginBottom: 12,
  },
  error: {
    marginBottom: 8,
    fontSize: 13,
  },
});
