import type { QuizRecommendation } from "@shared/types";

export type { QuizRecommendation } from "@shared/types";

export interface PublicQuizAnswer {
  id: number;
  answer_text: string;
  order: number;
}

export interface PublicQuizQuestion {
  id: number;
  question_text: string;
  order: number;
  answers: PublicQuizAnswer[];
}

export interface PublicQuiz {
  id: number;
  title: string;
  description: string | null;
  time_limit_seconds: number | null;
  is_active: boolean;
  questions_count?: number;
  questions?: PublicQuizQuestion[];
}

export interface PublicQuizzesResponse {
  data: PublicQuiz[];
}

export interface PublicQuizResponse {
  data: PublicQuiz;
}

export interface QuizAttemptAnswerResult {
  question_id: number;
  question_text: string | null;
  selected_answer_id: number | null;
  selected_answer_text: string | null;
  correct_answer_id: number | null;
  correct_answer_text: string | null;
  is_correct: boolean;
  explanation: string | null;
}

export interface QuizAttemptResult {
  id: number;
  quiz_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  time_spent_seconds: number | null;
  completed_at: string | null;
  answers: QuizAttemptAnswerResult[];
  recommendations?: QuizRecommendation[];
}

export interface QuizAttemptResponse {
  message: string;
  attempt: QuizAttemptResult;
  recommendations: QuizRecommendation[];
}

export interface QuestionFeedbackResult {
  is_correct: boolean;
  selected_answer_id: number | null;
  selected_answer_text: string | null;
  correct_answer_id: number | null;
  correct_answer_text: string | null;
  explanation: string | null;
}

export interface QuestionFeedbackResponse {
  feedback: QuestionFeedbackResult;
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
