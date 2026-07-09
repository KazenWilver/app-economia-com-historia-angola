export interface AdminStatsTotals {
  users: number;
  contents: number;
  quizzes: number;
  quiz_attempts: number;
  topics: number;
}

export interface AdminMonthlyActivity {
  month: string;
  users: number;
  quiz_attempts: number;
  topics: number;
}

export interface AdminStatsData {
  totals: AdminStatsTotals;
  contents_by_type: Record<string, number>;
  contents_by_status: Record<string, number>;
  monthly_activity: AdminMonthlyActivity[];
}

export interface AdminStatsResponse {
  data: AdminStatsData;
}

export const CONTENT_TYPE_CHART_LABELS: Record<string, string> = {
  texto: "Texto",
  audio: "Áudio",
  video: "Vídeo",
  podcast: "Podcast",
  jindungo: "Jindungo",
};

export const CONTENT_STATUS_CHART_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};
