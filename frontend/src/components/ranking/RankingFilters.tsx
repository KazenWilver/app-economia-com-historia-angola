import { Globe, MapPin } from "lucide-react";
import type { PublicProvince } from "@/components/ranking/ranking-types";
import type { PublicQuiz } from "@/components/quiz/quiz-types";
import { cn } from "@/lib/utils";

interface RankingFiltersProps {
  scope: "national" | "region";
  selectedQuizId: string;
  selectedProvinceId: string;
  quizzes: PublicQuiz[];
  provinces: PublicProvince[];
  onScopeChange: (scope: "national" | "region") => void;
  onQuizChange: (quizId: string) => void;
  onProvinceChange: (provinceId: string) => void;
}

const selectClassName =
  "w-full rounded-lg border border-border bg-white px-3 py-2.5 text-sm text-content-primary focus:border-bordeaux focus:outline-none focus:ring-2 focus:ring-bordeaux/20 dark:border-border-dark dark:bg-surface-dark-card dark:text-content-dark-primary dark:focus:border-bordeaux-dark dark:focus:ring-bordeaux-dark/20";

export function RankingFilters({
  scope,
  selectedQuizId,
  selectedProvinceId,
  quizzes,
  provinces,
  onScopeChange,
  onQuizChange,
  onProvinceChange,
}: RankingFiltersProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-white p-4 dark:border-border-dark dark:bg-surface-dark-card">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onScopeChange("national")}
          className={cn(
            "rounded-xl border p-4 text-left transition-all",
            scope === "national"
              ? "border-bordeaux bg-bordeaux/5 ring-2 ring-bordeaux/30 dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:ring-bordeaux-dark/30"
              : "border-border hover:border-bordeaux/40 dark:border-border-dark dark:hover:border-bordeaux-dark/40",
          )}
        >
          <span className="inline-flex items-center gap-2 font-display font-bold text-content-primary dark:text-content-dark-primary">
            <Globe className="h-5 w-5 text-bordeaux dark:text-bordeaux-dark" strokeWidth={1.5} />
            Nacional
          </span>
          <span className="mt-1 block text-sm text-content-secondary dark:text-content-dark-secondary">
            Melhores pontuações de todo o país.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onScopeChange("region")}
          className={cn(
            "rounded-xl border p-4 text-left transition-all",
            scope === "region"
              ? "border-bordeaux bg-bordeaux/5 ring-2 ring-bordeaux/30 dark:border-bordeaux-dark dark:bg-bordeaux-dark/10 dark:ring-bordeaux-dark/30"
              : "border-border hover:border-bordeaux/40 dark:border-border-dark dark:hover:border-bordeaux-dark/40",
          )}
        >
          <span className="inline-flex items-center gap-2 font-display font-bold text-content-primary dark:text-content-dark-primary">
            <MapPin className="h-5 w-5 text-bordeaux dark:text-bordeaux-dark" strokeWidth={1.5} />
            Por região
          </span>
          <span className="mt-1 block text-sm text-content-secondary dark:text-content-dark-secondary">
            Filtra utilizadores por província.
          </span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
            Quiz
          </span>
          <select
            value={selectedQuizId}
            onChange={(event) => onQuizChange(event.target.value)}
            className={selectClassName}
          >
            <option value="all">Todos os quizzes</option>
            {quizzes.map((quiz) => (
              <option key={quiz.id} value={String(quiz.id)}>
                {quiz.title}
              </option>
            ))}
          </select>
        </label>

        {scope === "region" ? (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
              Província
            </span>
            <select
              value={selectedProvinceId}
              onChange={(event) => onProvinceChange(event.target.value)}
              className={selectClassName}
            >
              <option value="all">Selecciona uma província</option>
              {provinces.map((province) => (
                <option key={province.id} value={String(province.id)}>
                  {province.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
    </div>
  );
}
