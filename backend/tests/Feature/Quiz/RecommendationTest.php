<?php

namespace Tests\Feature\Quiz;

use App\Models\Answer;
use App\Models\Category;
use App\Models\Content;
use App\Models\Forum;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class RecommendationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{
     *     quiz: Quiz,
     *     questions: array<int, Question>,
     *     correctAnswers: array<int, Answer>,
     *     wrongAnswers: array<int, Answer>
     * }
     */
    private function createQuizFixture(?Topic $topic = null): array
    {
        $quiz = Quiz::query()->create([
            'topic_id' => $topic?->id,
            'title' => 'Quiz de Economia Angolana',
            'description' => 'Teste sobre petróleo e finanças',
            'time_limit_seconds' => 300,
            'is_active' => true,
        ]);

        $firstQuestion = Question::query()->create([
            'quiz_id' => $quiz->id,
            'question_text' => 'Qual é a moeda de Angola?',
            'explanation' => 'O kwanza é a moeda nacional.',
            'order' => 0,
        ]);

        $firstWrong = Answer::query()->create([
            'question_id' => $firstQuestion->id,
            'answer_text' => 'Dólar',
            'is_correct' => false,
            'order' => 0,
        ]);

        $firstCorrect = Answer::query()->create([
            'question_id' => $firstQuestion->id,
            'answer_text' => 'Kwanza',
            'is_correct' => true,
            'order' => 1,
        ]);

        $secondQuestion = Question::query()->create([
            'quiz_id' => $quiz->id,
            'question_text' => 'Angola entrou na OPEP em que ano?',
            'explanation' => 'A adesão ocorreu em 2007.',
            'order' => 1,
        ]);

        $secondWrong = Answer::query()->create([
            'question_id' => $secondQuestion->id,
            'answer_text' => '1990',
            'is_correct' => false,
            'order' => 0,
        ]);

        $secondCorrect = Answer::query()->create([
            'question_id' => $secondQuestion->id,
            'answer_text' => '2007',
            'is_correct' => true,
            'order' => 1,
        ]);

        return [
            'quiz' => $quiz,
            'questions' => [$firstQuestion, $secondQuestion],
            'correctAnswers' => [$firstCorrect, $secondCorrect],
            'wrongAnswers' => [$firstWrong, $secondWrong],
        ];
    }

    private function createEconomyContent(): Content
    {
        $category = Category::query()->create([
            'name' => 'Economia',
            'slug' => 'economia',
            'description' => 'Conteúdos económicos',
            'icon' => 'trending-up',
        ]);

        return Content::query()->create([
            'category_id' => $category->id,
            'author_id' => User::factory()->admin()->create()->id,
            'title' => 'Petróleo e diversificação económica em Angola',
            'slug' => 'petroleo-diversificacao-angola',
            'body' => 'Análise do papel do petróleo na economia angolana.',
            'type' => 'texto',
            'status' => 'published',
            'published_at' => now(),
        ]);
    }

    public function test_quiz_attempt_generates_recommendations_for_wrong_answers(): void
    {
        $user = User::factory()->create();
        $forum = Forum::query()->create([
            'name' => 'Debates',
            'slug' => 'debates',
            'description' => 'Fórum principal',
        ]);
        $topic = Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $user->id,
            'title' => 'Debate económico',
            'theme' => 'Economia',
            'is_private' => false,
            'is_visible' => true,
        ]);

        $fixture = $this->createQuizFixture($topic);
        $content = $this->createEconomyContent();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['wrongAnswers'][0]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['correctAnswers'][1]->id,
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonCount(1, 'recommendations')
            ->assertJsonPath('recommendations.0.content.id', $content->id)
            ->assertJsonStructure([
                'recommendations' => [
                    [
                        'id',
                        'reason',
                        'is_read',
                        'content' => ['id', 'title', 'slug', 'type'],
                    ],
                ],
            ]);

        $this->assertDatabaseHas('recommendations', [
            'user_id' => $user->id,
            'content_id' => $content->id,
            'quiz_attempt_id' => $response->json('attempt.id'),
            'is_read' => false,
        ]);
    }

    public function test_authenticated_user_can_list_recommendations(): void
    {
        $user = User::factory()->create();
        $content = $this->createEconomyContent();
        $fixture = $this->createQuizFixture();
        Sanctum::actingAs($user);

        $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['wrongAnswers'][0]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['wrongAnswers'][1]->id,
                ],
            ],
        ])->assertCreated();

        $response = $this->getJson('/api/recommendations');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.content.id', $content->id);
    }

    public function test_user_can_mark_recommendation_as_read(): void
    {
        $user = User::factory()->create();
        $this->createEconomyContent();
        $fixture = $this->createQuizFixture();
        Sanctum::actingAs($user);

        $attemptResponse = $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['wrongAnswers'][0]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['wrongAnswers'][1]->id,
                ],
            ],
        ])->assertCreated();

        $recommendationId = $attemptResponse->json('recommendations.0.id');

        $response = $this->patchJson("/api/recommendations/{$recommendationId}/read");

        $response->assertOk()
            ->assertJsonPath('recommendation.is_read', true);

        $this->assertDatabaseHas('recommendations', [
            'id' => $recommendationId,
            'is_read' => true,
        ]);
    }

    public function test_user_cannot_mark_another_users_recommendation_as_read(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $this->createEconomyContent();
        $fixture = $this->createQuizFixture();
        Sanctum::actingAs($owner);

        $attemptResponse = $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['wrongAnswers'][0]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['wrongAnswers'][1]->id,
                ],
            ],
        ])->assertCreated();

        $recommendationId = $attemptResponse->json('recommendations.0.id');

        Sanctum::actingAs($otherUser);

        $this->patchJson("/api/recommendations/{$recommendationId}/read")
            ->assertForbidden();
    }

    public function test_recommendations_list_deduplicates_by_content(): void
    {
        $user = User::factory()->create();
        $content = $this->createEconomyContent();
        $fixture = $this->createQuizFixture();
        Sanctum::actingAs($user);

        $payload = [
            'answers' => [
                [
                    'question_id' => $fixture['questions'][0]->id,
                    'selected_answer_id' => $fixture['wrongAnswers'][0]->id,
                ],
                [
                    'question_id' => $fixture['questions'][1]->id,
                    'selected_answer_id' => $fixture['wrongAnswers'][1]->id,
                ],
            ],
        ];

        $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", $payload)
            ->assertCreated();
        $this->postJson("/api/quizzes/{$fixture['quiz']->id}/attempt", $payload)
            ->assertCreated();

        $response = $this->getJson('/api/recommendations');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.content.id', $content->id);
    }

    public function test_guest_cannot_list_recommendations(): void
    {
        $this->getJson('/api/recommendations')
            ->assertUnauthorized();
    }
}
