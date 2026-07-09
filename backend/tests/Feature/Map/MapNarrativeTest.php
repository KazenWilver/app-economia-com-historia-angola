<?php

namespace Tests\Feature\Map;

use App\Models\MapNarrative;
use App\Models\Province;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MapNarrativeTest extends TestCase
{
    use RefreshDatabase;

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
}
