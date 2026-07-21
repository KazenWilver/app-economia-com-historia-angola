<?php

namespace Tests\Feature\Content;

use App\Models\Content;
use App\Models\JindungoAccessRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContentExclusiveTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_list_jindungo_contents(): void
    {
        Content::factory()->ofType('jindungo')->create([
            'title' => 'Texto Jindungo Exclusivo',
        ]);

        $response = $this->getJson('/api/contents?type=jindungo');

        $response->assertUnauthorized()
            ->assertJsonPath('message', 'Autenticação necessária para aceder a conteúdos Jindungo.');
    }

    public function test_authenticated_user_can_list_jindungo_contents(): void
    {
        $user = User::factory()->create();
        JindungoAccessRequest::factory()->approved()->create([
            'user_id' => $user->id,
            'reviewed_by' => User::factory()->admin()->create()->id,
            'reviewed_at' => now(),
        ]);
        Content::factory()->ofType('jindungo')->create([
            'title' => 'Texto Jindungo para Membros',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/contents?type=jindungo');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Texto Jindungo para Membros')
            ->assertJsonPath('data.0.type', 'jindungo');
    }

    public function test_guest_cannot_view_exclusive_content(): void
    {
        $content = Content::factory()->exclusive()->ofType('texto')->create([
            'title' => 'Conteúdo Exclusivo',
        ]);

        $response = $this->getJson("/api/contents/{$content->id}");

        $response->assertUnauthorized()
            ->assertJsonPath('message', 'Autenticação necessária para aceder a este conteúdo.');
    }

    public function test_authenticated_user_can_view_exclusive_content(): void
    {
        $user = User::factory()->create();
        $content = Content::factory()->exclusive()->ofType('texto')->create([
            'title' => 'Conteúdo Exclusivo Autenticado',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/contents/{$content->id}");

        $response->assertOk()
            ->assertJsonPath('data.title', 'Conteúdo Exclusivo Autenticado')
            ->assertJsonPath('data.is_exclusive', true);
    }

    public function test_guest_list_excludes_jindungo_and_exclusive_contents(): void
    {
        Content::factory()->ofType('texto')->create(['title' => 'Texto Público']);
        Content::factory()->ofType('jindungo')->create(['title' => 'Jindungo Oculto']);
        Content::factory()->exclusive()->ofType('audio')->create(['title' => 'Áudio Exclusivo']);

        $response = $this->getJson('/api/contents');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Texto Público');
    }

    public function test_authenticated_list_includes_exclusive_for_any_user(): void
    {
        $user = User::factory()->create();
        Content::factory()->ofType('texto')->create(['title' => 'Texto Público']);
        Content::factory()->exclusive()->ofType('audio')->create(['title' => 'Áudio Exclusivo']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/contents');

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        $this->assertStringContainsString(
            'no-store',
            (string) $response->headers->get('Cache-Control'),
        );
    }
}
