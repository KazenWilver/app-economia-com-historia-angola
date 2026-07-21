export interface TutorSource {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
}

export interface TutorExchange {
  id: number;
  question: string;
  answer: string;
  sources: TutorSource[];
  provider: string;
  content_id: number | null;
  created_at: string | null;
}

export interface TutorAskResponse {
  data: TutorExchange;
  meta: {
    provider: string;
  };
}
