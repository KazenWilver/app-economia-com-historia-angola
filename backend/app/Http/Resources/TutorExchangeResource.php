<?php

namespace App\Http\Resources;

use App\Models\TutorExchange;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin TutorExchange
 */
class TutorExchangeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question' => $this->question,
            'answer' => $this->answer,
            'sources' => $this->sources ?? [],
            'provider' => $this->provider,
            'content_id' => $this->content_id,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
