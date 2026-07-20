<?php

namespace App\Http\Controllers;

use App\Http\Requests\AskTutorRequest;
use App\Http\Resources\TutorExchangeResource;
use App\Services\TutorRagService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class TutorController extends Controller
{
    public function ask(AskTutorRequest $request, TutorRagService $tutorRagService): JsonResponse
    {
        try {
            $result = $tutorRagService->ask(
                user: $request->user(),
                question: (string) $request->validated('question'),
                contentId: $request->filled('content_id')
                    ? (int) $request->validated('content_id')
                    : null,
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => new TutorExchangeResource($result['exchange']),
            'meta' => [
                'provider' => $result['provider'],
            ],
        ]);
    }
}
