<?php

namespace Tests\Feature\Content;

use App\Models\Comment;
use App\Models\Content;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CommentTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_list_nested_comments_for_published_content(): void
    {
        $content = Content::factory()->create(['status' => 'published']);
        $parent = Comment::factory()->create([
            'content_id' => $content->id,
            'body' => 'Comentário principal',
        ]);
        Comment::factory()->reply($parent)->create([
            'body' => 'Resposta aninhada',
        ]);

        $response = $this->getJson("/api/contents/{$content->id}/comments");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', 'Comentário principal')
            ->assertJsonPath('data.0.replies.0.body', 'Resposta aninhada');
    }

    public function test_authenticated_user_can_create_comment(): void
    {
        $user = User::factory()->create();
        $content = Content::factory()->create(['status' => 'published']);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/contents/{$content->id}/comments", [
            'body' => 'Excelente conteúdo!',
        ]);

        $response->assertCreated()
            ->assertJsonPath('comment.body', 'Excelente conteúdo!')
            ->assertJsonPath('comment.user.id', $user->id);

        $this->assertDatabaseHas('comments', [
            'content_id' => $content->id,
            'user_id' => $user->id,
            'body' => 'Excelente conteúdo!',
            'parent_id' => null,
        ]);
    }

    public function test_authenticated_user_can_reply_to_comment(): void
    {
        $user = User::factory()->create();
        $content = Content::factory()->create(['status' => 'published']);
        $parent = Comment::factory()->create(['content_id' => $content->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/contents/{$content->id}/comments", [
            'body' => 'Concordo plenamente.',
            'parent_id' => $parent->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('comment.parent_id', $parent->id);

        $this->assertDatabaseHas('comments', [
            'parent_id' => $parent->id,
            'body' => 'Concordo plenamente.',
        ]);
    }

    public function test_cannot_reply_with_parent_from_another_content(): void
    {
        $user = User::factory()->create();
        $content = Content::factory()->create(['status' => 'published']);
        $otherContent = Content::factory()->create(['status' => 'published']);
        $foreignParent = Comment::factory()->create(['content_id' => $otherContent->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/contents/{$content->id}/comments", [
            'body' => 'Resposta inválida',
            'parent_id' => $foreignParent->id,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['parent_id']);
    }

    public function test_author_can_delete_own_comment(): void
    {
        $user = User::factory()->create();
        $content = Content::factory()->create(['status' => 'published']);
        $comment = Comment::factory()->create([
            'content_id' => $content->id,
            'user_id' => $user->id,
        ]);
        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/contents/{$content->id}/comments/{$comment->id}");

        $response->assertOk()
            ->assertJsonPath('message', 'Comentário eliminado com sucesso.');

        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
    }

    public function test_user_cannot_delete_comment_from_another_user(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $content = Content::factory()->create(['status' => 'published']);
        $comment = Comment::factory()->create([
            'content_id' => $content->id,
            'user_id' => $author->id,
        ]);
        Sanctum::actingAs($otherUser);

        $response = $this->deleteJson("/api/contents/{$content->id}/comments/{$comment->id}");

        $response->assertForbidden();
    }

    public function test_guest_cannot_create_comment(): void
    {
        $content = Content::factory()->create(['status' => 'published']);

        $response = $this->postJson("/api/contents/{$content->id}/comments", [
            'body' => 'Tentativa sem login',
        ]);

        $response->assertUnauthorized();
    }
}
