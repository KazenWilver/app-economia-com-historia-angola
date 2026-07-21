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
