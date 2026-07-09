<?php

namespace Tests\Feature\Quiz;

use App\Models\Province;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RankingTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_national_rankings_ordered_by_best_score(): void
    {
        $luanda = Province::query()->create([
            'name' => 'Luanda',
            'code' => 'LUA',
            'capital' => 'Luanda',
            'latitude' => -8.8368,
            'longitude' => 13.2343,
        ]);

        $benguela = Province::query()->create([
            'name' => 'Benguela',
            'code' => 'BGU',
            'capital' => 'Benguela',
            'latitude' => -12.5763,
            'longitude' => 13.4055,
        ]);

        $quiz = Quiz::query()->create([
            'title' => 'Quiz Nacional',
            'is_active' => true,
        ]);

        $first = User::factory()->create(['province_id' => $luanda->id]);
        $second = User::factory()->create(['province_id' => $benguela->id]);
        $third = User::factory()->create(['province_id' => $luanda->id]);

        QuizAttempt::query()->create([
            'user_id' => $first->id,
            'quiz_id' => $quiz->id,
            'score' => 90,
            'total_questions' => 10,
            'correct_answers' => 9,
            'time_spent_seconds' => 120,
            'completed_at' => now()->subHour(),
        ]);

        QuizAttempt::query()->create([
            'user_id' => $second->id,
            'quiz_id' => $quiz->id,
            'score' => 100,
            'total_questions' => 10,
            'correct_answers' => 10,
            'time_spent_seconds' => 150,
            'completed_at' => now(),
        ]);

        QuizAttempt::query()->create([
            'user_id' => $third->id,
            'quiz_id' => $quiz->id,
            'score' => 80,
            'total_questions' => 10,
            'correct_answers' => 8,
            'time_spent_seconds' => 90,
            'completed_at' => now(),
        ]);

        $response = $this->getJson('/api/rankings');

        $response->assertOk()
            ->assertJsonPath('meta.scope', 'national')
            ->assertJsonPath('meta.total', 3)
            ->assertJsonPath('data.0.position', 1)
            ->assertJsonPath('data.0.user.name', $second->name)
            ->assertJsonPath('data.0.best_score', 100)
            ->assertJsonPath('data.1.position', 2)
            ->assertJsonPath('data.1.user.name', $first->name)
            ->assertJsonPath('data.2.position', 3)
            ->assertJsonPath('data.2.user.name', $third->name);
    }

    public function test_rankings_can_be_filtered_by_province(): void
    {
        $luanda = Province::query()->create([
            'name' => 'Luanda',
            'code' => 'LUA',
            'capital' => 'Luanda',
            'latitude' => -8.8368,
            'longitude' => 13.2343,
        ]);

        $benguela = Province::query()->create([
            'name' => 'Benguela',
            'code' => 'BGU',
            'capital' => 'Benguela',
            'latitude' => -12.5763,
            'longitude' => 13.4055,
        ]);

        $quiz = Quiz::query()->create([
            'title' => 'Quiz Regional',
            'is_active' => true,
        ]);

        $luandaUser = User::factory()->create(['province_id' => $luanda->id]);
        $benguelaUser = User::factory()->create(['province_id' => $benguela->id]);

        QuizAttempt::query()->create([
            'user_id' => $luandaUser->id,
            'quiz_id' => $quiz->id,
            'score' => 70,
            'total_questions' => 5,
            'correct_answers' => 4,
            'completed_at' => now(),
        ]);

        QuizAttempt::query()->create([
            'user_id' => $benguelaUser->id,
            'quiz_id' => $quiz->id,
            'score' => 95,
            'total_questions' => 5,
            'correct_answers' => 5,
            'completed_at' => now(),
        ]);

        $response = $this->getJson("/api/rankings?province_id={$luanda->id}");

        $response->assertOk()
            ->assertJsonPath('meta.scope', 'region')
            ->assertJsonPath('meta.province_id', $luanda->id)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user.name', $luandaUser->name)
            ->assertJsonPath('data.0.user.province.name', 'Luanda');
    }

    public function test_rankings_use_best_attempt_per_user(): void
    {
        $quiz = Quiz::query()->create([
            'title' => 'Quiz Repetido',
            'is_active' => true,
        ]);

        $user = User::factory()->create();

        QuizAttempt::query()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 40,
            'total_questions' => 5,
            'correct_answers' => 2,
            'completed_at' => now()->subDay(),
        ]);

        QuizAttempt::query()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 80,
            'total_questions' => 5,
            'correct_answers' => 4,
            'completed_at' => now(),
        ]);

        $response = $this->getJson('/api/rankings?quiz_id='.$quiz->id);

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.best_score', 80)
            ->assertJsonPath('data.0.attempts_count', 2);
    }

    public function test_rankings_treat_ties_with_same_position(): void
    {
        $quiz = Quiz::query()->create([
            'title' => 'Quiz Empates',
            'is_active' => true,
        ]);

        $first = User::factory()->create();
        $second = User::factory()->create();
        $third = User::factory()->create();

        foreach ([$first, $second, $third] as $index => $user) {
            QuizAttempt::query()->create([
                'user_id' => $user->id,
                'quiz_id' => $quiz->id,
                'score' => $index === 2 ? 60 : 90,
                'total_questions' => 10,
                'correct_answers' => $index === 2 ? 6 : 9,
                'time_spent_seconds' => 100,
                'completed_at' => now()->subMinutes($index),
            ]);
        }

        $response = $this->getJson('/api/rankings?quiz_id='.$quiz->id);

        $response->assertOk()
            ->assertJsonPath('data.0.position', 1)
            ->assertJsonPath('data.1.position', 1)
            ->assertJsonPath('data.2.position', 3);
    }

    public function test_admin_users_are_excluded_from_rankings(): void
    {
        $quiz = Quiz::query()->create([
            'title' => 'Quiz Admin',
            'is_active' => true,
        ]);

        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        QuizAttempt::query()->create([
            'user_id' => $admin->id,
            'quiz_id' => $quiz->id,
            'score' => 100,
            'total_questions' => 5,
            'correct_answers' => 5,
            'completed_at' => now(),
        ]);

        QuizAttempt::query()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 70,
            'total_questions' => 5,
            'correct_answers' => 4,
            'completed_at' => now(),
        ]);

        $response = $this->getJson('/api/rankings');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.user.name', $user->name);
    }
}
