<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Economia',
                'description' => 'Conteúdos sobre actividade económica, recursos e desenvolvimento em Angola.',
                'icon' => 'trending-up',
            ],
            [
                'name' => 'História',
                'description' => 'Narrativas históricas, períodos coloniais e pós-independência.',
                'icon' => 'landmark',
            ],
            [
                'name' => 'Política',
                'description' => 'Instituições, governança e processos políticos angolanos.',
                'icon' => 'scale',
            ],
            [
                'name' => 'Cultura',
                'description' => 'Tradições, artes e expressões culturais de Angola.',
                'icon' => 'palette',
            ],
            [
                'name' => 'Sociedade',
                'description' => 'Vida social, educação e dinâmicas comunitárias.',
                'icon' => 'users',
            ],
            [
                'name' => 'Geografia',
                'description' => 'Território, regiões e características geográficas de Angola.',
                'icon' => 'map',
            ],
        ];

        $now = now();

        foreach ($categories as $category) {
            DB::table('categories')->updateOrInsert(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'icon' => $category['icon'],
                    'created_at' => $now,
                ]
            );
        }
    }
}
