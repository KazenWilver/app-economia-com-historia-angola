<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProvinceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'capital' => $this->capital,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'narratives_count' => $this->whenCounted('narratives'),
            'narratives' => MapNarrativeResource::collection($this->whenLoaded('narratives')),
            'created_at' => $this->created_at,
        ];
    }
}
