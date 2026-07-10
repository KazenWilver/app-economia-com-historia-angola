<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class ProvinceSeeder extends Seeder
{
    /**
     * 21 províncias conforme a Lei n.º 14/24 (Divisão Político-Administrativa).
     */
    public function run(): void
    {
        $geojsonByCode = $this->loadProvinceGeometries();

        $provinces = [
            ['name' => 'Bengo', 'code' => 'BGO', 'capital' => 'Dande', 'latitude' => -8.4494, 'longitude' => 13.7422],
            ['name' => 'Benguela', 'code' => 'BGU', 'capital' => 'Benguela', 'latitude' => -12.5763, 'longitude' => 13.4055],
            ['name' => 'Bié', 'code' => 'BIE', 'capital' => 'Cuito', 'latitude' => -12.3833, 'longitude' => 16.9333],
            ['name' => 'Cabinda', 'code' => 'CAB', 'capital' => 'Cabinda', 'latitude' => -5.5600, 'longitude' => 12.1900],
            ['name' => 'Cubango', 'code' => 'CUB', 'capital' => 'Menongue', 'latitude' => -14.6586, 'longitude' => 17.6903],
            ['name' => 'Cuando', 'code' => 'CUA', 'capital' => 'Mavinga', 'latitude' => -15.8333, 'longitude' => 20.3500],
            ['name' => 'Cuanza Norte', 'code' => 'CNO', 'capital' => 'Cazengo', 'latitude' => -9.2978, 'longitude' => 14.9119],
            ['name' => 'Cuanza Sul', 'code' => 'CSU', 'capital' => 'Sumbe', 'latitude' => -11.2061, 'longitude' => 13.8437],
            ['name' => 'Cunene', 'code' => 'CNN', 'capital' => 'Cuanhama', 'latitude' => -17.0667, 'longitude' => 15.7333],
            ['name' => 'Huambo', 'code' => 'HUA', 'capital' => 'Huambo', 'latitude' => -12.7761, 'longitude' => 15.7392],
            ['name' => 'Huíla', 'code' => 'HUI', 'capital' => 'Lubango', 'latitude' => -14.9177, 'longitude' => 13.4925],
            ['name' => 'Ícolo e Bengo', 'code' => 'ICB', 'capital' => 'Catete', 'latitude' => -9.6833, 'longitude' => 13.4031],
            ['name' => 'Luanda', 'code' => 'LUA', 'capital' => 'Ingombota', 'latitude' => -8.8130, 'longitude' => 13.2340],
            ['name' => 'Lunda Norte', 'code' => 'LNO', 'capital' => 'Dundo', 'latitude' => -7.3667, 'longitude' => 20.8333],
            ['name' => 'Lunda Sul', 'code' => 'LSU', 'capital' => 'Saurimo', 'latitude' => -9.6608, 'longitude' => 20.3916],
            ['name' => 'Malanje', 'code' => 'MAL', 'capital' => 'Malanje', 'latitude' => -9.5402, 'longitude' => 16.3410],
            ['name' => 'Moxico', 'code' => 'MOX', 'capital' => 'Luena', 'latitude' => -11.7833, 'longitude' => 19.9167],
            ['name' => 'Moxico Leste', 'code' => 'MLX', 'capital' => 'Cazombo', 'latitude' => -11.0667, 'longitude' => 22.8833],
            ['name' => 'Namibe', 'code' => 'NAM', 'capital' => 'Moçâmedes', 'latitude' => -15.1961, 'longitude' => 12.1522],
            ['name' => 'Uíge', 'code' => 'UIG', 'capital' => 'Uíge', 'latitude' => -7.6167, 'longitude' => 15.0500],
            ['name' => 'Zaire', 'code' => 'ZAI', 'capital' => "M'banza-Kongo", 'latitude' => -6.2670, 'longitude' => 14.2400],
        ];

        $now = now();

        foreach ($provinces as $province) {
            $geometry = $geojsonByCode[$province['code']] ?? null;

            DB::table('provinces')->updateOrInsert(
                ['code' => $province['code']],
                [
                    'name' => $province['name'],
                    'capital' => $province['capital'],
                    'latitude' => $province['latitude'],
                    'longitude' => $province['longitude'],
                    'geojson_data' => $geometry ? json_encode($geometry, JSON_UNESCAPED_UNICODE) : null,
                    'created_at' => $now,
                ]
            );
        }

        DB::table('provinces')->where('code', 'CCU')->delete();

        $cabindaId = DB::table('provinces')->where('code', 'CAB')->value('id');

        if ($cabindaId) {
            DB::table('map_narratives')->updateOrInsert(
                [
                    'province_id' => $cabindaId,
                    'title' => 'Cabinda: Enclave e Identidade Histórica',
                ],
                [
                    'narrative_text' => 'A província de Cabinda, enclave ao norte do rio Congo, tem uma história '
                        .'marcada pelo Tratado de Simulambuco (1885) e pelo contexto internacional do Tratado de Berlim, '
                        .'que consolidou a partilha colonial de África. A identidade cabindense afirmou-se ao longo do '
                        .'século XX, culminando no movimento de 28 de Maio de 1956, data simbólica da reivindicação '
                        .'política e cultural do povo cabindense no quadro da descolonização e das transformações '
                        .'económicas ligadas ao petróleo na região.',
                    'period' => 'colonial',
                    'display_order' => 1,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function loadProvinceGeometries(): array
    {
        $path = database_path('data/angola-provinces.geojson');

        if (! File::exists($path)) {
            return [];
        }

        $decoded = json_decode(File::get($path), true);

        if (! is_array($decoded) || ! isset($decoded['features']) || ! is_array($decoded['features'])) {
            return [];
        }

        $geometries = [];

        foreach ($decoded['features'] as $feature) {
            if (! is_array($feature)) {
                continue;
            }

            $code = $feature['properties']['code'] ?? null;
            $geometry = $feature['geometry'] ?? null;

            if (! is_string($code) || ! is_array($geometry) || ! isset($geometry['type'])) {
                continue;
            }

            $geometries[$code] = $geometry;
        }

        return $geometries;
    }
}
