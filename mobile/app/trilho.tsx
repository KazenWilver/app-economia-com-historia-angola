import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type {
  LearningPath,
  LearningPathCompleteResponse,
  LearningPathMeta,
  LearningPathResponse,
  LearningPathStep,
} from "@shared/types";
import { Card, PrimaryButton, Screen, Title } from "@/components/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeColors } from "@/contexts/ThemeContext";
import { apiFetch } from "@/lib/api";
import {
  LEARNING_STEP_LABELS,
  resolveLearningStepHref,
} from "@/lib/learning-path";

export default function TrilhoScreen() {
  const { token, isAuthenticated } = useAuth();
  const colors = useThemeColors();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [meta, setMeta] = useState<LearningPathMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<LearningPathResponse>("/learning-path", {
        token,
      });
      setPath(data.data);
      setMeta(data.meta);
    } catch {
      setPath(null);
      setMeta(null);
      setError("Não foi possível carregar o trilho educativo.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const completeStep = async (step: LearningPathStep) => {
    if (!isAuthenticated || !token) {
      setInfo("Inicia sessão para guardares o teu progresso.");
      return;
    }

    setCompletingId(step.id);
    setError(null);

    try {
      const data = await apiFetch<LearningPathCompleteResponse>(
        `/learning-path/steps/${step.id}/complete`,
        { method: "POST", token },
      );
      setPath(data.data);
      setMeta(data.meta);
      setInfo("Passo marcado como concluído.");
    } catch {
      setError("Não foi possível concluir este passo.");
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.bordeaux} />
        </View>
      </Screen>
    );
  }

  if (!path || !meta) {
    return (
      <Screen scroll>
        <Title title="Trilho" subtitle="Percurso educativo guiado." />
        <Card>
          <Text style={[styles.empty, { color: colors.contentSecondary }]}>
            {error ?? "Ainda não há trilho activo."}
          </Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Title title={path.title} subtitle={path.description ?? undefined} />

      {error ? (
        <Text style={[styles.banner, { color: colors.error }]}>{error}</Text>
      ) : null}
      {info ? (
        <Text style={[styles.banner, { color: colors.petrol }]}>{info}</Text>
      ) : null}

      <Card>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.contentPrimary }]}>
            O teu progresso
          </Text>
          <Text style={[styles.progressValue, { color: colors.bordeaux }]}>
            {meta.completed_count}/{meta.total_count} · {meta.percent}%
          </Text>
        </View>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.surfaceSecondary },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.max(0, Math.min(100, meta.percent))}%`,
                backgroundColor: colors.bordeaux,
              },
            ]}
          />
        </View>
        {!isAuthenticated ? (
          <Text style={[styles.hint, { color: colors.contentTertiary }]}>
            Entra na tua conta para guardares o progresso automaticamente.
          </Text>
        ) : null}
      </Card>

      {path.steps.map((step, index) => {
        const done = step.is_completed;

        return (
          <Card key={step.id}>
            <Text
              style={[styles.stepMeta, { color: colors.contentTertiary }]}
            >
              Passo {index + 1} · {LEARNING_STEP_LABELS[step.step_type]}
              {done ? " · Concluído" : ""}
            </Text>
            <Text style={[styles.stepTitle, { color: colors.contentPrimary }]}>
              {step.title}
            </Text>
            {step.description ? (
              <Text
                style={[styles.stepBody, { color: colors.contentSecondary }]}
              >
                {step.description}
              </Text>
            ) : null}

            <View style={styles.actions}>
              <PrimaryButton
                label={done ? "Rever" : "Começar"}
                onPress={() =>
                  router.push(resolveLearningStepHref(step) as never)
                }
              />
              {!done &&
              isAuthenticated &&
              (step.step_type === "map" || step.step_type === "forum") ? (
                <>
                  <View style={styles.spacer} />
                  <PrimaryButton
                    label={
                      completingId === step.id
                        ? "A guardar…"
                        : "Marcar como concluído"
                    }
                    variant="secondary"
                    disabled={completingId === step.id}
                    onPress={() => void completeStep(step)}
                  />
                </>
              ) : null}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
  },
  banner: {
    marginBottom: 8,
    fontSize: 13,
    fontWeight: "600",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
  },
  stepMeta: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  stepTitle: {
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 6,
  },
  stepBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    marginTop: 4,
  },
  spacer: { height: 10 },
});
