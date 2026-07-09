<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'quiz_id' => $this->quiz_id,
            'score' => $this->score,
            'total_questions' => $this->total_questions,
            'correct_answers' => $this->correct_answers,
            'time_spent_seconds' => $this->time_spent_seconds,
            'completed_at' => $this->completed_at,
            'answers' => QuizAttemptAnswerResource::collection($this->whenLoaded('answers')),
            'created_at' => $this->created_at,
        ];
    }
}
