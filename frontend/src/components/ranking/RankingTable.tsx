import { Medal, Trophy } from "lucide-react";
import {
  formatRankingTime,
  type RankingEntry,
} from "@/components/ranking/ranking-types";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface RankingTableProps {
  entries: RankingEntry[];
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 font-display font-bold text-gold dark:text-gold-dark">
        <Trophy className="h-5 w-5" strokeWidth={1.5} />
        {position}º
      </span>
    );
  }

  if (position === 2 || position === 3) {
    return (
      <span className="inline-flex items-center gap-1.5 font-display font-bold text-gold/90 dark:text-gold-dark/90">
        <Medal className="h-5 w-5" strokeWidth={1.5} />
        {position}º
      </span>
    );
  }

  return (
    <span className="font-mono text-sm font-semibold text-content-secondary dark:text-content-dark-secondary">
      {position}º
    </span>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function RankingTable({ entries }: RankingTableProps) {
  if (entries.length === 0) {
    return (
      <Card hoverLift={false}>
        <CardContent className="py-12 text-center text-content-secondary dark:text-content-dark-secondary">
          Ainda não há tentativas registadas para estes filtros.
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-white dark:border-border-dark dark:bg-surface-dark-card md:block">
        <table className="min-w-full divide-y divide-border dark:divide-border-dark">
          <thead className="bg-surface-secondary dark:bg-surface-dark-secondary">
            <tr>
              {["Posição", "Utilizador", "Província", "Pontuação", "Acertos", "Tentativas", "Tempo"].map(
                (heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-content-secondary dark:text-content-dark-secondary"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border dark:divide-border-dark">
            {entries.map((entry) => (
              <tr
                key={`${entry.user.id}-${entry.position}`}
                className={cn(
                  entry.position <= 3 &&
                    "bg-gold/5 dark:bg-gold-dark/5",
                )}
              >
                <td className="px-4 py-4">
                  <PositionBadge position={entry.position} />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bordeaux/10 font-display text-sm font-bold text-bordeaux dark:bg-bordeaux-dark/10 dark:text-bordeaux-dark">
                      {getInitials(entry.user.name)}
                    </span>
                    <span className="font-semibold text-content-primary dark:text-content-dark-primary">
                      {entry.user.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-content-secondary dark:text-content-dark-secondary">
                  {entry.user.province?.name ?? "—"}
                </td>
                <td className="px-4 py-4 font-display text-lg font-bold text-content-primary dark:text-content-dark-primary">
                  {entry.best_score}%
                </td>
                <td className="px-4 py-4 text-sm text-content-secondary dark:text-content-dark-secondary">
                  {entry.correct_answers}/{entry.total_questions}
                </td>
                <td className="px-4 py-4 text-sm text-content-secondary dark:text-content-dark-secondary">
                  {entry.attempts_count}
                </td>
                <td className="px-4 py-4 font-mono text-sm text-content-secondary dark:text-content-dark-secondary">
                  {formatRankingTime(entry.time_spent_seconds)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {entries.map((entry) => (
          <Card
            key={`${entry.user.id}-${entry.position}-mobile`}
            hoverLift={false}
            className={cn(
              entry.position <= 3 &&
                "border-gold/30 bg-gold/5 dark:border-gold-dark/30 dark:bg-gold-dark/5",
            )}
          >
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bordeaux/10 font-display text-sm font-bold text-bordeaux dark:bg-bordeaux-dark/10 dark:text-bordeaux-dark">
                    {getInitials(entry.user.name)}
                  </span>
                  <div>
                    <p className="font-semibold text-content-primary dark:text-content-dark-primary">
                      {entry.user.name}
                    </p>
                    <p className="text-sm text-content-secondary dark:text-content-dark-secondary">
                      {entry.user.province?.name ?? "Sem província"}
                    </p>
                  </div>
                </div>
                <PositionBadge position={entry.position} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                    Pontuação
                  </p>
                  <p className="font-display text-xl font-bold text-content-primary dark:text-content-dark-primary">
                    {entry.best_score}%
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                    Acertos
                  </p>
                  <p className="font-semibold text-content-primary dark:text-content-dark-primary">
                    {entry.correct_answers}/{entry.total_questions}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                    Tentativas
                  </p>
                  <p className="font-semibold text-content-primary dark:text-content-dark-primary">
                    {entry.attempts_count}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-content-tertiary dark:text-content-dark-tertiary">
                    Tempo
                  </p>
                  <p className="font-mono font-semibold text-content-primary dark:text-content-dark-primary">
                    {formatRankingTime(entry.time_spent_seconds)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
