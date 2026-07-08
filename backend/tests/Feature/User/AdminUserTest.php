<?php

namespace Tests\Feature\User;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_list_users(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->count(2)->create();
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/users');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/users');

        $response->assertForbidden();
    }

    public function test_admin_can_deactivate_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/users/{$user->id}", [
            'is_active' => false,
        ]);

        $response->assertOk()
            ->assertJsonPath('user.is_active', false);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_reactivate_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->inactive()->create();
        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/users/{$user->id}", [
            'is_active' => true,
        ]);

        $response->assertOk()
            ->assertJsonPath('user.is_active', true);
    }

    public function test_admin_cannot_deactivate_self(): void
    {
        $admin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/users/{$admin->id}", [
            'is_active' => false,
        ]);

        $response->assertStatus(422);
    }

    public function test_admin_cannot_change_status_of_other_admin(): void
    {
        $admin = User::factory()->admin()->create();
        $otherAdmin = User::factory()->admin()->create();
        Sanctum::actingAs($admin);

        $response = $this->putJson("/api/admin/users/{$otherAdmin->id}", [
            'is_active' => false,
        ]);

        $response->assertStatus(422);
    }

    public function test_deactivated_user_cannot_login(): void
    {
        User::factory()->inactive()->create([
            'email' => 'inactivo@jindungo.ao',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'inactivo@jindungo.ao',
            'password' => 'password123',
        ]);

        $response->assertForbidden()
            ->assertJsonPath('message', 'Conta desactivada. Contacta o administrador.');
    }

    public function test_deactivating_user_revokes_tokens(): void
    {
        $admin = User::factory()->admin()->create();
        $adminToken = $admin->createToken('admin-token')->plainTextToken;
        $user = User::factory()->create();
        $user->createToken('auth-token');

        $this->withHeader('Authorization', 'Bearer '.$adminToken)
            ->putJson("/api/admin/users/{$user->id}", [
                'is_active' => false,
            ])
            ->assertOk();

        $this->assertSame(0, $user->fresh()->tokens()->count());
    }

    public function test_deactivated_user_cannot_access_protected_routes(): void
    {
        $user = User::factory()->inactive()->create();
        Sanctum::actingAs($user);

        $this->getJson('/api/auth/me')
            ->assertForbidden();
    }
}
