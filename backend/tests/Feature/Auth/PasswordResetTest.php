<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_returns_generic_message_for_existing_email(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'reset@jindungo.ao',
        ]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => $user->email,
            'redirect' => '/admin/login',
        ]);

        $response->assertOk()
            ->assertJsonPath(
                'message',
                'Se o email existir na nossa base de dados, receberás instruções para recuperar a palavra-passe.',
            )
            ->assertJsonStructure(['resetLink']);

        Notification::assertNothingSent();
    }

    public function test_forgot_password_returns_same_message_for_unknown_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => 'inexistente@jindungo.ao',
        ]);

        $response->assertOk()
            ->assertJsonPath(
                'message',
                'Se o email existir na nossa base de dados, receberás instruções para recuperar a palavra-passe.',
            );

        Notification::assertNothingSent();
    }

    public function test_reset_password_updates_password_and_revokes_tokens(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@jindungo.ao',
            'password' => 'old-password-1',
        ]);

        $token = Password::broker('users')->createToken($user);
        $plainToken = $token;
        $user->createToken('auth-token')->plainTextToken;

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $plainToken,
            'password' => 'new-password-1',
            'password_confirmation' => 'new-password-1',
        ]);

        $response->assertOk()
            ->assertJsonPath('message', 'Palavra-passe redefinida com sucesso. Já podes iniciar sessão.');

        $user->refresh();

        $this->assertTrue(Hash::check('new-password-1', $user->password));
        $this->assertCount(0, $user->tokens);

        $this->postJson('/api/auth/login', [
            'email' => $user->email,
            'password' => 'new-password-1',
        ])->assertOk();
    }

    public function test_forgot_password_can_be_requested_twice_without_server_error(): void
    {
        Notification::fake();

        $user = User::factory()->create([
            'email' => 'reset@jindungo.ao',
        ]);

        $this->postJson('/api/auth/forgot-password', [
            'email' => $user->email,
        ])->assertOk();

        $this->postJson('/api/auth/forgot-password', [
            'email' => $user->email,
        ])->assertOk();
    }

    public function test_forgot_password_exposes_reset_link_without_email_api(): void
    {
        Notification::fake();
        config(['app.expose_password_reset_link' => true]);

        $user = User::factory()->create([
            'email' => 'reset@jindungo.ao',
        ]);

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => $user->email,
            'redirect' => '/admin/login',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'resetLink',
                'devResetLink',
            ])
            ->assertJsonPath('resetLink', fn (string $link) => str_contains($link, '/admin/redefinir-palavra-passe'));

        Notification::assertNothingSent();
    }

    public function test_reset_password_rejects_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'reset@jindungo.ao',
        ]);

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => 'token-invalido',
            'password' => 'new-password-1',
            'password_confirmation' => 'new-password-1',
        ]);

        $response->assertStatus(422);
    }
}
