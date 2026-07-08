<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ContentListResource extends JsonResource
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
            'excerpt' => $this->body
                ? Str::limit(trim(strip_tags($this->body)), 160)
                : null,
            'type' => $this->type,
            'media_url' => $this->media_url,
            'is_exclusive' => $this->is_exclusive,
            'published_at' => $this->published_at,
            'category' => new CategoryResource($this->whenLoaded('category')),
        ];
    }
}
