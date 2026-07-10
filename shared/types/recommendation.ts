import type { ContentSummary } from "./content";

export interface QuizRecommendation {
  id: number;
  reason: string | null;
  is_read: boolean;
  quiz_attempt_id: number | null;
  content: ContentSummary;
  created_at?: string;
}

export interface RecommendationsResponse {
  data: QuizRecommendation[];
}
