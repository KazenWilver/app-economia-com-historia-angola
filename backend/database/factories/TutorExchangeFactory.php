<?php

namespace Database\Factories;

use App\Models\TutorExchange;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TutorExchange>
 */
class TutorExchangeFactory extends Factory
{
    protected $model = TutorExchange::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'content_id' => null,
            'question' => 'O que é a diversificação económica em Angola?',
            'answer' => 'A diversificação procura reduzir a dependência do petróleo.',
            'sources' => [],
            'provider' => 'heuristic',
        ];
    }
}
