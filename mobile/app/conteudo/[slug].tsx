import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { ContentDetailResponse } from "@shared/types";
import { CommentSection } from "@/components/CommentSection";
import { ContentMediaPlayer } from "@/components/ContentMediaPlayer";
import { ContentStatistics } from "@/components/ContentStatistics";
import { Card, Screen } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";
import { TYPE_LABELS } from "@/lib/theme";

export default function ConteudoDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { token } = useAuth();
  const colors = useThemeColors();
  const [content, setContent] = useState<ContentDetailResponse["data"] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!slug) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<ContentDetailResponse>(`/contents/${slug}`, {
        token,
      });
      setContent(data.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar o conteúdo.",
      );
    } finally {
      setLoading(false);
    }
  }, [slug, token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator color={colors.bordeaux} style={{ marginTop: 40 }} />
      </Screen>
    );
  }

  if (error || !content) {
    return (
      <Screen>
        <Text style={[styles.error, { color: colors.error }]}>
          {error ?? "Conteúdo não encontrado."}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.contentPrimary }]}>
        {content.title}
      </Text>

      <View style={styles.meta}>
        <Text
          style={[
            styles.badge,
            {
              color: colors.bordeaux,
              backgroundColor: colors.bordeauxMuted,
            },
          ]}
        >
          {TYPE_LABELS[content.type] ?? content.type}
        </Text>
        {content.category?.name ? (
          <Text style={[styles.type, { color: colors.contentTertiary }]}>
            {content.category.name}
          </Text>
        ) : null}
        {content.is_exclusive ? (
          <Text style={[styles.exclusive, { color: colors.gold }]}>
            Exclusivo
          </Text>
        ) : null}
      </View>

      {content.author?.name ? (
        <Text style={[styles.author, { color: colors.contentSecondary }]}>
          Por {content.author.name}
        </Text>
      ) : null}

      {content.media_url ? (
        <Card>
          <ContentMediaPlayer
            mediaUrl={content.media_url}
            contentType={content.type}
          />
        </Card>
      ) : (
        (content.type === "audio" || content.type === "podcast") && (
          <Card>
            <Text style={[styles.author, { color: colors.error }]}>
              Este conteúdo de áudio não tem ficheiro associado.
            </Text>
          </Card>
        )
      )}

      {content.body ? (
        <Card>
          <Text style={[styles.body, { color: colors.contentPrimary }]}>
            {content.body}
          </Text>
        </Card>
      ) : null}

      {content.statistics_data ? (
        <Card>
          <Text style={[styles.mediaLabel, { color: colors.contentTertiary }]}>
            Dados estatísticos
          </Text>
          <ContentStatistics data={content.statistics_data} />
        </Card>
      ) : null}

      <Card>
        <CommentSection contentSlug={content.slug} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginBottom: 12,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  badge: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: "hidden",
  },
  type: {
    fontSize: 12,
  },
  exclusive: {
    fontSize: 12,
    fontWeight: "700",
  },
  author: {
    marginBottom: 16,
    fontSize: 14,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
  },
  mediaLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  error: {
    marginTop: 24,
    fontSize: 14,
  },
});
