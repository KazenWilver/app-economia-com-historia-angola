<?php

namespace Database\Seeders;

use App\Models\Forum;
use Illuminate\Database\Seeder;

class ForumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Forum::query()->updateOrCreate(
            ['slug' => 'debates'],
            [
                'name' => 'Debates',
                'description' => 'Espaço de discussão sobre economia e história de Angola.',
            ]
        );
    }
}
