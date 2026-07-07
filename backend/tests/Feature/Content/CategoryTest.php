<?php

namespace Tests\Feature\Content;

use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_categories(): void
    {
        Category::factory()->create(['name' => 'Economia', 'slug' => 'economia']);
        Category::factory()->create(['name' => 'História', 'slug' => 'historia']);

        $response = $this->getJson('/api/categories');

        $response->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonStructure([
                'data' => [
                    ['id', 'name', 'slug', 'description', 'icon'],
                ],
            ]);
    }
}
