<?php

namespace App\Http\Controllers;

use App\Http\Resources\RankingEntryResource;
use App\Services\RankingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    public function __construct(
        private readonly RankingService $rankingService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'quiz_id' => ['nullable', 'integer', 'exists:quizzes,id'],
            'province_id' => ['nullable', 'integer', 'exists:provinces,id'],
        ], [
            'quiz_id.exists' => 'O quiz seleccionado é inválido.',
            'province_id.exists' => 'A província seleccionada é inválida.',
        ]);

        $quizId = isset($validated['quiz_id']) ? (int) $validated['quiz_id'] : null;
        $provinceId = isset($validated['province_id']) ? (int) $validated['province_id'] : null;

        $rankings = $this->rankingService->getRankings($quizId, $provinceId);

        return response()->json([
            'data' => RankingEntryResource::collection($rankings),
            'meta' => [
                'scope' => $provinceId !== null ? 'region' : 'national',
                'quiz_id' => $quizId,
                'province_id' => $provinceId,
                'total' => $rankings->count(),
            ],
        ]);
    }
}
