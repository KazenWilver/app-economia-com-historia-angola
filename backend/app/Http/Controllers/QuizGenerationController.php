<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateQuizFromContentRequest;
use App\Models\Content;
use App\Services\QuizGenerationService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class QuizGenerationController extends Controller
{
    public function __construct(
        private readonly QuizGenerationService $quizGenerationService,
    ) {}

    public function store(GenerateQuizFromContentRequest $request): JsonResponse
    {
        $questionCount = (int) ($request->validated('question_count') ?? 4);

        try {
            if ($request->filled('content_id')) {
                $content = Content::query()->findOrFail((int) $request->validated('content_id'));
                $payload = $this->quizGenerationService->generateFromContent($content, $questionCount);
            } else {
                $payload = $this->quizGenerationService->generateFromText(
                    sourceText: (string) $request->validated('source_text'),
                    sourceTitle: $request->validated('source_title'),
                    questionCount: $questionCount,
                );
            }
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'message' => 'Quiz proposto com sucesso. Revisa as perguntas antes de guardar.',
            'quiz' => [
                'title' => $payload['title'],
                'description' => $payload['description'],
                'time_limit_seconds' => $payload['time_limit_seconds'],
                'is_active' => $payload['is_active'],
                'questions' => $payload['questions'],
            ],
            'meta' => $payload['meta'],
        ]);
    }
}
