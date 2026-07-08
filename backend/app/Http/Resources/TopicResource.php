<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TopicResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'forum_id' => $this->forum_id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'description' => $this->description,
            'theme' => $this->theme,
            'is_private' => $this->is_private,
            'is_visible' => $this->is_visible,
            'replies_count' => $this->whenCounted('replies'),
            'forum' => new ForumResource($this->whenLoaded('forum')),
            'author' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
