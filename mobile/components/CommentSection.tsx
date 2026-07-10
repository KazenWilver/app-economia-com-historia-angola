import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CommentItem, CommentsResponse } from "@shared/types";
import { Field, PrimaryButton } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

function CommentTree({
  comments,
  depth = 0,
  onReply,
}: {
  comments: CommentItem[];
  depth?: number;
  onReply: (parentId: number) => void;
}) {
  return (
    <>
      {comments.map((comment) => (
        <View
          key={comment.id}
          style={[styles.comment, depth > 0 && { marginLeft: 14 }]}
        >
          <Text style={styles.author}>{comment.user.name}</Text>
          <Text style={styles.body}>{comment.body}</Text>
          <Pressable onPress={() => onReply(comment.id)} style={styles.replyBtn}>
            <Text style={styles.replyAction}>Responder</Text>
          </Pressable>
          {comment.replies?.length ? (
            <CommentTree
              comments={comment.replies}
              depth={depth + 1}
              onReply={onReply}
            />
          ) : null}
        </View>
      ))}
    </>
  );
}

export function CommentSection({ contentSlug }: { contentSlug: string }) {
  const { token, isAuthenticated } = useAuth();
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

  useEffect(() => {
    void load();
  }, [load]);

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

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Comentários</Text>

      {loading ? (
        <Text style={styles.hint}>A carregar…</Text>
      ) : comments.length === 0 ? (
        <Text style={styles.hint}>Ainda não há comentários.</Text>
      ) : (
        <CommentTree
          comments={comments}
          onReply={(id) => {
            setParentId(id);
            setError(null);
          }}
        />
      )}

      {isAuthenticated ? (
        <View style={styles.form}>
          {parentId ? (
            <View style={styles.replyingTo}>
              <Text style={styles.hint}>A responder ao comentário #{parentId}</Text>
              <Pressable onPress={() => setParentId(null)}>
                <Text style={styles.replyAction}>Cancelar</Text>
              </Pressable>
            </View>
          ) : null}
          <Field
            label="O teu comentário"
            variant="light"
            value={body}
            onChangeText={setBody}
            multiline
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <PrimaryButton
            label={parentId ? "Publicar resposta" : "Publicar"}
            onPress={() => void handleSubmit()}
            isLoading={submitting}
          />
        </View>
      ) : (
        <Text style={styles.hint}>Inicia sessão para comentar.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 8 },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.contentPrimary,
    marginBottom: 12,
  },
  comment: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceCard,
  },
  author: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.bordeaux,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.contentPrimary,
  },
  replyBtn: { marginTop: 8 },
  replyAction: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.petrol,
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
    color: colors.contentSecondary,
    marginBottom: 12,
  },
  error: {
    color: colors.error,
    marginBottom: 8,
    fontSize: 13,
  },
});
