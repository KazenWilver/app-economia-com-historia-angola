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
use Illuminate\Support\Facades\Cache;

class MapNarrativeController extends Controller
{
    private const GEOJSON_CACHE_TTL_SECONDS = 86400;

    private const GEOJSON_VERSION_KEY = 'provinces:geojson:version';

    public function provincesGeoJson(): JsonResponse
    {
        $version = (int) Cache::get(self::GEOJSON_VERSION_KEY, 1);
        $cacheKey = "provinces:geojson:v{$version}";

        /** @var array{type: string, features: list<array<string, mixed>>} $payload */
        $payload = Cache::remember(
            $cacheKey,
            self::GEOJSON_CACHE_TTL_SECONDS,
            fn (): array => $this->buildProvincesGeoJson(),
        );

        return response()->json($payload, 200, [
            'Cache-Control' => 'public, max-age=300, stale-while-revalidate=3600',
        ]);
    }

    /**
     * @return array{type: string, features: list<array<string, mixed>>}
     */
    private function buildProvincesGeoJson(): array
    {
        $provinces = Province::query()
            ->withCount('narratives')
            ->orderBy('name')
            ->get();

        $features = $provinces
            ->map(fn (Province $province): ?array => $this->provinceToGeoJsonFeature($province))
            ->filter()
            ->values()
            ->all();

        return [
            'type' => 'FeatureCollection',
            'features' => $features,
        ];
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
            'narratives' => fn ($query) => $query
                ->orderBy('display_order')
                ->orderBy('id'),
        ]);

        return new ProvinceResource($province);
    }

    public function adminIndex(): AnonymousResourceCollection
    {
        $narratives = MapNarrative::query()
            ->with('province:id,name,code')
            ->orderBy('display_order')
            ->orderBy('id')
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
        $this->bustProvincesGeoJsonCache();

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
        $this->bustProvincesGeoJsonCache();

        return response()->json([
            'message' => 'Narrativa actualizada com sucesso.',
            'narrative' => new MapNarrativeResource($mapNarrative),
        ]);
    }

    public function destroy(MapNarrative $mapNarrative): JsonResponse
    {
        $mapNarrative->delete();
        $this->bustProvincesGeoJsonCache();

        return response()->json([
            'message' => 'Narrativa eliminada com sucesso.',
        ]);
    }

    private function bustProvincesGeoJsonCache(): void
    {
        $version = (int) Cache::get(self::GEOJSON_VERSION_KEY, 1);
        Cache::forever(self::GEOJSON_VERSION_KEY, $version + 1);
    }
}
