<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecommendationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reason' => $this->reason,
            'is_read' => $this->is_read,
            'quiz_attempt_id' => $this->quiz_attempt_id,
            'content' => new ContentListResource($this->whenLoaded('content')),
            'created_at' => $this->created_at,
        ];
    }
}
