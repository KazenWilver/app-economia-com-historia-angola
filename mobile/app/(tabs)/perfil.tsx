import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  LearningPathMeta,
  LearningPathResponse,
  ProvincesResponse,
  QuizRecommendation,
  RecommendationsResponse,
  UpdateProfilePayload,
} from "@shared/types";
import {
  Card,
  Field,
  PrimaryButton,
  Screen,
  Title,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

type AvatarAsset = {
  uri: string;
  name: string;
  type: string;
};

export default function PerfilScreen() {
  const { user, token, isAuthenticated, logout, updateProfile } = useAuth();
  const colors = useThemeColors();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [provinceId, setProvinceId] = useState(
    user?.province_id ? String(user.province_id) : "",
  );
  const [provinces, setProvinces] = useState<ProvincesResponse["data"]>([]);
  const [recommendations, setRecommendations] = useState<QuizRecommendation[]>(
    [],
  );
  const [pathMeta, setPathMeta] = useState<LearningPathMeta | null>(null);
  const [avatarAsset, setAvatarAsset] = useState<AvatarAsset | null>(null);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(user?.name ?? "");
    setEmail(user?.email ?? "");
    setPhone(user?.phone ?? "");
    setProvinceId(user?.province_id ? String(user.province_id) : "");
  }, [user]);

  useEffect(() => {
    void apiFetch<ProvincesResponse>("/provinces")
      .then((data) => setProvinces(data.data))
      .catch(() => {
        // ignore
      });
  }, []);

  const loadRecommendations = useCallback(async () => {
    if (!token) {
      setRecommendations([]);
      setPathMeta(null);
      return;
    }

    try {
      const [recs, path] = await Promise.all([
        apiFetch<RecommendationsResponse>("/recommendations", { token }),
        apiFetch<LearningPathResponse>("/learning-path", { token }),
      ]);
      setRecommendations(recs.data);
      setPathMeta(path.meta);
    } catch {
      setRecommendations([]);
      setPathMeta(null);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void loadRecommendations();
    }, [loadRecommendations]),
  );

  const pickAvatar = async () => {
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Precisas de permitir o acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const mime = asset.mimeType ?? "image/jpeg";
    const extensionFromMime = mime.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
    const uriExt = asset.uri.split(".").pop()?.toLowerCase();
    const extension =
      uriExt && ["jpg", "jpeg", "png", "webp", "gif"].includes(uriExt)
        ? uriExt === "jpeg"
          ? "jpg"
          : uriExt
        : extensionFromMime;

    setAvatarAsset({
      uri: asset.uri,
      name: `avatar.${extension}`,
      type: mime,
    });
  };

  const handleSave = async () => {
    setError(null);
    setMessage(null);
    setSaving(true);

    try {
      const payload: UpdateProfilePayload = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        province_id: provinceId ? Number(provinceId) : undefined,
      };

      if (avatarAsset) {
        payload.avatar = avatarAsset as unknown as File;
      }

      await updateProfile(payload);
      setAvatarAsset(null);
      setMessage("Perfil actualizado com sucesso.");
      await loadRecommendations();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível guardar.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    setLoggingOut(true);

    try {
      await logout();
      router.replace("/(auth)/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível terminar a sessão.",
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const markRead = async (recommendationId: number) => {
    if (!token) {
      return;
    }

    try {
      await apiFetch(`/recommendations/${recommendationId}/read`, {
        method: "POST",
        token,
      });
      setRecommendations((prev) =>
        prev.map((item) =>
          item.id === recommendationId ? { ...item, is_read: true } : item,
        ),
      );
    } catch {
      // ignore
    }
  };

  const previewUri =
    avatarAsset?.uri ?? resolveMediaUrl(user?.avatar_url) ?? null;

  if (!isAuthenticated) {
    return (
      <Screen scroll>
        <Title
          title="Perfil"
          subtitle="Inicia sessão para gerir a conta e ver recomendações."
        />
        <Card>
          <Text style={[styles.hint, { color: colors.contentTertiary }]}>
            Como convidado podes explorar conteúdos públicos, o mapa e o fórum.
            Para quizzes, comentários e perfil completo, cria uma conta.
          </Text>
          <PrimaryButton
            label="Entrar"
            onPress={() => router.push("/(auth)/login" as never)}
          />
          <View style={styles.spacer} />
          <PrimaryButton
            label="Criar conta"
            onPress={() => router.push("/(auth)/registar" as never)}
          />
        </Card>

        <Text
          style={[styles.sectionTitle, { color: colors.contentPrimary }]}
        >
          Atalhos
        </Text>
        <View style={styles.shortcuts}>
          <PrimaryButton
            label="Explorar conteúdos"
            onPress={() => router.push("/(tabs)/explorar" as never)}
          />
          <View style={styles.spacer} />
          <PrimaryButton
            label="Trilho educativo"
            onPress={() => router.push("/trilho" as never)}
          />
          <View style={styles.spacer} />
          <PrimaryButton
            label="Mapa"
            onPress={() => router.push("/(tabs)/mapa" as never)}
          />
          <View style={styles.spacer} />
          <PrimaryButton
            label="Ranking"
            onPress={() => router.push("/ranking" as never)}
          />
          <View style={styles.spacer} />
          <PrimaryButton
            label="Termos de utilização"
            onPress={() => router.push("/termos" as never)}
          />
          <View style={styles.spacer} />
          <PrimaryButton
            label="Privacidade"
            onPress={() => router.push("/privacidade" as never)}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Title
        title="Perfil"
        subtitle="Actualiza os teus dados e gere a sessão."
      />

      <Card>
        <View style={styles.avatarBlock}>
          {previewUri ? (
            <Image
              source={{ uri: previewUri }}
              style={[styles.avatar, { backgroundColor: colors.bordeauxMuted }]}
            />
          ) : (
            <View
              style={[
                styles.avatar,
                styles.avatarPlaceholder,
                { backgroundColor: colors.bordeauxMuted },
              ]}
            >
              <Text style={[styles.avatarInitial, { color: colors.bordeaux }]}>
                {(user?.name ?? "?").charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <PrimaryButton
            label="Escolher do dispositivo"
            onPress={() => void pickAvatar()}
          />
        </View>

        <Field
          label="Nome"
          value={name}
          onChangeText={setName}
        />
        <Field
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Field
          label="Telefone"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholder="Opcional"
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
          <Pressable
            onPress={() => setProvinceId("")}
            style={[
              styles.provinceChip,
              {
                borderColor: !provinceId ? colors.bordeaux : colors.border,
                backgroundColor: !provinceId
                  ? colors.bordeauxMuted
                  : colors.surface,
              },
            ]}
          >
            <Text
              style={[
                styles.provinceChipText,
                {
                  color: !provinceId
                    ? colors.bordeaux
                    : colors.contentSecondary,
                },
              ]}
            >
              Nenhuma
            </Text>
          </Pressable>
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

        {user?.province?.name ? (
          <Text style={[styles.hint, { color: colors.contentTertiary }]}>
            Actual: {user.province.name}
          </Text>
        ) : null}

        {user?.role ? (
          <Text style={[styles.role, { color: colors.contentSecondary }]}>
            Papel: {user.role}
          </Text>
        ) : null}
      </Card>

      <Text style={[styles.sectionTitle, { color: colors.contentPrimary }]}>
        Atalhos
      </Text>
      {pathMeta && pathMeta.total_count > 0 ? (
        <Card onPress={() => router.push("/trilho" as never)}>
          <Text style={[styles.recTitle, { color: colors.contentPrimary }]}>
            Progresso do trilho
          </Text>
          <Text style={[styles.hint, { color: colors.contentTertiary }]}>
            {pathMeta.completed_count}/{pathMeta.total_count} passos ·{" "}
            {pathMeta.percent}%
          </Text>
        </Card>
      ) : null}
      <View style={styles.shortcuts}>
        <PrimaryButton
          label="Trilho educativo"
          onPress={() => router.push("/trilho" as never)}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Tutor IA"
          onPress={() => router.push("/tutor" as never)}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Explorar conteúdos"
          onPress={() => router.push("/(tabs)/explorar" as never)}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Quizzes"
          onPress={() => router.push("/(tabs)/quiz" as never)}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Biblioteca Jindungo"
          onPress={() => router.push("/jindungo" as never)}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Ranking"
          onPress={() => router.push("/ranking" as never)}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Mapa"
          onPress={() => router.push("/(tabs)/mapa" as never)}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Fórum"
          onPress={() => router.push("/(tabs)/forum" as never)}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Termos de utilização"
          onPress={() => router.push("/termos" as never)}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Privacidade"
          onPress={() => router.push("/privacidade" as never)}
        />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.contentPrimary }]}>
        Recomendações
      </Text>
      {recommendations.length === 0 ? (
        <Text style={[styles.hint, { color: colors.contentTertiary }]}>
          Ainda não tens recomendações.
        </Text>
      ) : (
        recommendations.map((item) => (
          <Card
            key={item.id}
            onPress={() => {
              void markRead(item.id);
              if (item.content?.slug) {
                router.push(`/conteudo/${item.content.slug}` as never);
              }
            }}
          >
            <Text style={[styles.recTitle, { color: colors.contentPrimary }]}>
              {item.content?.title}
            </Text>
            {item.reason ? (
              <Text style={[styles.hint, { color: colors.contentTertiary }]}>
                {item.reason}
              </Text>
            ) : null}
            <Text style={[styles.recMeta, { color: colors.petrol }]}>
              {item.is_read ? "Lida" : "Nova"}
            </Text>
          </Card>
        ))
      )}

      {message ? (
        <Text style={[styles.success, { color: colors.success }]}>
          {message}
        </Text>
      ) : null}
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}

      <View style={styles.actions}>
        <PrimaryButton
          label="Guardar alterações"
          onPress={() => void handleSave()}
          isLoading={saving}
        />
        <View style={styles.spacer} />
        <PrimaryButton
          label="Terminar sessão"
          onPress={() => void handleLogout()}
          isLoading={loggingOut}
          variant="danger"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatarBlock: {
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: "800",
  },
  provinceLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  provinceRow: {
    gap: 8,
    paddingBottom: 8,
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
  hint: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  role: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "800",
  },
  shortcuts: { marginBottom: 8 },
  recTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  recMeta: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
  },
  actions: { marginTop: 8 },
  spacer: { height: 12 },
  success: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    marginBottom: 8,
    fontSize: 14,
  },
});
