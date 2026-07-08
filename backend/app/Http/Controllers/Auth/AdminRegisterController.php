<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAdminRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AdminRegisterController extends Controller
{
    /**
     * Registar um novo administrador com chave de autorização.
     */
    public function store(StoreAdminRequest $request): JsonResponse
    {
        if (! hash_equals(
            (string) config('jindungo.admin_registration_key'),
            $request->string('admin_key')->toString()
        )) {
            return response()->json([
                'message' => 'Chave de administrador inválida.',
            ], 403);
        }

        $user = User::query()->create([
            'name' => $request->string('name')->toString(),
            'email' => $request->string('email')->toString(),
            'password' => $request->string('password')->toString(),
            'role' => 'admin',
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }
}
