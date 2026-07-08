<?php

namespace Tests\Feature\Quiz;

use App\Models\Quiz;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class QuizTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function sampleQuizPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Quiz sobre Petróleo',
            'description' => 'Testa os teus conhecimentos sobre o sector petrolífero angolano.',
            'time_limit_seconds' => 300,
            'is_active' => true,
            'questions' => [
                [
                    'question_text' => 'Em que década Angola se tornou membro da OPEP?',
                    'explanation' => 'Angola entrou na OPEP em 2007.',
                    'order' => 0,
                    'answers' => [
                        [
                            'answer_text' => '1990',
                            'is_correct' => false,
                            'order' => 0,
                        ],
                        [
                            'answer_text' => '2007',
                            'is_correct' => true,
                            'order' => 1,
                        ],
                        [
                            'answer_text' => '2015',
                            'is_correct' => false,
                            'order' => 2,
                        ],
                    ],
                ],
            ],
        ], $overrides);
    }

    public function test_guest_can_list_active_quizzes_only(): void
    {
        Quiz::query()->create([
            'title' => 'Quiz Activo',
            'is_active' => true,
        ]);
        Quiz::query()->create([
            'title' => 'Quiz Inactivo',
            'is_active' => false,
        ]);

        $response = $this->getJson('/api/quizzes');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Quiz Activo');
    }

    public function test_admin_can_list_all_quizzes(): void
    {
        $admin = User::factory()->admin()->create();
        Quiz::query()->create(['title' => 'Activo', 'is_active' => true]);
        Quiz::query()->create(['title' => 'Inactivo', 'is_active' => false]);
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/quizzes');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_non_admin_cannot_list_admin_quizzes(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/quizzes');

        $response->assertForbidden();
    }

    public function test_admin_can_create_quiz_with_questions(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/quizzes', $this->sampleQuizPayload());

        $response->assertCreated()
            ->assertJsonPath('quiz.title', 'Quiz sobre Petróleo')
            ->assertJsonPath('quiz.questions.0.answers.1.is_correct', true);

        $this->assertDatabaseHas('quizzes', [
            'title' => 'Quiz sobre Petróleo',
            'is_active' => true,
        ]);
        $this->assertDatabaseCount('questions', 1);
        $this->assertDatabaseCount('answers', 3);
    }

    public function test_create_quiz_requires_one_correct_answer_per_question(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $payload = $this->sampleQuizPayload();
        $payload['questions'][0]['answers'][0]['is_correct'] = true;
        $payload['questions'][0]['answers'][1]['is_correct'] = true;

        $response = $this->postJson('/api/quizzes', $payload);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['questions.0.answers']);
    }

    public function test_admin_can_update_quiz(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $createResponse = $this->postJson('/api/quizzes', $this->sampleQuizPayload());
        $quizId = $createResponse->json('quiz.id');

        $response = $this->putJson("/api/quizzes/{$quizId}", [
            'title' => 'Quiz Actualizado',
            'is_active' => false,
        ]);

        $response->assertOk()
            ->assertJsonPath('quiz.title', 'Quiz Actualizado')
            ->assertJsonPath('quiz.is_active', false);
    }

    public function test_admin_can_delete_quiz(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $quiz = Quiz::query()->create([
            'title' => 'Quiz a eliminar',
            'is_active' => true,
        ]);

        $response = $this->deleteJson("/api/quizzes/{$quiz->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('quizzes', ['id' => $quiz->id]);
    }

    public function test_guest_cannot_see_correct_answers_on_quiz_detail(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $createResponse = $this->postJson('/api/quizzes', $this->sampleQuizPayload());
        $quizId = $createResponse->json('quiz.id');

        auth()->forgetGuards();

        $response = $this->getJson("/api/quizzes/{$quizId}");

        $response->assertOk();
        $answers = $response->json('data.questions.0.answers');
        $this->assertIsArray($answers);

        foreach ($answers as $answer) {
            $this->assertArrayNotHasKey('is_correct', $answer);
        }
    }

    public function test_admin_can_see_inactive_quiz_via_admin_show(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $createResponse = $this->postJson('/api/quizzes', $this->sampleQuizPayload([
            'is_active' => false,
        ]));
        $quizId = $createResponse->json('quiz.id');

        $response = $this->getJson("/api/admin/quizzes/{$quizId}");

        $response->assertOk()
            ->assertJsonPath('data.is_active', false)
            ->assertJsonPath('data.questions.0.answers.1.is_correct', true);
    }

    public function test_non_admin_cannot_access_admin_quiz_show(): void
    {
        $user = User::factory()->create();
        $quiz = Quiz::query()->create([
            'title' => 'Quiz privado',
            'is_active' => false,
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/admin/quizzes/{$quiz->id}");

        $response->assertForbidden();
    }

    public function test_admin_can_see_correct_answers_on_quiz_detail(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $createResponse = $this->postJson('/api/quizzes', $this->sampleQuizPayload());
        $quizId = $createResponse->json('quiz.id');

        $response = $this->getJson("/api/quizzes/{$quizId}");

        $response->assertOk()
            ->assertJsonPath('data.questions.0.answers.1.is_correct', true);
    }
}
