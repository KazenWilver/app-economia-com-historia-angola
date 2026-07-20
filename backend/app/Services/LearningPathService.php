<?php

namespace App\Services;

use App\Models\Content;
use App\Models\LearningPath;
use App\Models\LearningPathStep;
use App\Models\LearningStepCompletion;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Support\Collection;

class LearningPathService
{
    public function activePath(): ?LearningPath
    {
        return LearningPath::query()
            ->where('is_active', true)
            ->with(['steps' => fn ($query) => $query->orderBy('order')])
            ->first();
    }

    /**
     * @return array{
     *     path: LearningPath|null,
     *     completed_count: int,
     *     total_count: int,
     *     percent: int,
     *     completed_step_ids: list<int>
     * }
     */
    public function progressFor(?User $user): array
    {
        $path = $this->activePath();

        if ($path === null) {
            return [
                'path' => null,
                'completed_count' => 0,
                'total_count' => 0,
                'percent' => 0,
                'completed_step_ids' => [],
            ];
        }

        if ($user !== null) {
            $this->syncAutomaticCompletions($user, $path);
        }

        $total = $path->steps->count();
        $completedIds = [];

        if ($user !== null && $total > 0) {
            $completedIds = LearningStepCompletion::query()
                ->where('user_id', $user->id)
                ->whereIn('learning_path_step_id', $path->steps->pluck('id'))
                ->pluck('learning_path_step_id')
                ->map(fn ($id): int => (int) $id)
                ->values()
                ->all();
        }

        $completedCount = count($completedIds);
        $percent = $total > 0 ? (int) round(($completedCount / $total) * 100) : 0;

        return [
            'path' => $path,
            'completed_count' => $completedCount,
            'total_count' => $total,
            'percent' => $percent,
            'completed_step_ids' => $completedIds,
        ];
    }

    public function completeStep(User $user, LearningPathStep $step): LearningStepCompletion
    {
        return LearningStepCompletion::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'learning_path_step_id' => $step->id,
            ],
            [
                'completed_at' => now(),
            ]
        );
    }

    public function completeContentSteps(User $user, Content $content): void
    {
        $steps = LearningPathStep::query()
            ->where('step_type', 'content')
            ->where('reference_id', $content->id)
            ->get();

        foreach ($steps as $step) {
            $this->completeStep($user, $step);
        }
    }

    public function completeQuizSteps(User $user, int $quizId): void
    {
        $steps = LearningPathStep::query()
            ->where('step_type', 'quiz')
            ->where('reference_id', $quizId)
            ->get();

        foreach ($steps as $step) {
            $this->completeStep($user, $step);
        }
    }

    public function syncAutomaticCompletions(User $user, LearningPath $path): void
    {
        $quizIds = $path->steps
            ->where('step_type', 'quiz')
            ->pluck('reference_id')
            ->filter()
            ->values();

        if ($quizIds->isEmpty()) {
            return;
        }

        /** @var Collection<int, int> $attemptedQuizIds */
        $attemptedQuizIds = QuizAttempt::query()
            ->where('user_id', $user->id)
            ->whereIn('quiz_id', $quizIds)
            ->pluck('quiz_id')
            ->unique()
            ->values();

        foreach ($path->steps as $step) {
            if ($step->step_type !== 'quiz' || $step->reference_id === null) {
                continue;
            }

            if ($attemptedQuizIds->contains($step->reference_id)) {
                $this->completeStep($user, $step);
            }
        }
    }
}
