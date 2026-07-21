<?php

namespace App\Services;

use App\Models\JindungoAccessRequest;
use App\Models\User;
use RuntimeException;

class JindungoAccessService
{
    public function hasAccess(User $user): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return JindungoAccessRequest::query()
            ->where('user_id', $user->id)
            ->where('status', JindungoAccessRequest::STATUS_APPROVED)
            ->exists();
    }

    /**
     * @return array{
     *     status: 'none'|'pending'|'approved'|'rejected',
     *     request: JindungoAccessRequest|null,
     *     has_access: bool
     * }
     */
    public function statusFor(User $user): array
    {
        if ($user->role === 'admin') {
            return [
                'status' => JindungoAccessRequest::STATUS_APPROVED,
                'request' => null,
                'has_access' => true,
            ];
        }

        /** @var JindungoAccessRequest|null $latest */
        $latest = JindungoAccessRequest::query()
            ->where('user_id', $user->id)
            ->latest('id')
            ->first();

        if ($latest === null) {
            return [
                'status' => 'none',
                'request' => null,
                'has_access' => false,
            ];
        }

        return [
            'status' => $latest->status,
            'request' => $latest,
            'has_access' => $latest->status === JindungoAccessRequest::STATUS_APPROVED,
        ];
    }

    public function requestAccess(User $user, ?string $message = null): JindungoAccessRequest
    {
        if ($user->role === 'admin') {
            throw new RuntimeException('Os administradores já têm acesso à biblioteca Jindungo.');
        }

        if ($this->hasAccess($user)) {
            throw new RuntimeException('Já tens acesso aprovado à biblioteca Jindungo.');
        }

        $pending = JindungoAccessRequest::query()
            ->where('user_id', $user->id)
            ->where('status', JindungoAccessRequest::STATUS_PENDING)
            ->exists();

        if ($pending) {
            throw new RuntimeException('Já tens um pedido de acesso em análise.');
        }

        return JindungoAccessRequest::query()->create([
            'user_id' => $user->id,
            'status' => JindungoAccessRequest::STATUS_PENDING,
            'message' => $message !== null && trim($message) !== '' ? trim($message) : null,
        ]);
    }

    public function review(
        JindungoAccessRequest $accessRequest,
        User $admin,
        string $status,
        ?string $adminNote = null,
    ): JindungoAccessRequest {
        if (! in_array($status, [
            JindungoAccessRequest::STATUS_APPROVED,
            JindungoAccessRequest::STATUS_REJECTED,
        ], true)) {
            throw new RuntimeException('Estado de revisão inválido.');
        }

        $current = $accessRequest->status;

        $allowed = match ($current) {
            JindungoAccessRequest::STATUS_PENDING => [
                JindungoAccessRequest::STATUS_APPROVED,
                JindungoAccessRequest::STATUS_REJECTED,
            ],
            // Revogar acesso aprovado ou reactivar um rejeitado.
            JindungoAccessRequest::STATUS_APPROVED => [
                JindungoAccessRequest::STATUS_REJECTED,
            ],
            JindungoAccessRequest::STATUS_REJECTED => [
                JindungoAccessRequest::STATUS_APPROVED,
            ],
            default => [],
        };

        if (! in_array($status, $allowed, true)) {
            throw new RuntimeException(
                $current === $status
                    ? 'O pedido já está neste estado.'
                    : 'Não é possível alterar o pedido para este estado.',
            );
        }

        $accessRequest->update([
            'status' => $status,
            'admin_note' => $adminNote !== null && trim($adminNote) !== ''
                ? trim($adminNote)
                : $accessRequest->admin_note,
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ]);

        return $accessRequest->fresh(['user', 'reviewer']) ?? $accessRequest;
    }
}
