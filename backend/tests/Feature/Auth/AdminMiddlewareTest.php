<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_route_without_admin_role_returns_forbidden(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/admin/ping');

        $response->assertForbidden()
            ->assertJsonPath('message', 'Acesso negado. Apenas administradores.');
    }

    public function test_admin_route_with_admin_role_returns_success(): void
    {
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/ping');

        $response->assertOk()
            ->assertJsonPath('status', 'ok');
    }
}
