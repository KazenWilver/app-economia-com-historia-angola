export interface RankingProvince {
  id: number;
  name: string;
  code: string;
}

export interface RankingUser {
  id: number;
  name: string;
  avatar_url: string | null;
  province: RankingProvince | null;
}

export interface RankingEntry {
  position: number;
  best_score: number;
  correct_answers: number;
  total_questions: number;
  attempts_count: number;
  time_spent_seconds: number | null;
  completed_at: string | null;
  user: RankingUser;
}

export interface RankingsResponse {
  data: RankingEntry[];
  meta: {
    scope: "national" | "region";
    quiz_id: number | null;
    province_id: number | null;
    total: number;
  };
}

export interface PublicProvince {
  id: number;
  name: string;
  code: string;
}

export interface ProvincesResponse {
  data: PublicProvince[];
}

export function formatRankingTime(seconds: number | null): string {
  if (seconds === null) {
    return "—";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
}

export function buildRankingsQuery(params: {
  quizId?: string;
  provinceId?: string;
}): string {
  const search = new URLSearchParams();

  if (params.quizId && params.quizId !== "all") {
    search.set("quiz_id", params.quizId);
  }

  if (params.provinceId && params.provinceId !== "all") {
    search.set("province_id", params.provinceId);
  }

  const query = search.toString();

  return query ? `/rankings?${query}` : "/rankings";
}
