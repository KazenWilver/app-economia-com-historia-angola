<?php

namespace Database\Factories;

use App\Models\JindungoAccessRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JindungoAccessRequest>
 */
class JindungoAccessRequestFactory extends Factory
{
    protected $model = JindungoAccessRequest::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'status' => JindungoAccessRequest::STATUS_PENDING,
            'message' => 'Gostaria de aceder à biblioteca Jindungo.',
            'admin_note' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (): array => [
            'status' => JindungoAccessRequest::STATUS_APPROVED,
            'reviewed_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (): array => [
            'status' => JindungoAccessRequest::STATUS_REJECTED,
            'reviewed_at' => now(),
        ]);
    }
}
