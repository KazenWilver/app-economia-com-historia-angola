<?php

namespace App\Services;

use App\Models\QuizAttempt;
use Illuminate\Support\Collection;

class RankingService
{
    /**
     * @return Collection<int, array{
     *     position: int,
     *     user_id: int,
     *     user_name: string,
     *     avatar_url: string|null,
     *     province: array{id: int, name: string, code: string}|null,
     *     best_score: int,
     *     correct_answers: int,
     *     total_questions: int,
     *     attempts_count: int,
     *     time_spent_seconds: int|null,
     *     completed_at: string|null
     * }>
     */
    public function getRankings(?int $quizId = null, ?int $provinceId = null): Collection
    {
        $attempts = QuizAttempt::query()
            ->with(['user.province'])
            ->whereNotNull('completed_at')
            ->whereHas('user', function ($query): void {
                $query
                    ->where('role', 'user')
                    ->where('is_active', true);
            })
            ->when($quizId !== null, fn ($query) => $query->where('quiz_id', $quizId))
            ->when(
                $provinceId !== null,
                fn ($query) => $query->whereHas(
                    'user',
                    fn ($userQuery) => $userQuery->where('province_id', $provinceId)
                )
            )
            ->get();

        $entries = $attempts
            ->groupBy('user_id')
            ->map(function (Collection $userAttempts): array {
                return [
                    'best' => $this->pickBestAttempt($userAttempts),
                    'attempts_count' => $userAttempts->count(),
                ];
            })
            ->values()
            ->sort(function (array $left, array $right): int {
                return $this->compareAttempts($left['best'], $right['best']);
            })
            ->values();

        return $this->assignPositions($entries);
    }

    /**
     * @param  Collection<int, QuizAttempt>  $attempts
     */
    private function pickBestAttempt(Collection $attempts): QuizAttempt
    {
        return $attempts
            ->sort(fn (QuizAttempt $left, QuizAttempt $right) => $this->compareAttempts($left, $right))
            ->first();
    }

    private function compareAttempts(QuizAttempt $left, QuizAttempt $right): int
    {
        if ($left->score !== $right->score) {
            return $right->score <=> $left->score;
        }

        if ($left->correct_answers !== $right->correct_answers) {
            return $right->correct_answers <=> $left->correct_answers;
        }

        $leftTime = $left->time_spent_seconds ?? PHP_INT_MAX;
        $rightTime = $right->time_spent_seconds ?? PHP_INT_MAX;

        if ($leftTime !== $rightTime) {
            return $leftTime <=> $rightTime;
        }

        return ($left->completed_at?->timestamp ?? PHP_INT_MAX)
            <=> ($right->completed_at?->timestamp ?? PHP_INT_MAX);
    }

    /**
     * @param  Collection<int, array{best: QuizAttempt, attempts_count: int}>  $entries
     * @return Collection<int, array<string, mixed>>
     */
    private function assignPositions(Collection $entries): Collection
    {
        $rankings = collect();
        $position = 0;
        $index = 0;
        $previousKey = null;

        foreach ($entries as $entry) {
            $index++;
            $attempt = $entry['best'];
            $rankKey = implode(':', [
                $attempt->score,
                $attempt->correct_answers,
                $attempt->time_spent_seconds ?? 'null',
            ]);

            if ($rankKey !== $previousKey) {
                $position = $index;
                $previousKey = $rankKey;
            }

            $user = $attempt->user;

            $rankings->push([
                'position' => $position,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'avatar_url' => $user->avatar_url,
                'province' => $user->province
                    ? [
                        'id' => $user->province->id,
                        'name' => $user->province->name,
                        'code' => $user->province->code,
                    ]
                    : null,
                'best_score' => $attempt->score,
                'correct_answers' => $attempt->correct_answers,
                'total_questions' => $attempt->total_questions,
                'attempts_count' => $entry['attempts_count'],
                'time_spent_seconds' => $attempt->time_spent_seconds,
                'completed_at' => $attempt->completed_at?->toIso8601String(),
            ]);
        }

        return $rankings;
    }
}
