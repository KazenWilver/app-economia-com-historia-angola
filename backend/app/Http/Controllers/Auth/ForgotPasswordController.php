<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

class ForgotPasswordController extends Controller
{
    public function store(ForgotPasswordRequest $request): JsonResponse
    {
        $redirect = $request->validated('redirect') ?? '/login';
        $email = $request->string('email')->toString();
        $devResetLink = null;

        $user = User::query()->where('email', $email)->first();

        if ($user && $user->is_active !== false) {
            Password::broker('users')->sendResetLink(
                ['email' => $email],
                function (User $resetUser, string $token) use ($redirect, &$devResetLink): void {
                    $resetUser->notify(new ResetPasswordNotification($token, $redirect));

                    if (config('app.debug')) {
                        $devResetLink = $this->buildResetLink(
                            $resetUser->getEmailForPasswordReset(),
                            $token,
                            $redirect,
                        );
                    }
                },
            );
        }

        $response = [
            'message' => 'Se o email existir na nossa base de dados, receberás instruções para recuperar a palavra-passe.',
        ];

        if ($devResetLink !== null) {
            $response['dev_reset_link'] = $devResetLink;
        }

        return response()->json($response);
    }

    private function buildResetLink(string $email, string $token, string $redirect): string
    {
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        return $frontendUrl.'/redefinir-palavra-passe?'.http_build_query([
            'token' => $token,
            'email' => $email,
            'redirect' => $redirect,
        ]);
    }
}
