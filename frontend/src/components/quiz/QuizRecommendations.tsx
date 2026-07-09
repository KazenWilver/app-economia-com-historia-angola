import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { QuizRecommendation } from "@/components/quiz/quiz-types";
import { Badge, type BadgeType } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const BADGE_TYPES: Record<QuizRecommendation["content"]["type"], BadgeType> = {
  texto: "text",
  audio: "audio",
  video: "video",
  podcast: "podcast",
  jindungo: "jindungo",
};

const TYPE_LABELS: Record<QuizRecommendation["content"]["type"], string> = {
  texto: "Texto",
  audio: "Áudio",
  video: "Vídeo",
  podcast: "Podcast",
  jindungo: "Jindungo",
};

interface QuizRecommendationsProps {
  recommendations: QuizRecommendation[];
}

export function QuizRecommendations({ recommendations }: QuizRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <BookOpen
          className="h-5 w-5 text-bordeaux dark:text-bordeaux-dark"
          strokeWidth={1.5}
        />
        <h2 className="font-display text-xl font-bold text-content-primary dark:text-content-dark-primary">
          Conteúdos recomendados
        </h2>
      </div>

      <div className="grid gap-4">
        {recommendations.map((recommendation) => (
          <Link
            key={recommendation.id}
            href={
              recommendation.content.type === "jindungo"
                ? `/jindungo/${recommendation.content.slug}`
                : `/explorar/${recommendation.content.slug}`
            }
            className="block"
          >
            <Card
              hoverLift={false}
              className="border-bordeaux/15 transition-colors hover:border-bordeaux/40 dark:border-bordeaux-dark/20 dark:hover:border-bordeaux-dark/40"
            >
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge type={BADGE_TYPES[recommendation.content.type]}>
                    {TYPE_LABELS[recommendation.content.type]}
                  </Badge>
                  {recommendation.content.category ? (
                    <span className="text-xs font-medium uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                      {recommendation.content.category.name}
                    </span>
                  ) : null}
                </div>
                <CardTitle className="text-lg">
                  {recommendation.content.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recommendation.content.excerpt ? (
                  <p className="line-clamp-2 text-sm text-content-secondary dark:text-content-dark-secondary">
                    {recommendation.content.excerpt}
                  </p>
                ) : null}
                {recommendation.reason ? (
                  <p className="text-sm font-medium text-bordeaux dark:text-bordeaux-dark">
                    {recommendation.reason}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
