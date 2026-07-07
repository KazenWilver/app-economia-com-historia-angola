<?php

namespace Tests\Feature\Content;

use App\Models\Category;
use App\Models\Content;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContentTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_published_contents(): void
    {
        Content::factory()->ofType('texto')->create([
            'title' => 'Conteúdo Publicado',
            'status' => 'published',
        ]);
        Content::factory()->draft()->create([
            'title' => 'Rascunho Oculto',
        ]);

        $response = $this->getJson('/api/contents');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Conteúdo Publicado');
    }

    public function test_guest_can_filter_contents_by_type(): void
    {
        Content::factory()->ofType('audio')->create(['title' => 'Áudio Angola']);
        Content::factory()->ofType('video')->create(['title' => 'Vídeo Angola']);

        $response = $this->getJson('/api/contents?type=audio');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type', 'audio');
    }

    public function test_invalid_type_filter_returns_validation_error(): void
    {
        $response = $this->getJson('/api/contents?type=invalido');

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['type']);
    }

    public function test_admin_can_create_content(): void
    {
        $admin = User::factory()->admin()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/contents', [
            'category_id' => $category->id,
            'title' => 'História Económica de Cabinda',
            'body' => 'Texto introdutório sobre Cabinda.',
            'type' => 'texto',
            'status' => 'published',
        ]);

        $response->assertCreated()
            ->assertJsonPath('content.title', 'História Económica de Cabinda')
            ->assertJsonPath('content.type', 'texto')
            ->assertJsonPath('content.author.id', $admin->id);

        $this->assertDatabaseHas('contents', [
            'title' => 'História Económica de Cabinda',
            'slug' => 'historia-economica-de-cabinda',
            'author_id' => $admin->id,
        ]);
    }

    public function test_non_admin_cannot_create_content(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/contents', [
            'category_id' => $category->id,
            'title' => 'Tentativa de criação',
            'type' => 'texto',
        ]);

        $response->assertForbidden();
    }

    public function test_admin_can_update_content(): void
    {
        $admin = User::factory()->admin()->create();
        $content = Content::factory()->create([
            'title' => 'Título Antigo',
            'status' => 'draft',
        ]);
        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/contents/{$content->id}", [
            'title' => 'Título Actualizado',
            'status' => 'published',
        ]);

        $response->assertOk()
            ->assertJsonPath('content.title', 'Título Actualizado')
            ->assertJsonPath('content.status', 'published');

        $this->assertDatabaseHas('contents', [
            'id' => $content->id,
            'title' => 'Título Actualizado',
            'status' => 'published',
        ]);
    }

    public function test_admin_can_delete_content(): void
    {
        $admin = User::factory()->admin()->create();
        $content = Content::factory()->create();
        Sanctum::actingAs($admin);

        $response = $this->deleteJson("/api/contents/{$content->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Conteúdo eliminado com sucesso.');

        $this->assertDatabaseMissing('contents', [
            'id' => $content->id,
        ]);
    }

    public function test_guest_can_view_published_content_by_slug(): void
    {
        $content = Content::factory()->ofType('texto')->create([
            'title' => 'Conteúdo por Slug',
            'slug' => 'conteudo-por-slug',
            'status' => 'published',
        ]);

        $response = $this->getJson("/api/contents/{$content->slug}");

        $response->assertOk()
            ->assertJsonPath('data.title', 'Conteúdo por Slug')
            ->assertJsonPath('data.slug', 'conteudo-por-slug');
    }

    public function test_create_content_with_invalid_data_returns_validation_error(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/contents', [
            'title' => 'Sem categoria nem tipo',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['category_id', 'type']);
    }
}
