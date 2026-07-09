<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuestionFeedbackRequest;
use App\Http\Requests\StoreQuizAttemptRequest;
use App\Http\Resources\QuizAttemptResource;
use App\Http\Resources\RecommendationResource;
use App\Models\Question;
use App\Models\Quiz;
use App\Services\QuizScoringService;
use App\Services\RecommendationService;
use Illuminate\Http\JsonResponse;

class QuizAttemptController extends Controller
{
    public function __construct(
        private readonly QuizScoringService $quizScoringService,
        private readonly RecommendationService $recommendationService,
    ) {}

    public function store(StoreQuizAttemptRequest $request, Quiz $quiz): JsonResponse
    {
        $attempt = $this->quizScoringService->submitAttempt(
            quiz: $quiz,
            user: $request->user(),
            answersPayload: $request->validated('answers'),
            timeSpentSeconds: $request->validated('time_spent_seconds'),
        );

        $recommendations = $this->recommendationService->generateForAttempt(
            $attempt,
            $request->user(),
        );

        $attempt->setRelation('recommendations', $recommendations);

        return response()->json([
            'message' => 'Tentativa registada com sucesso.',
            'attempt' => new QuizAttemptResource($attempt),
            'recommendations' => RecommendationResource::collection($recommendations),
        ], 201);
    }

    public function questionFeedback(
        StoreQuestionFeedbackRequest $request,
        Quiz $quiz,
        Question $question,
    ): JsonResponse {
        $feedback = $this->quizScoringService->buildQuestionFeedback(
            question: $question,
            selectedAnswerId: $request->validated('selected_answer_id'),
        );

        return response()->json([
            'feedback' => $feedback,
        ]);
    }
}
