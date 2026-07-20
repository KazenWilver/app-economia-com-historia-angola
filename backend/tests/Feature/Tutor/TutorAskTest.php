<?php

namespace Tests\Feature\Tutor;

use App\Models\Content;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TutorAskTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_ask_tutor(): void
    {
        $user = User::factory()->create();
        Content::factory()->ofType('texto')->create([
            'title' => 'Petróleo e diversificação em Angola',
            'slug' => 'petroleo-diversificacao',
            'status' => 'published',
            'body' => 'Desde a independência em 1975, Angola consolidou uma forte dependência do petróleo. '
                .'O crude representa cerca de 95% das exportações de bens. '
                .'A agenda de diversificação inclui agricultura, pescas e diamantes.',
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/tutor/ask', [
            'question' => 'O que é a diversificação económica em Angola?',
        ]);

        $response->assertOk()
            ->assertJsonPath('meta.provider', 'heuristic')
            ->assertJsonStructure([
                'data' => [
                    'id',
                    'question',
                    'answer',
                    'sources',
                    'provider',
                    'created_at',
                ],
                'meta' => ['provider'],
            ]);

        $this->assertNotEmpty($response->json('data.answer'));
        $this->assertDatabaseHas('tutor_exchanges', [
            'user_id' => $user->id,
            'provider' => 'heuristic',
        ]);
        $this->assertNotEmpty($response->json('data.sources'));
        $this->assertSame(
            'Petróleo e diversificação em Angola',
            $response->json('data.sources.0.title')
        );
    }

    public function test_guest_cannot_ask_tutor(): void
    {
        $response = $this->postJson('/api/tutor/ask', [
            'question' => 'O que é a diversificação económica?',
        ]);

        $response->assertUnauthorized();
    }

    public function test_ask_requires_question(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/tutor/ask', []);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['question']);
    }

    public function test_tutor_can_focus_on_specific_content(): void
    {
        $user = User::factory()->create();
        $content = Content::factory()->ofType('texto')->create([
            'title' => 'Café de Angola',
            'slug' => 'cafe-angola',
            'status' => 'published',
            'body' => 'O café foi historicamente um produto importante nas exportações angolanas, '
                .'especialmente nas regiões do Uíge e do Kwanza Norte antes da guerra.',
        ]);
        Content::factory()->ofType('texto')->create([
            'title' => 'Petróleo',
            'slug' => 'petroleo',
            'status' => 'published',
            'body' => 'O petróleo domina as exportações contemporâneas de Angola.',
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/tutor/ask', [
            'question' => 'Qual o papel do café na economia?',
            'content_id' => $content->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.sources.0.slug', 'cafe-angola')
            ->assertJsonPath('data.content_id', $content->id);
    }
}
