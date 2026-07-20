export type LearningStepType = "content" | "quiz" | "map" | "forum";

export interface LearningPathStep {
  id: number;
  title: string;
  description: string | null;
  step_type: LearningStepType;
  reference_id: number | null;
  href: string;
  order: number;
  is_completed: boolean;
}

export interface LearningPath {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  steps: LearningPathStep[];
}

export interface LearningPathMeta {
  completed_count: number;
  total_count: number;
  percent: number;
  requires_auth_for_progress?: boolean;
}

export interface LearningPathResponse {
  data: LearningPath | null;
  meta: LearningPathMeta;
  message?: string;
}

export interface LearningPathCompleteResponse {
  message: string;
  data: LearningPath | null;
  meta: LearningPathMeta;
}
