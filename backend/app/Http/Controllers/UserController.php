<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateUserStatusRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    /**
     * Listagem de utilizadores para o painel admin.
     */
    public function adminIndex(): AnonymousResourceCollection
    {
        $users = User::query()
            ->select([
                'id',
                'name',
                'email',
                'phone',
                'role',
                'is_active',
                'created_at',
                'updated_at',
            ])
            ->orderByDesc('created_at')
            ->get();

        return UserResource::collection($users);
    }

    /**
     * Activar ou desactivar um utilizador.
     */
    public function updateStatus(UpdateUserStatusRequest $request, User $user): JsonResponse
    {
        $admin = $request->user();

        if ($user->id === $admin->id) {
            return response()->json([
                'message' => 'Não podes alterar o estado da tua própria conta.',
            ], 422);
        }

        if ($user->role === 'admin') {
            return response()->json([
                'message' => 'Não é possível alterar o estado de contas de administrador.',
            ], 422);
        }

        $isActive = $request->boolean('is_active');
        $user->update(['is_active' => $isActive]);

        if (! $isActive) {
            $user->tokens()->delete();
        }

        return response()->json([
            'message' => $isActive
                ? 'Utilizador activado com sucesso.'
                : 'Utilizador desactivado com sucesso.',
            'user' => new UserResource($user),
        ]);
    }
}
