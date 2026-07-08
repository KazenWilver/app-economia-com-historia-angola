export interface QuizAnswer {
  id?: number;
  answer_text: string;
  is_correct: boolean;
  order: number;
}

export interface QuizQuestion {
  id?: number;
  question_text: string;
  explanation: string;
  order: number;
  answers: QuizAnswer[];
}

export interface AdminQuiz {
  id: number;
  topic_id: number | null;
  title: string;
  description: string | null;
  time_limit_seconds: number | null;
  is_active: boolean;
  questions_count?: number;
  attempts_count?: number;
  questions?: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

export interface AdminQuizzesResponse {
  data: AdminQuiz[];
}

export interface AdminQuizResponse {
  data: AdminQuiz;
}

export interface QuizMutationResponse {
  message: string;
  quiz: AdminQuiz;
}

export interface QuizFormValues {
  title: string;
  description: string;
  time_limit_seconds: string;
  is_active: boolean;
  questions: QuizQuestion[];
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
    time_limit_seconds: "",
    is_active: true,
    questions: [emptyQuestion()],
  };
}

export function quizToFormValues(quiz: AdminQuiz): QuizFormValues {
  return {
    title: quiz.title,
    description: quiz.description ?? "",
    time_limit_seconds:
      quiz.time_limit_seconds !== null ? String(quiz.time_limit_seconds) : "",
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
    time_limit_seconds: values.time_limit_seconds.trim()
      ? Number(values.time_limit_seconds)
      : null,
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
