<?php

namespace App\Services;

use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\QuizAttemptAnswer;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class QuizScoringService
{
    /**
     * @param  list<array{question_id: int, selected_answer_id?: int|null}>  $answersPayload
     */
    public function submitAttempt(
        Quiz $quiz,
        User $user,
        array $answersPayload,
        ?int $timeSpentSeconds = null,
    ): QuizAttempt {
        $quiz->load([
            'questions' => fn ($query) => $query->orderBy('order'),
            'questions.answers' => fn ($query) => $query->orderBy('order'),
        ]);

        return DB::transaction(function () use ($quiz, $user, $answersPayload, $timeSpentSeconds): QuizAttempt {
            $answersByQuestion = collect($answersPayload)
                ->keyBy('question_id');

            $totalQuestions = $quiz->questions->count();
            $correctAnswers = 0;

            $attempt = QuizAttempt::query()->create([
                'user_id' => $user->id,
                'quiz_id' => $quiz->id,
                'score' => 0,
                'total_questions' => $totalQuestions,
                'correct_answers' => 0,
                'time_spent_seconds' => $timeSpentSeconds,
                'completed_at' => now(),
            ]);

            foreach ($quiz->questions as $question) {
                $selectedAnswerId = $answersByQuestion
                    ->get($question->id)['selected_answer_id'] ?? null;

                $selectedAnswer = $selectedAnswerId !== null
                    ? $question->answers->firstWhere('id', $selectedAnswerId)
                    : null;

                $isCorrect = $selectedAnswer !== null && $selectedAnswer->is_correct;

                if ($isCorrect) {
                    $correctAnswers++;
                }

                QuizAttemptAnswer::query()->create([
                    'attempt_id' => $attempt->id,
                    'question_id' => $question->id,
                    'selected_answer_id' => $selectedAnswer?->id,
                    'is_correct' => $isCorrect,
                ]);
            }

            $score = $totalQuestions > 0
                ? (int) round(($correctAnswers / $totalQuestions) * 100)
                : 0;

            $attempt->update([
                'score' => $score,
                'correct_answers' => $correctAnswers,
            ]);

            return $attempt->fresh([
                'answers.question.answers',
                'answers.selectedAnswer',
            ]);
        });
    }
}
