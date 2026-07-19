import { RankingPageClient } from "@/components/ranking/RankingPageClient";
import type {
  ProvincesResponse,
  RankingsResponse,
} from "@/components/ranking/ranking-types";
import type { PublicQuizzesResponse } from "@/components/quiz/quiz-types";
import { serverApiFetch } from "@/lib/server-api";

export const revalidate = 60;

export default async function RankingPage() {
  const [rankingsResult, quizzesResult, provincesResult] = await Promise.all([
    serverApiFetch<RankingsResponse>("/rankings", { revalidate: 60 }),
    serverApiFetch<PublicQuizzesResponse>("/quizzes", { revalidate: 60 }),
    serverApiFetch<ProvincesResponse>("/provinces", { revalidate: 300 }),
  ]);

  const initialError =
    rankingsResult.ok
      ? null
      : "Não foi possível carregar o ranking.";

  return (
    <RankingPageClient
      initialRankings={rankingsResult.ok ? rankingsResult.data.data : []}
      initialMeta={rankingsResult.ok ? rankingsResult.data.meta : null}
      initialQuizzes={quizzesResult.ok ? quizzesResult.data.data : []}
      initialProvinces={provincesResult.ok ? provincesResult.data.data : []}
      initialError={initialError}
    />
  );
}
