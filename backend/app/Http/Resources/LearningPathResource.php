<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LearningPathResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $completedIds = $this->additional['completed_step_ids'] ?? [];
        $contentSlugs = $this->additional['content_slugs'] ?? [];

        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'steps' => $this->steps->map(function ($step) use ($completedIds, $contentSlugs) {
                return (new LearningPathStepResource($step))->additional([
                    'completed_step_ids' => $completedIds,
                    'content_slugs' => $contentSlugs,
                ])->resolve();
            })->values(),
        ];
    }
}
