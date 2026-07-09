<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    public function store(ForgotPasswordRequest $request): JsonResponse
    {
        $redirect = $request->validated('redirect') ?? '/login';
        $email = $request->string('email')->toString();
        $safeMessage = 'Se o email existir na nossa base de dados, receberás instruções para recuperar a palavra-passe.';
        $resetLink = null;

        $user = User::query()->where('email', $email)->first();

        if ($user && $user->is_active !== false) {
            $resetLink = $this->issueResetToken($user, $redirect);
        }

        $response = ['message' => $safeMessage];

        if ($resetLink !== null) {
            $response['resetLink'] = $resetLink;
            $response['devResetLink'] = $resetLink;
            $response['dev_reset_link'] = $resetLink;
        }

        return response()->json($response);
    }

    private function issueResetToken(User $user, string $redirect): ?string
    {
        $table = (string) config('auth.passwords.users.table', 'password_reset_tokens');
        $email = $user->getEmailForPasswordReset();
        $exposeLink = $this->shouldExposeResetLink();

        if (! $exposeLink) {
            $throttleSeconds = (int) config('auth.passwords.users.throttle', 60);
            $existing = DB::table($table)->where('email', $email)->first();

            if ($existing?->created_at !== null) {
                $throttleExpiresAt = Carbon::parse($existing->created_at)->addSeconds($throttleSeconds);

                if ($throttleExpiresAt->isFuture()) {
                    return null;
                }
            }
        }

        $plainToken = Str::random(64);

        DB::table($table)->updateOrInsert(
            ['email' => $email],
            [
                'token' => Hash::make($plainToken),
                'created_at' => now(),
            ],
        );

        if (! $exposeLink) {
            try {
                $user->notify(new ResetPasswordNotification($plainToken, $redirect));
            } catch (\Throwable $exception) {
                report($exception);
            }

            return null;
        }

        return $this->buildResetLink($email, $plainToken, $redirect);
    }

    private function shouldExposeResetLink(): bool
    {
        return (bool) config('app.expose_password_reset_link', true);
    }

    private function buildResetLink(string $email, string $token, string $redirect): string
    {
        $basePath = str_starts_with($redirect, '/admin')
            ? '/admin/redefinir-palavra-passe'
            : '/redefinir-palavra-passe';

        return $basePath.'?'.http_build_query([
            'token' => $token,
            'email' => $email,
            'redirect' => $redirect,
        ]);
    }
}
