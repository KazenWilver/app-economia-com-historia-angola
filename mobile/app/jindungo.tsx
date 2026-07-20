import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type {
  ContentItem,
  ContentsResponse,
  JindungoAccessMutationResponse,
  JindungoAccessStatus,
  JindungoAccessStatusResponse,
} from "@shared/types";
import { Card, EmptyState, PrimaryButton, Screen, Title } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";
import { isImageUrl, resolveMediaUrl } from "@/lib/media";

export default function JindungoScreen() {
  const { token, isAuthenticated } = useAuth();
  const colors = useThemeColors();
  const [accessStatus, setAccessStatus] = useState<JindungoAccessStatus | null>(
    null,
  );
  const [hasAccess, setHasAccess] = useState(false);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<ContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadAccess = useCallback(async () => {
    if (!token) {
      setAccessStatus(null);
      setHasAccess(false);
      return false;
    }

    const data = await apiFetch<JindungoAccessStatusResponse>(
      "/jindungo/access",
      { token },
    );
    setAccessStatus(data.data.status);
    setHasAccess(data.data.has_access);
    return data.data.has_access;
  }, [token]);

  const loadContents = useCallback(async () => {
    if (!token) {
      setItems([]);
      return;
    }

    const data = await apiFetch<ContentsResponse>("/contents?type=jindungo", {
      token,
    });
    setItems(data.data);
  }, [token]);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!token) {
        setItems([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const allowed = await loadAccess();
        if (allowed) {
          await loadContents();
        } else {
          setItems([]);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar a biblioteca Jindungo.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [loadAccess, loadContents, token],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const requestAccess = async () => {
    if (!token) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data = await apiFetch<JindungoAccessMutationResponse>(
        "/jindungo/access-requests",
        {
          method: "POST",
          token,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: message.trim() || undefined,
          }),
        },
      );
      setAccessStatus(data.data.status);
      setHasAccess(false);
      setInfo(data.message);
      setMessage("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar o pedido.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Screen scroll>
        <Title
          title="Jindungo"
          subtitle="Textos exclusivos com pedido de acesso aprovado pelo administrador."
        />
        <Card>
          <Text style={[styles.hint, { color: colors.contentSecondary }]}>
            Inicia sessão e pede acesso para consultar a biblioteca Jindungo.
          </Text>
          <PrimaryButton
            label="Entrar"
            onPress={() => router.push("/(auth)/login" as never)}
          />
        </Card>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.bordeaux} />
        </View>
      </Screen>
    );
  }

  if (!hasAccess) {
    const statusCopy =
      accessStatus === "pending"
        ? {
            title: "Pedido em análise",
            body: "O administrador ainda não decidiu. Volta mais tarde.",
          }
        : accessStatus === "rejected"
          ? {
              title: "Pedido rejeitado",
              body: "Podes voltar a pedir acesso com uma nova justificação.",
            }
          : {
              title: "Acesso sujeito a aprovação",
              body: "Envia um pedido ao administrador. Só depois de aprovado poderás abrir os textos Jindungo.",
            };

    return (
      <Screen scroll>
        <Title title="Jindungo" subtitle={statusCopy.body} />
        {error ? (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        ) : null}
        {info ? (
          <Text style={[styles.info, { color: colors.petrol }]}>{info}</Text>
        ) : null}
        <Card>
          <Text style={[styles.accessTitle, { color: colors.contentPrimary }]}>
            {statusCopy.title}
          </Text>
          {accessStatus === "none" || accessStatus === "rejected" ? (
            <>
              <Text
                style={[styles.hint, { color: colors.contentSecondary }]}
              >
                Mensagem (opcional)
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                editable={!submitting}
                multiline
                placeholder="Porque queres aceder aos textos Jindungo?"
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
                label="Pedir acesso"
                isLoading={submitting}
                onPress={() => void requestAccess()}
              />
            </>
          ) : null}
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor={colors.bordeaux}
          />
        }
        ListHeaderComponent={
          <Title
            title="Jindungo"
            subtitle="Textos exclusivos com acesso aprovado."
          />
        }
        ListEmptyComponent={
          error ? (
            <Card>
              <Text style={[styles.error, { color: colors.error }]}>
                {error}
              </Text>
            </Card>
          ) : (
            <EmptyState message="Ainda não há textos Jindungo publicados." />
          )
        }
        renderItem={({ item }) => {
          const imageUri =
            item.media_url && isImageUrl(item.media_url)
              ? resolveMediaUrl(item.media_url)
              : null;

          return (
            <Card
              onPress={() => router.push(`/conteudo/${item.slug}` as never)}
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.cover} />
              ) : null}
              <Text style={[styles.cardTitle, { color: colors.contentPrimary }]}>
                {item.title}
              </Text>
              {item.category?.name ? (
                <Text
                  style={[styles.cardMeta, { color: colors.contentTertiary }]}
                >
                  {item.category.name}
                </Text>
              ) : null}
            </Card>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingBottom: 24,
    gap: 12,
  },
  hint: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  accessTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    minHeight: 88,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
  error: {
    marginBottom: 8,
    fontSize: 13,
  },
  info: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  cover: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12,
  },
});
