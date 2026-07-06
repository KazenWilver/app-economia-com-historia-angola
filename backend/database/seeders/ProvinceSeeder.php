<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProvinceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $provinces = [
            ['name' => 'Bengo', 'code' => 'BGO', 'capital' => 'Caxito', 'latitude' => -8.5794, 'longitude' => 13.4042],
            ['name' => 'Benguela', 'code' => 'BGU', 'capital' => 'Benguela', 'latitude' => -12.5763, 'longitude' => 13.4055],
            ['name' => 'Bié', 'code' => 'BIE', 'capital' => 'Kuito', 'latitude' => -12.3833, 'longitude' => 16.9333],
            ['name' => 'Cabinda', 'code' => 'CAB', 'capital' => 'Cabinda', 'latitude' => -5.5600, 'longitude' => 12.1900],
            ['name' => 'Cuando Cubango', 'code' => 'CCU', 'capital' => 'Menongue', 'latitude' => -14.6586, 'longitude' => 17.6903],
            ['name' => 'Cuanza Norte', 'code' => 'CNO', 'capital' => 'Ndalatando', 'latitude' => -9.2978, 'longitude' => 14.9119],
            ['name' => 'Cuanza Sul', 'code' => 'CSU', 'capital' => 'Sumbe', 'latitude' => -11.2061, 'longitude' => 13.8437],
            ['name' => 'Cunene', 'code' => 'CNN', 'capital' => 'Ondjiva', 'latitude' => -17.0667, 'longitude' => 15.7333],
            ['name' => 'Huambo', 'code' => 'HUA', 'capital' => 'Huambo', 'latitude' => -12.7761, 'longitude' => 15.7392],
            ['name' => 'Huíla', 'code' => 'HUI', 'capital' => 'Lubango', 'latitude' => -14.9177, 'longitude' => 13.4925],
            ['name' => 'Luanda', 'code' => 'LUA', 'capital' => 'Luanda', 'latitude' => -8.8368, 'longitude' => 13.2343],
            ['name' => 'Lunda Norte', 'code' => 'LNO', 'capital' => 'Dundo', 'latitude' => -7.3667, 'longitude' => 20.8333],
            ['name' => 'Lunda Sul', 'code' => 'LSU', 'capital' => 'Saurimo', 'latitude' => -9.6608, 'longitude' => 20.3916],
            ['name' => 'Malanje', 'code' => 'MAL', 'capital' => 'Malanje', 'latitude' => -9.5402, 'longitude' => 16.3410],
            ['name' => 'Moxico', 'code' => 'MOX', 'capital' => 'Luena', 'latitude' => -11.7833, 'longitude' => 19.9167],
            ['name' => 'Namibe', 'code' => 'NAM', 'capital' => 'Namibe', 'latitude' => -15.1961, 'longitude' => 12.1522],
            ['name' => 'Uíge', 'code' => 'UIG', 'capital' => 'Uíge', 'latitude' => -7.6167, 'longitude' => 15.0500],
            ['name' => 'Zaire', 'code' => 'ZAI', 'capital' => "M'banza-Kongo", 'latitude' => -6.2670, 'longitude' => 14.2400],
        ];

        $now = now();

        foreach ($provinces as $province) {
            DB::table('provinces')->updateOrInsert(
                ['code' => $province['code']],
                [
                    'name' => $province['name'],
                    'capital' => $province['capital'],
                    'latitude' => $province['latitude'],
                    'longitude' => $province['longitude'],
                    'geojson_data' => null,
                    'created_at' => $now,
                ]
            );
        }

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
}
