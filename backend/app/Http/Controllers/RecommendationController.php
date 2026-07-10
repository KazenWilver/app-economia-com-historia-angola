<?php

namespace App\Http\Controllers;

use App\Http\Resources\RecommendationResource;
use App\Models\Recommendation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class RecommendationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        // Uma entrada por conteúdo: preferir não lida; senão a mais recente.
        $recommendations = Recommendation::query()
            ->with(['content.category'])
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get()
            ->groupBy('content_id')
            ->map(function ($group) {
                return $group
                    ->sortBy([
                        ['is_read', 'asc'],
                        ['created_at', 'desc'],
                    ])
                    ->first();
            })
            ->filter()
            ->sortByDesc(fn (Recommendation $item) => $item->created_at)
            ->take(12)
            ->values();

        return RecommendationResource::collection($recommendations);
    }

    public function markAsRead(Request $request, Recommendation $recommendation): JsonResponse
    {
        if ($recommendation->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Não tens permissão para actualizar esta recomendação.',
            ], 403);
        }

        $recommendation->update(['is_read' => true]);

        return response()->json([
            'message' => 'Recomendação marcada como lida.',
            'recommendation' => new RecommendationResource(
                $recommendation->fresh(['content.category'])
            ),
        ]);
    }
}
