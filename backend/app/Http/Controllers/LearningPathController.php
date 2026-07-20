<?php

namespace App\Http\Controllers;

use App\Http\Resources\LearningPathResource;
use App\Models\LearningPathStep;
use App\Services\LearningPathService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LearningPathController extends Controller
{
    public function __construct(
        private readonly LearningPathService $learningPathService,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');
        $progress = $this->learningPathService->progressFor($user);

        if ($progress['path'] === null) {
            return response()->json([
                'message' => 'Ainda não existe um trilho educativo activo.',
                'data' => null,
                'meta' => [
                    'completed_count' => 0,
                    'total_count' => 0,
                    'percent' => 0,
                ],
            ]);
        }

        $contentSlugs = $this->contentSlugMap($progress['path']->steps);

        $resource = (new LearningPathResource($progress['path']))->additional([
            'completed_step_ids' => $progress['completed_step_ids'],
            'content_slugs' => $contentSlugs,
        ]);

        return response()->json([
            'data' => $resource->resolve(),
            'meta' => [
                'completed_count' => $progress['completed_count'],
                'total_count' => $progress['total_count'],
                'percent' => $progress['percent'],
                'requires_auth_for_progress' => $user === null,
            ],
        ]);
    }

    public function completeStep(Request $request, LearningPathStep $step): JsonResponse
    {
        $user = $request->user();
        $this->learningPathService->completeStep($user, $step);

        $progress = $this->learningPathService->progressFor($user);
        $contentSlugs = $progress['path'] !== null
            ? $this->contentSlugMap($progress['path']->steps)
            : [];

        return response()->json([
            'message' => 'Passo concluído com sucesso.',
            'data' => $progress['path'] !== null
                ? (new LearningPathResource($progress['path']))->additional([
                    'completed_step_ids' => $progress['completed_step_ids'],
                    'content_slugs' => $contentSlugs,
                ])->resolve()
                : null,
            'meta' => [
                'completed_count' => $progress['completed_count'],
                'total_count' => $progress['total_count'],
                'percent' => $progress['percent'],
            ],
        ]);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, LearningPathStep>  $steps
     * @return array<int, string>
     */
    private function contentSlugMap($steps): array
    {
        $contentIds = $steps
            ->where('step_type', 'content')
            ->pluck('reference_id')
            ->filter()
            ->values();

        if ($contentIds->isEmpty()) {
            return [];
        }

        return \App\Models\Content::query()
            ->whereIn('id', $contentIds)
            ->pluck('slug', 'id')
            ->all();
    }
}
