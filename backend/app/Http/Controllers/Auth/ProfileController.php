<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Devolver o utilizador autenticado.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    /**
     * Actualizar perfil do utilizador autenticado.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->safe()->only(['name', 'email', 'phone', 'avatar_url']));

        return response()->json([
            'message' => 'Perfil actualizado com sucesso.',
            'user' => new UserResource($user->fresh()),
        ]);
    }
}
