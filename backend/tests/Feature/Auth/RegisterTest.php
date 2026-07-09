<?php

namespace Tests\Feature\Auth;

use App\Models\Province;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_with_valid_data_returns_user_and_token(): void
    {
        $province = Province::query()->create([
            'name' => 'Luanda',
            'code' => 'LUA',
            'capital' => 'Luanda',
            'latitude' => -8.8368,
            'longitude' => 13.2343,
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Novo Utilizador',
            'email' => 'novo@jindungo.ao',
            'province_id' => $province->id,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ])
            ->assertJsonPath('user.email', 'novo@jindungo.ao')
            ->assertJsonPath('user.role', 'user');

        $this->assertNotEmpty($response->json('token'));
        $this->assertDatabaseHas('users', [
            'email' => 'novo@jindungo.ao',
            'role' => 'user',
        ]);
    }

    public function test_register_with_duplicate_email_returns_validation_error(): void
    {
        User::factory()->create([
            'email' => 'duplicado@jindungo.ao',
        ]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Outro Utilizador',
            'email' => 'duplicado@jindungo.ao',
            'province_id' => Province::query()->create([
                'name' => 'Benguela',
                'code' => 'BGU',
                'capital' => 'Benguela',
                'latitude' => -12.5763,
                'longitude' => 13.4055,
            ])->id,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }

    public function test_register_without_password_returns_validation_error(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Sem Password',
            'email' => 'sempassword@jindungo.ao',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }
}
