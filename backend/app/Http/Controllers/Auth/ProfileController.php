<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\AvatarMediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(
        private readonly AvatarMediaService $avatarMediaService,
    ) {}

    /**
     * Devolver o utilizador autenticado.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('province')),
        ]);
    }

    /**
     * Actualizar perfil do utilizador autenticado.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->safe()->only(['name', 'email', 'phone', 'avatar_url', 'province_id']);

        if ($request->hasFile('avatar')) {
            if ($this->avatarMediaService->isManagedAvatar($user->avatar_url)) {
                $this->avatarMediaService->delete($user->avatar_url);
            }

            $data['avatar_url'] = $this->avatarMediaService->store($request->file('avatar'));
        }

        $user->update($data);

        return response()->json([
            'message' => 'Perfil actualizado com sucesso.',
            'user' => new UserResource($user->fresh()->load('province')),
        ]);
    }
}
