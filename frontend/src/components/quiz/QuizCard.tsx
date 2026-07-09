import Link from "next/link";
import { Clock, HelpCircle, Puzzle } from "lucide-react";
import {
  formatQuizTimeLimit,
  type PublicQuiz,
} from "@/components/quiz/quiz-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface QuizCardProps {
  quiz: PublicQuiz;
}

export function QuizCard({ quiz }: QuizCardProps) {
  const questionCount = quiz.questions_count ?? quiz.questions?.length ?? 0;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-bordeaux/10 px-3 py-1 text-xs font-semibold text-bordeaux dark:bg-bordeaux-dark/10 dark:text-bordeaux-dark">
          <Puzzle className="h-3.5 w-3.5" strokeWidth={1.5} />
          Quiz
        </div>
        <CardTitle className="text-xl">{quiz.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        {quiz.description ? (
          <p className="line-clamp-3 text-sm text-content-secondary dark:text-content-dark-secondary">
            {quiz.description}
          </p>
        ) : (
          <p className="text-sm text-content-tertiary dark:text-content-dark-tertiary">
            Testa os teus conhecimentos sobre economia e história de Angola.
          </p>
        )}

        <div className="mt-auto flex flex-wrap gap-3 text-xs font-medium text-content-secondary dark:text-content-dark-secondary">
          <span className="inline-flex items-center gap-1.5">
            <HelpCircle className="h-4 w-4" strokeWidth={1.5} />
            {questionCount} pergunta{questionCount === 1 ? "" : "s"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" strokeWidth={1.5} />
            {formatQuizTimeLimit(quiz.time_limit_seconds)}
          </span>
        </div>

        <Link href={`/quiz/${quiz.id}`} className="block">
          <Button type="button" className="w-full">
            Jogar quiz
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
