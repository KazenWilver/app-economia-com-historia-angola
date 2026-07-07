<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_me_with_token_returns_authenticated_user(): void
    {
        $user = User::factory()->create([
            'name' => 'Maria Santos',
            'email' => 'maria@jindungo.ao',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/auth/me');

        $response->assertOk()
            ->assertJsonPath('user.email', 'maria@jindungo.ao')
            ->assertJsonPath('user.name', 'Maria Santos');
    }

    public function test_me_without_token_returns_unauthorized(): void
    {
        $response = $this->getJson('/api/auth/me');

        $response->assertUnauthorized();
    }

    public function test_profile_update_changes_user_data(): void
    {
        $user = User::factory()->create([
            'name' => 'Nome Antigo',
            'email' => 'antigo@jindungo.ao',
            'phone' => null,
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson('/api/auth/profile', [
            'name' => 'Nome Novo',
            'phone' => '+244900000099',
            'avatar' => 'https://cdn.jindungo.ao/avatars/user.png',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Perfil actualizado com sucesso.')
            ->assertJsonPath('user.name', 'Nome Novo')
            ->assertJsonPath('user.phone', '+244900000099')
            ->assertJsonPath('user.avatar_url', 'https://cdn.jindungo.ao/avatars/user.png');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Nome Novo',
            'phone' => '+244900000099',
            'avatar_url' => 'https://cdn.jindungo.ao/avatars/user.png',
        ]);
    }
}
