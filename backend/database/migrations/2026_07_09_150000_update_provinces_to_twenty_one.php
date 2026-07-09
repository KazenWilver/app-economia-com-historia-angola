<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Actualiza a tabela de províncias para a divisão de 21 unidades (Lei n.º 14/24).
     */
    public function up(): void
    {
        $now = now();

        DB::table('provinces')
            ->where('code', 'CCU')
            ->update([
                'name' => 'Cubango',
                'code' => 'CUB',
                'capital' => 'Menongue',
                'latitude' => -14.6586,
                'longitude' => 17.6903,
            ]);

        $updates = [
            'BGO' => ['capital' => 'Dande', 'latitude' => -8.4494, 'longitude' => 13.7422],
            'LUA' => ['capital' => 'Ingombota', 'latitude' => -8.8130, 'longitude' => 13.2340],
            'CNO' => ['capital' => 'Cazengo', 'latitude' => -9.2978, 'longitude' => 14.9119],
            'BIE' => ['capital' => 'Cuito', 'latitude' => -12.3833, 'longitude' => 16.9333],
            'NAM' => ['capital' => 'Moçâmedes', 'latitude' => -15.1961, 'longitude' => 12.1522],
            'CNN' => ['capital' => 'Cuanhama', 'latitude' => -17.0667, 'longitude' => 15.7333],
        ];

        foreach ($updates as $code => $data) {
            DB::table('provinces')->where('code', $code)->update($data);
        }

        $newProvinces = [
            [
                'name' => 'Ícolo e Bengo',
                'code' => 'ICB',
                'capital' => 'Catete',
                'latitude' => -9.6833,
                'longitude' => 13.4031,
            ],
            [
                'name' => 'Moxico Leste',
                'code' => 'MLX',
                'capital' => 'Cazombo',
                'latitude' => -11.0667,
                'longitude' => 22.8833,
            ],
            [
                'name' => 'Cuando',
                'code' => 'CUA',
                'capital' => 'Mavinga',
                'latitude' => -15.8333,
                'longitude' => 20.3500,
            ],
        ];

        foreach ($newProvinces as $province) {
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
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('provinces')->whereIn('code', ['ICB', 'MLX', 'CUA'])->delete();

        DB::table('provinces')
            ->where('code', 'CUB')
            ->update([
                'name' => 'Cuando Cubango',
                'code' => 'CCU',
                'capital' => 'Menongue',
                'latitude' => -14.6586,
                'longitude' => 17.6903,
            ]);

        $reverts = [
            'BGO' => ['capital' => 'Caxito', 'latitude' => -8.5794, 'longitude' => 13.4042],
            'LUA' => ['capital' => 'Luanda', 'latitude' => -8.8368, 'longitude' => 13.2343],
            'CNO' => ['capital' => 'Ndalatando', 'latitude' => -9.2978, 'longitude' => 14.9119],
            'BIE' => ['capital' => 'Kuito', 'latitude' => -12.3833, 'longitude' => 16.9333],
            'NAM' => ['capital' => 'Namibe', 'latitude' => -15.1961, 'longitude' => 12.1522],
            'CNN' => ['capital' => 'Ondjiva', 'latitude' => -17.0667, 'longitude' => 15.7333],
        ];

        foreach ($reverts as $code => $data) {
            DB::table('provinces')->where('code', $code)->update($data);
        }
    }
};
