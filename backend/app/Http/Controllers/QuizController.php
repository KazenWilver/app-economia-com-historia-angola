<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuizRequest;
use App\Http\Requests\UpdateQuizRequest;
use App\Http\Resources\QuizResource;
use App\Models\Quiz;
use App\Services\QuizService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class QuizController extends Controller
{
    public function __construct(
        private readonly QuizService $quizService
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $quizzes = Quiz::query()
            ->where('is_active', true)
            ->withCount('questions')
            ->latest('updated_at')
            ->get();

        return QuizResource::collection($quizzes);
    }

    public function adminIndex(): AnonymousResourceCollection
    {
        $quizzes = Quiz::query()
            ->withCount(['questions', 'attempts'])
            ->latest('updated_at')
            ->get();

        return QuizResource::collection($quizzes);
    }

    public function adminShow(Quiz $quiz): QuizResource
    {
        $this->loadQuizRelations($quiz);

        return new QuizResource($quiz);
    }

    public function show(Request $request, Quiz $quiz): QuizResource|JsonResponse
    {
        if (! $quiz->is_active && $request->user('sanctum')?->role !== 'admin') {
            return response()->json([
                'message' => 'Quiz não encontrado.',
            ], 404);
        }

        $this->loadQuizRelations($quiz);

        return new QuizResource($quiz);
    }

    public function store(StoreQuizRequest $request): JsonResponse
    {
        $data = $request->safe()->except(['questions']);
        $questions = $request->validated('questions');

        $quiz = Quiz::query()->create([
            ...$data,
            'is_active' => $data['is_active'] ?? true,
        ]);

        $this->quizService->syncQuestions($quiz, $questions);
        $this->loadQuizRelations($quiz);

        return response()->json([
            'message' => 'Quiz criado com sucesso.',
            'quiz' => new QuizResource($quiz),
        ], 201);
    }

    public function update(UpdateQuizRequest $request, Quiz $quiz): JsonResponse
    {
        $data = $request->safe()->except(['questions']);
        $questions = $request->validated('questions');

        if ($data !== []) {
            $quiz->update($data);
        }

        if (is_array($questions)) {
            $this->quizService->syncQuestions($quiz, $questions);
        }

        $this->loadQuizRelations($quiz);

        return response()->json([
            'message' => 'Quiz actualizado com sucesso.',
            'quiz' => new QuizResource($quiz),
        ]);
    }

    public function destroy(Quiz $quiz): JsonResponse
    {
        $quiz->delete();

        return response()->json([
            'message' => 'Quiz eliminado com sucesso.',
        ]);
    }

    private function loadQuizRelations(Quiz $quiz): void
    {
        $quiz->load([
            'questions' => fn ($query) => $query->orderBy('order'),
            'questions.answers' => fn ($query) => $query->orderBy('order'),
        ]);
    }
}
