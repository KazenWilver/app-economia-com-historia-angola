<?php

namespace Tests\Feature\Admin;

use App\Models\Content;
use App\Models\Forum;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminStatsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_dashboard_stats(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        User::factory()->create();
        Content::factory()->ofType('texto')->create(['status' => 'published']);
        Content::factory()->draft()->create();

        $forum = Forum::query()->create([
            'name' => 'Debates',
            'slug' => 'debates',
            'description' => 'Fórum de testes',
        ]);

        Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $user->id,
            'title' => 'Economia em Angola',
        ]);

        $quiz = Quiz::query()->create([
            'title' => 'Quiz de História',
        ]);

        QuizAttempt::query()->create([
            'user_id' => $user->id,
            'quiz_id' => $quiz->id,
            'score' => 80,
            'total_questions' => 10,
            'correct_answers' => 8,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/stats');

        $response->assertOk()
            ->assertJsonPath('data.totals.contents', 2)
            ->assertJsonPath('data.totals.quizzes', 1)
            ->assertJsonPath('data.totals.topics', 1)
            ->assertJsonPath('data.totals.quiz_attempts', 1)
            ->assertJsonStructure([
                'data' => [
                    'totals' => ['users', 'contents', 'quizzes', 'quiz_attempts', 'topics'],
                    'contents_by_type',
                    'contents_by_status',
                    'monthly_activity',
                ],
            ]);

        $this->assertGreaterThanOrEqual(3, $response->json('data.totals.users'));
    }

    public function test_non_admin_cannot_view_dashboard_stats(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/stats');

        $response->assertForbidden();
    }
}
