import type { QuizRecommendation } from "@shared/types";

export type {
  PublicQuiz,
  PublicQuizAnswer,
  PublicQuizQuestion,
  PublicQuizResponse,
  PublicQuizzesResponse,
  QuestionFeedbackResponse,
  QuestionFeedbackResult,
  QuizAttemptAnswerResult,
  QuizAttemptResult,
  QuizRecommendation,
} from "@shared/types";

export interface QuizAttemptResponse {
  message: string;
  attempt: import("@shared/types").QuizAttemptResult;
  recommendations: QuizRecommendation[];
}

export function formatQuizTimeLimit(seconds: number | null): string {
  if (!seconds) {
    return "Sem limite";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes} min ${remainingSeconds}s`;
}

export function formatTimer(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}
