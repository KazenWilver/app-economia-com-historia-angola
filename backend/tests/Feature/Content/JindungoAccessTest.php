<?php

namespace Tests\Feature\Content;

use App\Models\Content;
use App\Models\JindungoAccessRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class JindungoAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_without_approval_cannot_list_jindungo(): void
    {
        $user = User::factory()->create();
        Content::factory()->ofType('jindungo')->create(['title' => 'Segredo']);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/contents?type=jindungo');

        $response->assertForbidden()
            ->assertJsonPath('code', 'jindungo_access_required');
    }

    public function test_user_can_request_access_and_admin_can_approve(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        Content::factory()->ofType('jindungo')->create([
            'title' => 'Texto Jindungo',
            'slug' => 'texto-jindungo',
        ]);

        Sanctum::actingAs($user);
        $create = $this->postJson('/api/jindungo/access-requests', [
            'message' => 'Quero estudar os textos exclusivos.',
        ]);
        $create->assertCreated()
            ->assertJsonPath('data.status', 'pending');

        $status = $this->getJson('/api/jindungo/access');
        $status->assertOk()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.has_access', false);

        $this->getJson('/api/contents?type=jindungo')->assertForbidden();

        Sanctum::actingAs($admin);
        $requestId = $create->json('data.id');
        $review = $this->patchJson("/api/admin/jindungo-access-requests/{$requestId}", [
            'status' => 'approved',
            'admin_note' => 'Aprovado para a demo.',
        ]);
        $review->assertOk()
            ->assertJsonPath('data.status', 'approved');

        Sanctum::actingAs($user);
        $this->getJson('/api/jindungo/access')
            ->assertOk()
            ->assertJsonPath('data.has_access', true);

        $this->getJson('/api/contents?type=jindungo')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Texto Jindungo');

        $this->getJson('/api/contents/texto-jindungo')
            ->assertOk()
            ->assertJsonPath('data.title', 'Texto Jindungo');
    }

    public function test_rejected_user_cannot_open_jindungo_content(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $content = Content::factory()->ofType('jindungo')->create([
            'title' => 'Bloqueado',
            'slug' => 'bloqueado',
        ]);

        $accessRequest = JindungoAccessRequest::factory()->create([
            'user_id' => $user->id,
            'status' => JindungoAccessRequest::STATUS_PENDING,
        ]);

        Sanctum::actingAs($admin);
        $this->patchJson("/api/admin/jindungo-access-requests/{$accessRequest->id}", [
            'status' => 'rejected',
        ])->assertOk();

        Sanctum::actingAs($user);
        $this->getJson("/api/contents/{$content->slug}")
            ->assertForbidden()
            ->assertJsonPath('code', 'jindungo_access_required');
    }

    public function test_cannot_create_duplicate_pending_request(): void
    {
        $user = User::factory()->create();
        JindungoAccessRequest::factory()->create([
            'user_id' => $user->id,
            'status' => JindungoAccessRequest::STATUS_PENDING,
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/jindungo/access-requests')
            ->assertUnprocessable();
    }

    public function test_guest_cannot_request_access(): void
    {
        $this->postJson('/api/jindungo/access-requests')
            ->assertUnauthorized();
    }

    public function test_non_admin_cannot_review_requests(): void
    {
        $user = User::factory()->create();
        $accessRequest = JindungoAccessRequest::factory()->create();
        Sanctum::actingAs($user);

        $this->patchJson("/api/admin/jindungo-access-requests/{$accessRequest->id}", [
            'status' => 'approved',
        ])->assertForbidden();
    }

    public function test_admin_can_list_approved_requests_and_revoke_access(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->admin()->create();
        $accessRequest = JindungoAccessRequest::factory()->approved()->create([
            'user_id' => $user->id,
            'reviewed_by' => $admin->id,
        ]);

        Sanctum::actingAs($admin);

        $this->getJson('/api/admin/jindungo-access-requests?status=approved')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $accessRequest->id)
            ->assertJsonPath('data.0.status', 'approved');

        $this->patchJson("/api/admin/jindungo-access-requests/{$accessRequest->id}", [
            'status' => 'rejected',
        ])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected')
            ->assertJsonPath('message', 'Acesso Jindungo revogado com sucesso.');

        Sanctum::actingAs($user);
        $this->getJson('/api/jindungo/access')
            ->assertOk()
            ->assertJsonPath('data.has_access', false);
    }

    public function test_approved_user_cannot_create_another_request(): void
    {
        $user = User::factory()->create();
        JindungoAccessRequest::factory()->approved()->create([
            'user_id' => $user->id,
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/jindungo/access-requests')
            ->assertUnprocessable()
            ->assertJsonPath('message', 'Já tens acesso aprovado à biblioteca Jindungo.');
    }
}
