import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { ProvincesResponse, UpdateProfilePayload } from "@shared/types";
import {
  Card,
  Field,
  PrimaryButton,
  Screen,
  Title,
} from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

type AvatarAsset = {
  uri: string;
  name: string;
  type: string;
};

export default function PerfilScreen() {
  const { user, logout, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [provinceId, setProvinceId] = useState(
    user?.province_id ? String(user.province_id) : "",
  );
  const [provinces, setProvinces] = useState<ProvincesResponse["data"]>([]);
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

  const pickAvatar = async () => {
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Precisas de permitir o acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const extension = asset.uri.split(".").pop()?.toLowerCase() ?? "jpg";
    const mime =
      asset.mimeType ??
      (extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg");

    setAvatarAsset({
      uri: asset.uri,
      name: `avatar.${extension === "jpeg" ? "jpg" : extension}`,
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

  const previewUri = avatarAsset?.uri ?? user?.avatar_url ?? null;

  return (
    <Screen scroll>
      <Title title="Perfil" subtitle="Actualiza os teus dados e gere a sessão." />

      <Card>
        <View style={styles.avatarBlock}>
          {previewUri ? (
            <Image source={{ uri: previewUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>
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
          variant="light"
          value={name}
          onChangeText={setName}
        />
        <Field
          label="Email"
          variant="light"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Field
          label="Telefone"
          variant="light"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholder="Opcional"
        />
        <Field
          label="Província (ID)"
          variant="light"
          keyboardType="number-pad"
          value={provinceId}
          onChangeText={setProvinceId}
        />
        {provinces.length > 0 ? (
          <Text style={styles.hint}>
            Ex.:{" "}
            {provinces
              .slice(0, 5)
              .map((p) => `${p.id}=${p.name}`)
              .join(" · ")}
            {provinces.length > 5 ? " …" : ""}
          </Text>
        ) : null}

        {user?.role ? (
          <Text style={styles.role}>Papel: {user.role}</Text>
        ) : null}
      </Card>

      {message ? <Text style={styles.success}>{message}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

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
    backgroundColor: colors.bordeauxMuted,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: "800",
    color: colors.bordeaux,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.contentTertiary,
    marginBottom: 8,
  },
  role: {
    marginTop: 4,
    fontSize: 13,
    color: colors.contentSecondary,
    fontWeight: "600",
  },
  actions: { marginTop: 8 },
  spacer: { height: 12 },
  success: {
    marginBottom: 8,
    color: colors.petrol,
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    marginBottom: 8,
    color: colors.error,
    fontSize: 14,
  },
});
