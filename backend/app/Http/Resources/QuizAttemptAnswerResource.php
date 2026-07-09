<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptAnswerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $question = $this->whenLoaded('question');
        $correctAnswer = $question?->answers?->firstWhere('is_correct', true);

        return [
            'question_id' => $this->question_id,
            'question_text' => $question?->question_text,
            'selected_answer_id' => $this->selected_answer_id,
            'selected_answer_text' => $this->relationLoaded('selectedAnswer')
                ? $this->selectedAnswer?->answer_text
                : null,
            'correct_answer_id' => $correctAnswer?->id,
            'correct_answer_text' => $correctAnswer?->answer_text,
            'is_correct' => $this->is_correct,
            'explanation' => $question?->explanation,
        ];
    }
}
