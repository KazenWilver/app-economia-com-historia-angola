import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import type { MapProvinceDetailResponse } from "@shared/types";
import { Card, Screen } from "@/components/ui";
import { apiFetch } from "@/lib/api";
import { colors } from "@/lib/theme";

export default function ProvinciaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [province, setProvince] = useState<
    MapProvinceDetailResponse["data"] | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<MapProvinceDetailResponse>(
        `/provinces/${id}`,
      );
      setProvince(data.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar a província.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

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

  if (error || !province) {
    return (
      <Screen>
        <Text style={styles.error}>{error ?? "Província não encontrada."}</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>{province.name}</Text>
      <Text style={styles.meta}>
        Código {province.code}
        {province.capital ? ` · Capital: ${province.capital}` : ""}
      </Text>

      {province.narratives.length === 0 ? (
        <Card>
          <Text style={styles.empty}>
            Ainda não há narrativas para esta província.
          </Text>
        </Card>
      ) : (
        province.narratives.map((narrative) => (
          <Card key={narrative.id}>
            <Text style={styles.narrativeTitle}>{narrative.title}</Text>
            {narrative.period ? (
              <Text style={styles.period}>{narrative.period}</Text>
            ) : null}
            <Text style={styles.body}>{narrative.narrative_text}</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.contentPrimary,
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    color: colors.contentSecondary,
    marginBottom: 20,
  },
  narrativeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.contentPrimary,
    marginBottom: 6,
  },
  period: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.bordeaux,
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.contentSecondary,
  },
  empty: {
    fontSize: 14,
    color: colors.contentSecondary,
  },
  error: {
    marginTop: 24,
    color: colors.error,
    fontSize: 14,
  },
});
