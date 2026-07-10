<?php

namespace Tests\Feature\Map;

use App\Models\Province;
use Database\Seeders\ProvinceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProvinceSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_province_seeder_creates_twenty_one_provinces(): void
    {
        $this->seed(ProvinceSeeder::class);

        $this->assertDatabaseCount('provinces', 21);
        $this->assertDatabaseHas('provinces', [
            'name' => 'Cubango',
            'code' => 'CUB',
            'capital' => 'Menongue',
        ]);
        $this->assertDatabaseHas('provinces', [
            'name' => 'Ícolo e Bengo',
            'code' => 'ICB',
            'capital' => 'Catete',
        ]);
        $this->assertDatabaseHas('provinces', [
            'name' => 'Moxico Leste',
            'code' => 'MLX',
            'capital' => 'Cazombo',
        ]);
        $this->assertDatabaseHas('provinces', [
            'name' => 'Cuando',
            'code' => 'CUA',
            'capital' => 'Mavinga',
        ]);
        $this->assertDatabaseMissing('provinces', ['code' => 'CCU']);

        $luanda = Province::query()->where('code', 'LUA')->first();
        $this->assertNotNull($luanda);
        $this->assertNotNull($luanda->geojson_data);

        $geometry = json_decode((string) $luanda->geojson_data, true);
        $this->assertIsArray($geometry);
        $this->assertContains($geometry['type'] ?? null, ['Polygon', 'MultiPolygon']);

        $this->assertDatabaseCount('map_narratives', 42);
        $this->assertDatabaseHas('map_narratives', [
            'title' => 'Cabinda: Simulambuco e identidade Bakongo',
        ]);
        $this->assertDatabaseHas('map_narratives', [
            'title' => 'Ícolo e Bengo: Catete e berço de Agostinho Neto',
        ]);
        $this->assertDatabaseHas('map_narratives', [
            'title' => 'Cuando: Lei 14/24 e Terras do Fim do Mundo',
        ]);
    }
}
