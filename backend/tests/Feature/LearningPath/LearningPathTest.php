<?php

namespace Tests\Feature\LearningPath;

use App\Models\Content;
use App\Models\LearningPath;
use App\Models\LearningPathStep;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LearningPathTest extends TestCase
{
    use RefreshDatabase;

    private function seedPath(): LearningPath
    {
        $path = LearningPath::query()->create([
            'title' => 'Percurso teste',
            'slug' => 'percurso-teste',
            'description' => 'Trilho de teste',
            'is_active' => true,
        ]);

        $content = Content::factory()->create([
            'status' => 'published',
            'is_exclusive' => false,
            'type' => 'texto',
        ]);

        $quiz = Quiz::query()->create([
            'title' => 'Quiz do trilho',
            'is_active' => true,
        ]);

        LearningPathStep::query()->create([
            'learning_path_id' => $path->id,
            'title' => 'Ler conteúdo',
            'description' => 'Passo de conteúdo',
            'step_type' => 'content',
            'reference_id' => $content->id,
            'href' => '/explorar/'.$content->slug,
            'order' => 0,
        ]);

        LearningPathStep::query()->create([
            'learning_path_id' => $path->id,
            'title' => 'Fazer quiz',
            'description' => 'Passo de quiz',
            'step_type' => 'quiz',
            'reference_id' => $quiz->id,
            'href' => '/quiz/'.$quiz->id,
            'order' => 1,
        ]);

        LearningPathStep::query()->create([
            'learning_path_id' => $path->id,
            'title' => 'Ver mapa',
            'description' => 'Passo de mapa',
            'step_type' => 'map',
            'reference_id' => null,
            'href' => '/mapa',
            'order' => 2,
        ]);

        return $path->fresh('steps');
    }

    public function test_guest_can_view_learning_path_without_progress(): void
    {
        $this->seedPath();

        $response = $this->getJson('/api/learning-path');

        $response->assertOk()
            ->assertJsonPath('meta.total_count', 3)
            ->assertJsonPath('meta.completed_count', 0)
            ->assertJsonPath('meta.requires_auth_for_progress', true)
            ->assertJsonCount(3, 'data.steps');
    }

    public function test_authenticated_user_can_complete_step(): void
    {
        $path = $this->seedPath();
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $step = $path->steps->firstWhere('step_type', 'map');

        $response = $this->postJson("/api/learning-path/steps/{$step->id}/complete");

        $response->assertOk()
            ->assertJsonPath('meta.completed_count', 1)
            ->assertJsonPath('meta.percent', 33);

        $this->assertDatabaseHas('learning_step_completions', [
            'user_id' => $user->id,
            'learning_path_step_id' => $step->id,
        ]);
    }

    public function test_quiz_attempt_auto_completes_quiz_step(): void
    {
        $path = $this->seedPath();
        $user = User::factory()->create();
        $quizStep = $path->steps->firstWhere('step_type', 'quiz');

        QuizAttempt::query()->create([
            'quiz_id' => $quizStep->reference_id,
            'user_id' => $user->id,
            'score' => 100,
            'total_questions' => 1,
            'correct_answers' => 1,
            'time_spent_seconds' => 30,
            'completed_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/learning-path');

        $response->assertOk()
            ->assertJsonPath('meta.completed_count', 1);

        $completed = collect($response->json('data.steps'))
            ->firstWhere('id', $quizStep->id);

        $this->assertTrue($completed['is_completed']);
    }
}
