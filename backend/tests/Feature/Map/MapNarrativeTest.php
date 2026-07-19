<?php

namespace Tests\Feature\Map;

use App\Models\MapNarrative;
use App\Models\Province;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MapNarrativeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
    }

    private function createProvince(): Province
    {
        return Province::query()->create([
            'name' => 'Luanda',
            'code' => 'LUA',
            'capital' => 'Luanda',
            'latitude' => -8.8368,
            'longitude' => 13.2343,
        ]);
    }

    public function test_guest_can_list_provinces(): void
    {
        $province = $this->createProvince();

        $response = $this->getJson('/api/provinces');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $province->id)
            ->assertJsonPath('data.0.code', 'LUA');
    }

    public function test_guest_can_fetch_provinces_geojson(): void
    {
        $province = $this->createProvince();

        $response = $this->getJson('/api/provinces/geojson');

        $response->assertOk()
            ->assertJsonPath('type', 'FeatureCollection')
            ->assertJsonCount(1, 'features')
            ->assertJsonPath('features.0.properties.id', $province->id)
            ->assertJsonPath('features.0.properties.name', 'Luanda')
            ->assertJsonPath('features.0.geometry.type', 'Point')
            ->assertJsonPath('features.0.geometry.coordinates.0', 13.2343)
            ->assertJsonPath('features.0.geometry.coordinates.1', -8.8368);

        $cacheControl = (string) $response->headers->get('Cache-Control');
        $this->assertStringContainsString('public', $cacheControl);
        $this->assertStringContainsString('max-age=300', $cacheControl);
        $this->assertStringContainsString('stale-while-revalidate=3600', $cacheControl);
    }

    public function test_provinces_geojson_is_cached_between_requests(): void
    {
        $this->createProvince();

        $this->getJson('/api/provinces/geojson')
            ->assertOk()
            ->assertJsonCount(1, 'features');

        Province::query()->create([
            'name' => 'Benguela',
            'code' => 'BGU',
            'capital' => 'Benguela',
            'latitude' => -12.5763,
            'longitude' => 13.4055,
        ]);

        // Sem invalidação, a resposta continua a vir da cache (1 feature).
        $this->getJson('/api/provinces/geojson')
            ->assertOk()
            ->assertJsonCount(1, 'features');
    }

    public function test_creating_narrative_busts_provinces_geojson_cache(): void
    {
        $province = $this->createProvince();
        $admin = User::factory()->admin()->create();

        $this->getJson('/api/provinces/geojson')
            ->assertOk()
            ->assertJsonPath('features.0.properties.narratives_count', 0);

        Sanctum::actingAs($admin);

        $this->postJson('/api/map-narratives', [
            'province_id' => $province->id,
            'title' => 'Luanda colonial',
            'narrative_text' => 'História económica de Luanda.',
            'period' => 'colonial',
            'display_order' => 1,
        ])->assertCreated();

        $this->getJson('/api/provinces/geojson')
            ->assertOk()
            ->assertJsonPath('features.0.properties.narratives_count', 1);
    }

    public function test_geojson_prefers_polygon_over_point_when_available(): void
    {
        $polygon = [
            'type' => 'Polygon',
            'coordinates' => [
                [
                    [13.1, -8.9],
                    [13.4, -8.9],
                    [13.4, -8.7],
                    [13.1, -8.7],
                    [13.1, -8.9],
                ],
            ],
        ];

        $province = Province::query()->create([
            'name' => 'Luanda',
            'code' => 'LUA',
            'capital' => 'Luanda',
            'latitude' => -8.8368,
            'longitude' => 13.2343,
            'geojson_data' => json_encode($polygon, JSON_THROW_ON_ERROR),
        ]);

        $response = $this->getJson('/api/provinces/geojson');

        $response->assertOk()
            ->assertJsonPath('features.0.properties.id', $province->id)
            ->assertJsonPath('features.0.geometry.type', 'Polygon');
    }

    public function test_guest_can_view_province_with_narratives(): void
    {
        $province = $this->createProvince();

        MapNarrative::query()->create([
            'province_id' => $province->id,
            'title' => 'Luanda colonial',
            'narrative_text' => 'História económica de Luanda.',
            'period' => 'colonial',
            'display_order' => 1,
        ]);

        $response = $this->getJson("/api/provinces/{$province->id}");

        $response->assertOk()
            ->assertJsonPath('data.name', 'Luanda')
            ->assertJsonCount(1, 'data.narratives')
            ->assertJsonPath('data.narratives.0.title', 'Luanda colonial');
    }

    public function test_admin_can_list_map_narratives(): void
    {
        $admin = User::factory()->admin()->create();
        $province = $this->createProvince();

        MapNarrative::query()->create([
            'province_id' => $province->id,
            'title' => 'Luanda colonial',
            'narrative_text' => 'História económica de Luanda.',
            'period' => 'Séc. XVI',
            'display_order' => 1,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/map-narratives');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Luanda colonial');
    }

    public function test_admin_can_create_map_narrative(): void
    {
        $admin = User::factory()->admin()->create();
        $province = $this->createProvince();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/map-narratives', [
            'province_id' => $province->id,
            'title' => 'Benguela e o comércio',
            'narrative_text' => 'Narrativa sobre Benguela.',
            'period' => 'Séc. XIX',
            'display_order' => 2,
        ]);

        $response->assertCreated()
            ->assertJsonPath('narrative.title', 'Benguela e o comércio');

        $this->assertDatabaseHas('map_narratives', [
            'title' => 'Benguela e o comércio',
            'province_id' => $province->id,
        ]);
    }

    public function test_admin_can_update_map_narrative(): void
    {
        $admin = User::factory()->admin()->create();
        $province = $this->createProvince();
        Sanctum::actingAs($admin);

        $narrative = MapNarrative::query()->create([
            'province_id' => $province->id,
            'title' => 'Título antigo',
            'narrative_text' => 'Texto antigo.',
        ]);

        $response = $this->putJson("/api/map-narratives/{$narrative->id}", [
            'title' => 'Título actualizado',
        ]);

        $response->assertOk()
            ->assertJsonPath('narrative.title', 'Título actualizado');
    }

    public function test_admin_can_delete_map_narrative(): void
    {
        $admin = User::factory()->admin()->create();
        $province = $this->createProvince();
        Sanctum::actingAs($admin);

        $narrative = MapNarrative::query()->create([
            'province_id' => $province->id,
            'title' => 'A eliminar',
            'narrative_text' => 'Texto.',
        ]);

        $response = $this->deleteJson("/api/map-narratives/{$narrative->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('map_narratives', ['id' => $narrative->id]);
    }

    public function test_non_admin_cannot_create_map_narrative(): void
    {
        $user = User::factory()->create();
        $province = $this->createProvince();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/map-narratives', [
            'province_id' => $province->id,
            'title' => 'Tentativa',
            'narrative_text' => 'Texto.',
        ]);

        $response->assertForbidden();
    }

    public function test_cannot_create_duplicate_display_order_for_same_province(): void
    {
        $admin = User::factory()->admin()->create();
        $province = $this->createProvince();
        Sanctum::actingAs($admin);

        MapNarrative::query()->create([
            'province_id' => $province->id,
            'title' => 'Primeira',
            'narrative_text' => 'Texto um.',
            'display_order' => 2,
        ]);

        $response = $this->postJson('/api/map-narratives', [
            'province_id' => $province->id,
            'title' => 'Segunda',
            'narrative_text' => 'Texto dois.',
            'display_order' => 2,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['display_order']);
    }
}
