<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReviewJindungoAccessRequest;
use App\Http\Requests\StoreJindungoAccessRequest;
use App\Http\Resources\JindungoAccessRequestResource;
use App\Models\JindungoAccessRequest;
use App\Services\JindungoAccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use RuntimeException;

class JindungoAccessController extends Controller
{
    public function __construct(
        private readonly JindungoAccessService $jindungoAccessService,
    ) {}

    public function status(Request $request): JsonResponse
    {
        $result = $this->jindungoAccessService->statusFor($request->user());

        return response()->json([
            'data' => [
                'status' => $result['status'],
                'has_access' => $result['has_access'],
                'request' => $result['request'] !== null
                    ? new JindungoAccessRequestResource($result['request'])
                    : null,
            ],
        ]);
    }

    public function store(StoreJindungoAccessRequest $request): JsonResponse
    {
        try {
            $accessRequest = $this->jindungoAccessService->requestAccess(
                $request->user(),
                $request->validated('message'),
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Pedido de acesso enviado. Aguarda a decisão do administrador.',
            'data' => new JindungoAccessRequestResource($accessRequest),
        ], 201);
    }

    public function adminIndex(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'status' => [
                'nullable',
                'string',
                Rule::in([
                    JindungoAccessRequest::STATUS_PENDING,
                    JindungoAccessRequest::STATUS_APPROVED,
                    JindungoAccessRequest::STATUS_REJECTED,
                ]),
            ],
        ]);

        $requests = JindungoAccessRequest::query()
            ->with(['user:id,name,email', 'reviewer:id,name'])
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status')->toString())
            )
            ->latest('created_at')
            ->get();

        return JindungoAccessRequestResource::collection($requests);
    }

    public function review(
        ReviewJindungoAccessRequest $request,
        JindungoAccessRequest $jindungoAccessRequest,
    ): JsonResponse {
        $previousStatus = $jindungoAccessRequest->status;

        try {
            $updated = $this->jindungoAccessService->review(
                accessRequest: $jindungoAccessRequest,
                admin: $request->user(),
                status: (string) $request->validated('status'),
                adminNote: $request->validated('admin_note'),
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $message = match (true) {
            $previousStatus === JindungoAccessRequest::STATUS_APPROVED
                && $updated->status === JindungoAccessRequest::STATUS_REJECTED
                => 'Acesso Jindungo revogado com sucesso.',
            $previousStatus === JindungoAccessRequest::STATUS_REJECTED
                && $updated->status === JindungoAccessRequest::STATUS_APPROVED
                => 'Acesso Jindungo restaurado com sucesso.',
            $updated->status === JindungoAccessRequest::STATUS_APPROVED
                => 'Pedido aprovado com sucesso.',
            default => 'Pedido rejeitado com sucesso.',
        };

        return response()->json([
            'message' => $message,
            'data' => new JindungoAccessRequestResource($updated),
        ]);
    }
}
