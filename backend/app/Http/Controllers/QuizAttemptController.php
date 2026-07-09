<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuizAttemptRequest;
use App\Http\Resources\QuizAttemptResource;
use App\Models\Quiz;
use App\Services\QuizScoringService;
use Illuminate\Http\JsonResponse;

class QuizAttemptController extends Controller
{
    public function __construct(
        private readonly QuizScoringService $quizScoringService
    ) {}

    public function store(StoreQuizAttemptRequest $request, Quiz $quiz): JsonResponse
    {
        $attempt = $this->quizScoringService->submitAttempt(
            quiz: $quiz,
            user: $request->user(),
            answersPayload: $request->validated('answers'),
            timeSpentSeconds: $request->validated('time_spent_seconds'),
        );

        return response()->json([
            'message' => 'Tentativa registada com sucesso.',
            'attempt' => new QuizAttemptResource($attempt),
        ], 201);
    }
}
