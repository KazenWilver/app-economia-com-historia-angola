<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LearningPathStepResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $completedIds = $this->additional['completed_step_ids'] ?? [];

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'step_type' => $this->step_type,
            'reference_id' => $this->reference_id,
            'href' => $this->resolveHref(),
            'order' => $this->order,
            'is_completed' => in_array($this->id, $completedIds, true),
        ];
    }

    private function resolveHref(): string
    {
        if (is_string($this->href) && $this->href !== '') {
            return $this->href;
        }

        $contentSlugs = $this->additional['content_slugs'] ?? [];
        $slug = is_array($contentSlugs) && $this->reference_id !== null
            ? ($contentSlugs[$this->reference_id] ?? null)
            : null;

        return match ($this->step_type) {
            'content' => $slug
                ? "/explorar/{$slug}"
                : ($this->reference_id ? "/explorar/{$this->reference_id}" : '/explorar'),
            'quiz' => $this->reference_id ? "/quiz/{$this->reference_id}" : '/quiz',
            'map' => '/mapa',
            'forum' => '/forum',
            default => '/trilho',
        };
    }
}
