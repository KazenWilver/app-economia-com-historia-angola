<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Content;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Comment>
 */
class CommentFactory extends Factory
{
    protected $model = Comment::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'content_id' => Content::factory(),
            'parent_id' => null,
            'body' => fake()->paragraph(),
        ];
    }

    public function reply(Comment $parent): static
    {
        return $this->state(fn (array $attributes) => [
            'content_id' => $parent->content_id,
            'parent_id' => $parent->id,
        ]);
    }
}
