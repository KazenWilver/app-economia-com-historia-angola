import type { LearningPathStep, LearningStepType } from "@shared/types";

/**
 * Converte hrefs da API (web) para rotas Expo Router.
 */
export function resolveLearningStepHref(step: LearningPathStep): string {
  const href = step.href?.trim() || "";

  if (href.startsWith("/explorar/")) {
    const slug = href.replace("/explorar/", "").split("?")[0];
    return slug ? `/conteudo/${slug}` : "/(tabs)/explorar";
  }

  if (href === "/explorar") {
    return "/(tabs)/explorar";
  }

  if (href.startsWith("/quiz/")) {
    return href;
  }

  if (href === "/quiz") {
    return "/(tabs)/quiz";
  }

  if (href === "/mapa" || href.startsWith("/mapa")) {
    return "/(tabs)/mapa";
  }

  if (href === "/forum" || href.startsWith("/forum")) {
    return "/(tabs)/forum";
  }

  if (href.startsWith("/jindungo/")) {
    const slug = href.replace("/jindungo/", "").split("?")[0];
    return slug ? `/conteudo/${slug}` : "/jindungo";
  }

  if (href === "/jindungo") {
    return "/jindungo";
  }

  switch (step.step_type as LearningStepType) {
    case "content":
      return "/(tabs)/explorar";
    case "quiz":
      return step.reference_id
        ? `/quiz/${step.reference_id}`
        : "/(tabs)/quiz";
    case "map":
      return "/(tabs)/mapa";
    case "forum":
      return "/(tabs)/forum";
    default:
      return "/(tabs)/explorar";
  }
}

export const LEARNING_STEP_LABELS: Record<LearningStepType, string> = {
  content: "Conteúdo",
  quiz: "Quiz",
  map: "Mapa",
  forum: "Fórum",
};
