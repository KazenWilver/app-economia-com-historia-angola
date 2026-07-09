<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RankingEntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'position' => $this->resource['position'],
            'best_score' => $this->resource['best_score'],
            'correct_answers' => $this->resource['correct_answers'],
            'total_questions' => $this->resource['total_questions'],
            'attempts_count' => $this->resource['attempts_count'],
            'time_spent_seconds' => $this->resource['time_spent_seconds'],
            'completed_at' => $this->resource['completed_at'],
            'user' => [
                'id' => $this->resource['user_id'],
                'name' => $this->resource['user_name'],
                'avatar_url' => $this->resource['avatar_url'],
                'province' => $this->resource['province'],
            ],
        ];
    }
}
