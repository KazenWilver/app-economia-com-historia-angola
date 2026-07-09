<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReplyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'topic_id' => $this->topic_id,
            'body' => $this->body,
            'parent_id' => $this->parent_id,
            'user' => new UserResource($this->whenLoaded('user')),
            'replies' => ReplyResource::collection(
                $this->relationLoaded('replies') ? $this->replies : collect()
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
