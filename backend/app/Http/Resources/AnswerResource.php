<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnswerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isAdmin = $request->user('sanctum')?->role === 'admin';

        return [
            'id' => $this->id,
            'answer_text' => $this->answer_text,
            'is_correct' => $this->when($isAdmin, $this->is_correct),
            'order' => $this->order,
        ];
    }
}
