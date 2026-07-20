<?php

namespace Tests\Feature\Quiz;

use App\Models\Content;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuizGenerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_generate_quiz_from_content(): void
    {
        $admin = User::factory()->admin()->create();
        $content = Content::factory()->ofType('texto')->create([
            'title' => 'Petróleo e diversificação',
            'status' => 'published',
            'body' => 'Desde a independência em 1975, Angola consolidou uma forte dependência do petróleo. '
                .'O crude representa cerca de 95% das exportações de bens. '
                .'A agenda de diversificação inclui agricultura, pescas e diamantes. '
                .'Luanda permanece o principal centro económico e logístico do país.',
        ]);
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/quizzes/generate-from-content', [
            'content_id' => $content->id,
            'question_count' => 4,
        ]);

        $response->assertOk()
            ->assertJsonPath('quiz.title', 'Quiz: Petróleo e diversificação')
            ->assertJsonPath('quiz.is_active', false)
            ->assertJsonPath('meta.provider', 'heuristic')
            ->assertJsonCount(4, 'quiz.questions');

        $firstQuestion = $response->json('quiz.questions.0');
        $this->assertNotEmpty($firstQuestion['question_text']);
        $this->assertGreaterThanOrEqual(2, count($firstQuestion['answers']));
        $this->assertTrue(
            collect($firstQuestion['answers'])->contains(fn (array $answer): bool => $answer['is_correct'] === true)
        );
    }

    public function test_admin_can_generate_quiz_from_pasted_text(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/quizzes/generate-from-content', [
            'source_title' => 'Texto colado',
            'source_text' => str_repeat(
                'A economia angolana procura diversificar-se para além do petróleo com agricultura e indústria. ',
                3
            ),
            'question_count' => 3,
        ]);

        $response->assertOk()
            ->assertJsonPath('quiz.title', 'Quiz: Texto colado')
            ->assertJsonCount(3, 'quiz.questions');
    }

    public function test_non_admin_cannot_generate_quiz(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/admin/quizzes/generate-from-content', [
            'source_text' => str_repeat('Texto educativo sobre Angola e a sua economia histórica. ', 4),
        ]);

        $response->assertForbidden();
    }

    public function test_generation_requires_source(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/admin/quizzes/generate-from-content', [
            'question_count' => 4,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['content_id']);
    }
}
