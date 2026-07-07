<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'body' => $this->body,
            'type' => $this->type,
            'media_url' => $this->media_url,
            'statistics_data' => $this->statistics_data,
            'is_exclusive' => $this->is_exclusive,
            'status' => $this->status,
            'view_count' => $this->view_count,
            'published_at' => $this->published_at,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'author' => new UserResource($this->whenLoaded('author')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
