<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_profile_update_accepts_avatar_upload(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'avatar_url' => null,
        ]);

        Sanctum::actingAs($user);

        $file = UploadedFile::fake()->create('avatar.jpg', 100, 'image/jpeg');

        $payload = [
            '_method' => 'PUT',
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $file,
        ];

        if ($user->province_id !== null) {
            $payload['province_id'] = $user->province_id;
        }

        $response = $this->post('/api/auth/profile', $payload, [
            'Accept' => 'application/json',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Perfil actualizado com sucesso.');

        $user->refresh();

        $this->assertNotNull($user->avatar_url);
        $this->assertStringContainsString('/storage/avatars/', $user->avatar_url);
        Storage::disk('public')->assertExists('avatars/'.$file->hashName());
    }

    public function test_profile_update_rejects_non_image_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->post('/api/auth/profile', [
            '_method' => 'PUT',
            'avatar' => UploadedFile::fake()->create('documento.pdf', 100, 'application/pdf'),
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['avatar']);
    }
}
