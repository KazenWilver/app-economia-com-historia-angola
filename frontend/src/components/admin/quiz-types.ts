export type {
  AdminQuiz,
  AdminQuizResponse,
  AdminQuizzesResponse,
  QuizAnswer,
  QuizMutationResponse,
  QuizQuestion,
} from "@shared/types";

import type { AdminQuiz, QuizAnswer, QuizQuestion } from "@shared/types";

export type TimeLimitUnit = "minutes" | "seconds";

export const TIME_LIMIT_PRESETS_MINUTES = [2, 5, 10, 15, 30] as const;

export interface QuizFormValues {
  title: string;
  description: string;
  time_limit_enabled: boolean;
  time_limit_value: string;
  time_limit_unit: TimeLimitUnit;
  is_active: boolean;
  questions: QuizQuestion[];
}

export function secondsFromTimeLimitParts(
  enabled: boolean,
  value: string,
  unit: TimeLimitUnit,
): number | null {
  if (!enabled) {
    return null;
  }

  const amount = Number(value.trim());

  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const seconds =
    unit === "minutes" ? Math.round(amount * 60) : Math.round(amount);

  return seconds;
}

export function timeLimitPartsFromSeconds(seconds: number | null): {
  enabled: boolean;
  value: string;
  unit: TimeLimitUnit;
} {
  if (seconds === null || seconds <= 0) {
    return {
      enabled: false,
      value: "",
      unit: "minutes",
    };
  }

  if (seconds % 60 === 0 && seconds >= 60) {
    return {
      enabled: true,
      value: String(seconds / 60),
      unit: "minutes",
    };
  }

  return {
    enabled: true,
    value: String(seconds),
    unit: "seconds",
  };
}

export function formatTimeLimitInputSummary(
  enabled: boolean,
  value: string,
  unit: TimeLimitUnit,
): string {
  const seconds = secondsFromTimeLimitParts(enabled, value, unit);

  if (seconds === null) {
    return "Sem limite";
  }

  return formatTimeLimit(seconds);
}

export function emptyAnswer(order = 0, isCorrect = false): QuizAnswer {
  return {
    answer_text: "",
    is_correct: isCorrect,
    order,
  };
}

export function emptyQuestion(order = 0): QuizQuestion {
  return {
    question_text: "",
    explanation: "",
    order,
    answers: [emptyAnswer(0, true), emptyAnswer(1, false)],
  };
}

export function emptyQuizForm(): QuizFormValues {
  return {
    title: "",
    description: "",
    time_limit_enabled: false,
    time_limit_value: "5",
    time_limit_unit: "minutes",
    is_active: true,
    questions: [emptyQuestion()],
  };
}

export function quizToFormValues(quiz: AdminQuiz): QuizFormValues {
  const timeLimit = timeLimitPartsFromSeconds(quiz.time_limit_seconds);

  return {
    title: quiz.title,
    description: quiz.description ?? "",
    time_limit_enabled: timeLimit.enabled,
    time_limit_value: timeLimit.value,
    time_limit_unit: timeLimit.unit,
    is_active: quiz.is_active,
    questions:
      quiz.questions?.map((question, questionIndex) => ({
        id: question.id,
        question_text: question.question_text,
        explanation: question.explanation ?? "",
        order: question.order ?? questionIndex,
        answers: question.answers.map((answer, answerIndex) => ({
          id: answer.id,
          answer_text: answer.answer_text,
          is_correct: Boolean(answer.is_correct),
          order: answer.order ?? answerIndex,
        })),
      })) ?? [emptyQuestion()],
  };
}

export function formValuesToPayload(values: QuizFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim() || null,
    time_limit_seconds: secondsFromTimeLimitParts(
      values.time_limit_enabled,
      values.time_limit_value,
      values.time_limit_unit,
    ),
    is_active: values.is_active,
    questions: values.questions.map((question, questionIndex) => ({
      question_text: question.question_text.trim(),
      explanation: question.explanation.trim() || null,
      order: questionIndex,
      answers: question.answers.map((answer, answerIndex) => ({
        answer_text: answer.answer_text.trim(),
        is_correct: answer.is_correct,
        order: answerIndex,
      })),
    })),
  };
}

export function formatTimeLimit(seconds: number | null): string {
  if (!seconds) {
    return "Sem limite";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }

  return `${minutes} min ${remainingSeconds}s`;
}
