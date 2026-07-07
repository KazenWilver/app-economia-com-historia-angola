<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Content;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Content>
 */
class ContentFactory extends Factory
{
    protected $model = Content::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'category_id' => Category::factory(),
            'author_id' => User::factory(),
            'title' => $title,
            'slug' => Str::slug($title).'-'.fake()->unique()->numerify('###'),
            'body' => fake()->paragraphs(2, true),
            'type' => fake()->randomElement(['texto', 'audio', 'video', 'podcast', 'jindungo']),
            'media_url' => null,
            'statistics_data' => null,
            'is_exclusive' => false,
            'status' => 'published',
            'view_count' => 0,
            'published_at' => now(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'draft',
            'published_at' => null,
        ]);
    }

    public function ofType(string $type): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => $type,
        ]);
    }

    public function exclusive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_exclusive' => true,
        ]);
    }
}
