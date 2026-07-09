<?php

namespace Tests\Feature\Forum;

use App\Models\Forum;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TopicTest extends TestCase
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

    public function test_guest_can_list_visible_public_topics_only(): void
    {
        $forum = $this->createForum();
        $user = User::factory()->create();

        Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $user->id,
            'title' => 'Tópico Público',
            'is_visible' => true,
            'is_private' => false,
        ]);
        Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $user->id,
            'title' => 'Tópico Privado',
            'is_visible' => true,
            'is_private' => true,
        ]);

        $response = $this->getJson('/api/topics');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Tópico Público');
    }

    public function test_admin_can_list_all_topics(): void
    {
        $admin = User::factory()->admin()->create();
        $forum = $this->createForum();

        Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $admin->id,
            'title' => 'Visível',
            'is_visible' => true,
        ]);
        Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $admin->id,
            'title' => 'Oculto',
            'is_visible' => false,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/topics');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_topic(): void
    {
        $admin = User::factory()->admin()->create();
        $forum = $this->createForum();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/topics', [
            'forum_id' => $forum->id,
            'title' => 'Impacto do petróleo',
            'description' => 'Debate sobre a economia petrolífera.',
            'theme' => 'Petróleo',
            'is_private' => false,
            'is_visible' => true,
        ]);

        $response->assertCreated()
            ->assertJsonPath('topic.title', 'Impacto do petróleo');

        $this->assertDatabaseHas('topics', [
            'title' => 'Impacto do petróleo',
            'user_id' => $admin->id,
        ]);
    }

    public function test_admin_can_update_topic_visibility(): void
    {
        $admin = User::factory()->admin()->create();
        $forum = $this->createForum();
        Sanctum::actingAs($admin);

        $topic = Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $admin->id,
            'title' => 'Tópico a ocultar',
            'is_visible' => true,
        ]);

        $response = $this->putJson("/api/topics/{$topic->id}", [
            'is_visible' => false,
        ]);

        $response->assertOk()
            ->assertJsonPath('topic.is_visible', false);
    }

    public function test_admin_can_delete_topic(): void
    {
        $admin = User::factory()->admin()->create();
        $forum = $this->createForum();
        Sanctum::actingAs($admin);

        $topic = Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $admin->id,
            'title' => 'Tópico a eliminar',
        ]);

        $response = $this->deleteJson("/api/topics/{$topic->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('topics', ['id' => $topic->id]);
    }

    public function test_forums_index_ensures_default_forum(): void
    {
        $response = $this->getJson('/api/forums');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'debates')
            ->assertJsonPath('data.0.name', 'Debates');

        $this->assertDatabaseHas('forums', ['slug' => 'debates']);
    }

    public function test_cannot_create_topic_as_public_and_private(): void
    {
        $admin = User::factory()->admin()->create();
        $forum = $this->createForum();
        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/topics', [
            'forum_id' => $forum->id,
            'title' => 'Tópico inválido',
            'is_visible' => true,
            'is_private' => true,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['is_private']);
    }

    public function test_authenticated_user_can_create_public_topic(): void
    {
        $user = User::factory()->create();
        $forum = $this->createForum();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/topics', [
            'forum_id' => $forum->id,
            'title' => 'Novo debate',
            'description' => 'Tema aberto à comunidade.',
            'is_private' => false,
        ]);

        $response->assertCreated()
            ->assertJsonPath('topic.title', 'Novo debate');

        $this->assertDatabaseHas('topics', [
            'title' => 'Novo debate',
            'user_id' => $user->id,
            'is_private' => false,
        ]);
    }

    public function test_author_can_hide_own_topic(): void
    {
        $user = User::factory()->create();
        $forum = $this->createForum();
        Sanctum::actingAs($user);

        $topic = Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $user->id,
            'title' => 'Tópico do autor',
            'is_visible' => true,
        ]);

        $response = $this->putJson("/api/topics/{$topic->id}", [
            'is_visible' => false,
        ]);

        $response->assertOk()
            ->assertJsonPath('topic.is_visible', false);
    }

    public function test_author_can_delete_own_topic(): void
    {
        $user = User::factory()->create();
        $forum = $this->createForum();
        Sanctum::actingAs($user);

        $topic = Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $user->id,
            'title' => 'Tópico do autor',
        ]);

        $response = $this->deleteJson("/api/topics/{$topic->id}");

        $response->assertOk();
        $this->assertDatabaseMissing('topics', ['id' => $topic->id]);
    }

    public function test_non_author_cannot_delete_topic(): void
    {
        $author = User::factory()->create();
        $otherUser = User::factory()->create();
        $forum = $this->createForum();

        $topic = Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $author->id,
            'title' => 'Tópico protegido',
        ]);

        Sanctum::actingAs($otherUser);

        $response = $this->deleteJson("/api/topics/{$topic->id}");

        $response->assertForbidden();
    }

    public function test_guest_can_view_public_topic_detail(): void
    {
        $user = User::factory()->create();
        $forum = $this->createForum();

        $topic = Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $user->id,
            'title' => 'Detalhe público',
            'is_visible' => true,
            'is_private' => false,
        ]);

        $response = $this->getJson("/api/topics/{$topic->id}");

        $response->assertOk()
            ->assertJsonPath('data.title', 'Detalhe público');
    }

    public function test_guest_cannot_view_private_topic_detail(): void
    {
        $user = User::factory()->create();
        $forum = $this->createForum();

        $topic = Topic::query()->create([
            'forum_id' => $forum->id,
            'user_id' => $user->id,
            'title' => 'Detalhe privado',
            'is_visible' => true,
            'is_private' => true,
        ]);

        $response = $this->getJson("/api/topics/{$topic->id}");

        $response->assertNotFound();
    }
}
