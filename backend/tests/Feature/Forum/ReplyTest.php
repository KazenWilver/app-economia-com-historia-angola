<?php

namespace Tests\Feature\Forum;

use App\Models\Forum;
use App\Models\Reply;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReplyTest extends TestCase
{
    use RefreshDatabase;

    private function createForum(): Forum
    {
        return Forum::query()->create([
            'name' => 'Debates',
            'slug' => 'debates',
            'description' => 'Fórum principal',
        ]);
    }

    private function createPublicTopic(User $user, Forum $forum): Topic
    {
        return Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $user->id,
            'title' => 'Economia angolana',
            'description' => 'Debate aberto.',
            'is_visible' => true,
            'is_private' => false,
        ]);
    }

    public function test_guest_can_list_replies_for_public_topic(): void
    {
        $author = User::factory()->create();
        $forum = $this->createForum();
        $topic = $this->createPublicTopic($author, $forum);

        Reply::query()->create([
            'topic_id' => $topic->id,
            'user_id' => $author->id,
            'body' => 'Primeira resposta',
        ]);

        $response = $this->getJson("/api/topics/{$topic->id}/replies");

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', 'Primeira resposta');
    }

    public function test_guest_cannot_view_replies_for_private_topic(): void
    {
        $author = User::factory()->create();
        $forum = $this->createForum();

        $topic = Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $author->id,
            'title' => 'Tópico Privado',
            'is_visible' => true,
            'is_private' => true,
        ]);

        $response = $this->getJson("/api/topics/{$topic->id}/replies");

        $response->assertNotFound();
    }

    public function test_authenticated_user_can_reply_to_public_topic(): void
    {
        $author = User::factory()->create();
        $participant = User::factory()->create();
        $forum = $this->createForum();
        $topic = $this->createPublicTopic($author, $forum);

        Sanctum::actingAs($participant);

        $response = $this->postJson("/api/topics/{$topic->id}/replies", [
            'body' => 'Concordo com a análise.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('reply.body', 'Concordo com a análise.');

        $this->assertDatabaseHas('replies', [
            'topic_id' => $topic->id,
            'user_id' => $participant->id,
            'body' => 'Concordo com a análise.',
        ]);
    }

    public function test_authenticated_user_can_reply_to_nested_reply(): void
    {
        $author = User::factory()->create();
        $participant = User::factory()->create();
        $forum = $this->createForum();
        $topic = $this->createPublicTopic($author, $forum);

        $parentReply = Reply::query()->create([
            'topic_id' => $topic->id,
            'user_id' => $author->id,
            'body' => 'Resposta inicial',
        ]);

        Sanctum::actingAs($participant);

        $response = $this->postJson("/api/topics/{$topic->id}/replies", [
            'body' => 'Resposta aninhada',
            'parent_id' => $parentReply->id,
        ]);

        $response->assertCreated();

        $listResponse = $this->getJson("/api/topics/{$topic->id}/replies");

        $listResponse->assertOk()
            ->assertJsonPath('data.0.replies.0.body', 'Resposta aninhada');
    }

    public function test_cannot_reply_with_parent_from_another_topic(): void
    {
        $author = User::factory()->create();
        $forum = $this->createForum();
        $topic = $this->createPublicTopic($author, $forum);
        $otherTopic = $this->createPublicTopic($author, $forum);

        $foreignReply = Reply::query()->create([
            'topic_id' => $otherTopic->id,
            'user_id' => $author->id,
            'body' => 'Outro tópico',
        ]);

        Sanctum::actingAs($author);

        $response = $this->postJson("/api/topics/{$topic->id}/replies", [
            'body' => 'Tentativa inválida',
            'parent_id' => $foreignReply->id,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['parent_id']);
    }

    public function test_author_can_delete_own_reply(): void
    {
        $author = User::factory()->create();
        $forum = $this->createForum();
        $topic = $this->createPublicTopic($author, $forum);

        $reply = Reply::query()->create([
            'topic_id' => $topic->id,
            'user_id' => $author->id,
            'body' => 'A eliminar',
        ]);

        Sanctum::actingAs($author);

        $response = $this->deleteJson("/api/topics/{$topic->id}/replies/{$reply->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('replies', ['id' => $reply->id]);
    }

    public function test_user_cannot_delete_reply_from_another_user(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $forum = $this->createForum();
        $topic = $this->createPublicTopic($author, $forum);

        $reply = Reply::query()->create([
            'topic_id' => $topic->id,
            'user_id' => $author->id,
            'body' => 'Resposta protegida',
        ]);

        Sanctum::actingAs($otherUser);

        $response = $this->deleteJson("/api/topics/{$topic->id}/replies/{$reply->id}");

        $response->assertForbidden();
    }

    public function test_guest_cannot_create_reply(): void
    {
        $author = User::factory()->create();
        $forum = $this->createForum();
        $topic = $this->createPublicTopic($author, $forum);

        $response = $this->postJson("/api/topics/{$topic->id}/replies", [
            'body' => 'Tentativa sem login',
        ]);

        $response->assertUnauthorized();
    }
}
