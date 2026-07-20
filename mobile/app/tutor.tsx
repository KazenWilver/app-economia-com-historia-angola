import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { TutorAskResponse, TutorExchange } from "@shared/types";
import { Card, PrimaryButton, Screen, Title } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";

interface ChatTurn {
  id: string;
  role: "user" | "assistant";
  text: string;
  exchange?: TutorExchange;
}

const SUGGESTIONS = [
  "O que é a diversificação económica em Angola?",
  "Qual o peso do petróleo nas exportações?",
  "Que papel teve o café na economia angolana?",
];

export default function TutorScreen() {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const colors = useThemeColors();
  const [question, setQuestion] = useState("");
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/(auth)/login" as never);
    }
  }, [authLoading, isAuthenticated]);

  const ask = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!token || trimmed.length < 5 || isAsking) {
        return;
      }

      setError(null);
      setIsAsking(true);
      setQuestion("");
      setTurns((current) => [
        ...current,
        { id: `u-${Date.now()}`, role: "user", text: trimmed },
      ]);

      try {
        const response = await apiFetch<TutorAskResponse>("/tutor/ask", {
          method: "POST",
          token,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed }),
        });

        setTurns((current) => [
          ...current,
          {
            id: `a-${response.data.id}`,
            role: "assistant",
            text: response.data.answer,
            exchange: response.data,
          },
        ]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível obter resposta do tutor.",
        );
        setTurns((current) => [
          ...current,
          {
            id: `e-${Date.now()}`,
            role: "assistant",
            text: "Desculpa — não consegui responder agora. Tenta novamente.",
          },
        ]);
      } finally {
        setIsAsking(false);
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
      }
    },
    [isAsking, token],
  );

  if (authLoading || !isAuthenticated) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.bordeaux} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={88}
      >
        <Title
          title="Tutor"
          subtitle="Perguntas sobre economia e história de Angola, com base na biblioteca publicada."
        />

        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {turns.length === 0 ? (
            <Card>
              <Text
                style={[styles.suggestionsTitle, { color: colors.contentPrimary }]}
              >
                Sugestões para começar
              </Text>
              {SUGGESTIONS.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  disabled={isAsking}
                  onPress={() => void ask(suggestion)}
                  style={[
                    styles.suggestion,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceSecondary,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      { color: colors.contentPrimary },
                    ]}
                  >
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </Card>
          ) : null}

          {turns.map((turn) => (
            <View
              key={turn.id}
              style={[
                styles.bubble,
                turn.role === "user"
                  ? {
                      alignSelf: "flex-end",
                      backgroundColor: colors.bordeaux,
                    }
                  : {
                      alignSelf: "flex-start",
                      backgroundColor: colors.surfaceCard,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
              ]}
            >
              <Text
                style={[
                  styles.bubbleText,
                  {
                    color:
                      turn.role === "user" ? colors.white : colors.contentPrimary,
                  },
                ]}
              >
                {turn.text}
              </Text>

              {turn.exchange?.sources && turn.exchange.sources.length > 0 ? (
                <View style={styles.sources}>
                  <Text
                    style={[
                      styles.sourcesLabel,
                      { color: colors.contentTertiary },
                    ]}
                  >
                    Fontes
                  </Text>
                  {turn.exchange.sources.map((source) => (
                    <Pressable
                      key={source.id}
                      onPress={() =>
                        router.push(`/conteudo/${source.slug}` as never)
                      }
                    >
                      <Text
                        style={[styles.sourceLink, { color: colors.petrol }]}
                      >
                        {source.title}
                      </Text>
                      {source.excerpt ? (
                        <Text
                          style={[
                            styles.sourceExcerpt,
                            { color: colors.contentTertiary },
                          ]}
                          numberOfLines={2}
                        >
                          {source.excerpt}
                        </Text>
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              ) : null}
            </View>
          ))}

          {isAsking ? (
            <Text style={[styles.thinking, { color: colors.contentTertiary }]}>
              A consultar a biblioteca…
            </Text>
          ) : null}
        </ScrollView>

        <View
          style={[
            styles.composer,
            {
              borderTopColor: colors.border,
              backgroundColor: colors.surfaceCard,
            },
          ]}
        >
          <TextInput
            value={question}
            onChangeText={setQuestion}
            editable={!isAsking}
            multiline
            placeholder="Pergunta sobre um tema da biblioteca…"
            placeholderTextColor={colors.contentTertiary}
            style={[
              styles.input,
              {
                color: colors.contentPrimary,
                borderColor: colors.border,
                backgroundColor: colors.surface,
              },
            ]}
          />
          <PrimaryButton
            label="Perguntar"
            isLoading={isAsking}
            disabled={question.trim().length < 5}
            onPress={() => void ask(question)}
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chatContent: {
    gap: 12,
    paddingBottom: 16,
  },
  suggestionsTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  suggestion: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubble: {
    maxWidth: "92%",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 21,
  },
  sources: {
    marginTop: 10,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.12)",
    paddingTop: 10,
  },
  sourcesLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sourceLink: {
    fontSize: 13,
    fontWeight: "700",
  },
  sourceExcerpt: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  thinking: {
    fontSize: 13,
  },
  composer: {
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  error: {
    marginBottom: 8,
    fontSize: 13,
  },
});
