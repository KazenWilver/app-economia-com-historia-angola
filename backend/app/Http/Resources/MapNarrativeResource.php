<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MapNarrativeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'province_id' => $this->province_id,
            'title' => $this->title,
            'narrative_text' => $this->narrative_text,
            'period' => $this->period,
            'display_order' => $this->display_order,
            'province' => new ProvinceResource($this->whenLoaded('province')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
