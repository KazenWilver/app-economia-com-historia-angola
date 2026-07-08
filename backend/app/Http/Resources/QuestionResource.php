<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuestionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question_text' => $this->question_text,
            'explanation' => $this->when(
                $request->user('sanctum')?->role === 'admin',
                $this->explanation
            ),
            'order' => $this->order,
            'answers' => AnswerResource::collection($this->whenLoaded('answers')),
        ];
    }
}
