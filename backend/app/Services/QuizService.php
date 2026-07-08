<?php

namespace App\Services;

use App\Models\Quiz;
use Illuminate\Support\Facades\DB;

class QuizService
{
    /**
     * @param  list<array{
     *     question_text: string,
     *     explanation?: string|null,
     *     order?: int,
     *     answers: list<array{
     *         answer_text: string,
     *         is_correct: bool,
     *         order?: int
     *     }>
     * }>  $questionsData
     */
    public function syncQuestions(Quiz $quiz, array $questionsData): void
    {
        DB::transaction(function () use ($quiz, $questionsData): void {
            $quiz->questions()->delete();

            foreach ($questionsData as $questionIndex => $questionData) {
                $question = $quiz->questions()->create([
                    'question_text' => $questionData['question_text'],
                    'explanation' => $questionData['explanation'] ?? null,
                    'order' => $questionData['order'] ?? $questionIndex,
                ]);

                foreach ($questionData['answers'] as $answerIndex => $answerData) {
                    $question->answers()->create([
                        'answer_text' => $answerData['answer_text'],
                        'is_correct' => (bool) ($answerData['is_correct'] ?? false),
                        'order' => $answerData['order'] ?? $answerIndex,
                    ]);
                }
            }
        });
    }
}
