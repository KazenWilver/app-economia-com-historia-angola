import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import type { MapProvinceDetailResponse } from "@shared/types";
import { Card, Screen } from "@/components/ui";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";
import { subscribeDataChanged } from "@/lib/data-refresh";

export default function ProvinciaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
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

  useFocusEffect(
    useCallback(() => {
      void load();
      return subscribeDataChanged(() => {
        void load();
      });
    }, [load]),
  );

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
        <Text style={[styles.error, { color: colors.error }]}>
          {error ?? "Província não encontrada."}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.contentPrimary }]}>
        {province.name}
      </Text>
      <Text style={[styles.meta, { color: colors.contentSecondary }]}>
        Código {province.code}
        {province.capital ? ` · Capital: ${province.capital}` : ""}
      </Text>

      {province.narratives.length === 0 ? (
        <Card>
          <Text style={[styles.empty, { color: colors.contentSecondary }]}>
            Ainda não há narrativas para esta província.
          </Text>
        </Card>
      ) : (
        province.narratives.map((narrative) => (
          <Card key={narrative.id}>
            <Text
              style={[styles.narrativeTitle, { color: colors.contentPrimary }]}
            >
              {narrative.title}
            </Text>
            {narrative.period ? (
              <Text style={[styles.period, { color: colors.bordeaux }]}>
                {narrative.period}
              </Text>
            ) : null}
            <Text style={[styles.body, { color: colors.contentSecondary }]}>
              {narrative.narrative_text}
            </Text>
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
    marginBottom: 8,
  },
  meta: {
    fontSize: 14,
    marginBottom: 20,
  },
  narrativeTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  period: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  empty: {
    fontSize: 14,
  },
  error: {
    marginTop: 24,
    fontSize: 14,
  },
});
