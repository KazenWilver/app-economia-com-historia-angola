<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMapNarrativeRequest;
use App\Http\Requests\UpdateMapNarrativeRequest;
use App\Http\Resources\MapNarrativeResource;
use App\Http\Resources\ProvinceResource;
use App\Models\MapNarrative;
use App\Models\Province;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MapNarrativeController extends Controller
{
    public function provincesGeoJson(): JsonResponse
    {
        $provinces = Province::query()
            ->withCount('narratives')
            ->orderBy('name')
            ->get();

        $features = $provinces
            ->map(fn (Province $province): ?array => $this->provinceToGeoJsonFeature($province))
            ->filter()
            ->values();

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features,
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function provinceToGeoJsonFeature(Province $province): ?array
    {
        $geometry = $this->resolveProvinceGeometry($province);

        if ($geometry === null) {
            return null;
        }

        return [
            'type' => 'Feature',
            'properties' => [
                'id' => $province->id,
                'name' => $province->name,
                'code' => $province->code,
                'capital' => $province->capital,
                'narratives_count' => (int) ($province->narratives_count ?? 0),
            ],
            'geometry' => $geometry,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function resolveProvinceGeometry(Province $province): ?array
    {
        if ($province->geojson_data) {
            $decoded = json_decode($province->geojson_data, true);

            if (is_array($decoded) && isset($decoded['type'])) {
                return $decoded;
            }
        }

        if ($province->latitude === null || $province->longitude === null) {
            return null;
        }

        return [
            'type' => 'Point',
            'coordinates' => [
                (float) $province->longitude,
                (float) $province->latitude,
            ],
        ];
    }

    public function provincesIndex(): AnonymousResourceCollection
    {
        $provinces = Province::query()
            ->withCount('narratives')
            ->orderBy('name')
            ->get();

        return ProvinceResource::collection($provinces);
    }

    public function provinceShow(Province $province): ProvinceResource
    {
        $province->load([
            'narratives' => fn ($query) => $query->orderBy('display_order'),
        ]);

        return new ProvinceResource($province);
    }

    public function adminIndex(): AnonymousResourceCollection
    {
        $narratives = MapNarrative::query()
            ->with('province:id,name,code')
            ->orderBy('display_order')
            ->orderBy('title')
            ->get();

        return MapNarrativeResource::collection($narratives);
    }

    public function adminShow(MapNarrative $mapNarrative): MapNarrativeResource
    {
        $mapNarrative->load('province');

        return new MapNarrativeResource($mapNarrative);
    }

    public function store(StoreMapNarrativeRequest $request): JsonResponse
    {
        $data = $request->validated();

        $narrative = MapNarrative::query()->create([
            ...$data,
            'display_order' => $data['display_order'] ?? 0,
        ]);

        $narrative->load('province');

        return response()->json([
            'message' => 'Narrativa criada com sucesso.',
            'narrative' => new MapNarrativeResource($narrative),
        ], 201);
    }

    public function update(
        UpdateMapNarrativeRequest $request,
        MapNarrative $mapNarrative
    ): JsonResponse {
        $mapNarrative->update($request->validated());
        $mapNarrative->load('province');

        return response()->json([
            'message' => 'Narrativa actualizada com sucesso.',
            'narrative' => new MapNarrativeResource($mapNarrative),
        ]);
    }

    public function destroy(MapNarrative $mapNarrative): JsonResponse
    {
        $mapNarrative->delete();

        return response()->json([
            'message' => 'Narrativa eliminada com sucesso.',
        ]);
    }
}
