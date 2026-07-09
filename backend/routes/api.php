<?php

use App\Http\Controllers\AdminStatsController;
use App\Http\Controllers\Auth\AdminRegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\MapNarrativeController;
use App\Http\Controllers\QuizAttemptController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => config('app.name'),
        'message' => 'Jindungo API',
        'status' => 'ok',
    ]);
});

Route::post('/auth/register', [RegisterController::class, 'store']);
Route::post('/auth/admin/register', [AdminRegisterController::class, 'store']);
Route::post('/auth/login', [LoginController::class, 'store']);

Route::middleware('auth.api:sanctum')->group(function () {
    Route::post('/auth/logout', [LoginController::class, 'destroy']);
    Route::get('/auth/me', [ProfileController::class, 'show']);
    Route::put('/auth/profile', [ProfileController::class, 'update']);
});

Route::middleware(['auth.api:sanctum', 'admin'])->get('/admin/ping', function () {
    return response()->json([
        'status' => 'ok',
    ]);
});

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/contents', [ContentController::class, 'index']);
Route::get('/contents/{content}', [ContentController::class, 'show']);
Route::get('/contents/{content}/comments', [CommentController::class, 'index']);
Route::get('/quizzes', [QuizController::class, 'index']);
Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
Route::get('/topics', [TopicController::class, 'index']);
Route::get('/forums', [TopicController::class, 'forumsIndex']);
Route::get('/provinces', [MapNarrativeController::class, 'provincesIndex']);
Route::get('/provinces/{province}', [MapNarrativeController::class, 'provinceShow']);

Route::middleware('auth.api:sanctum')->group(function () {
    Route::post('/contents/{content}/comments', [CommentController::class, 'store']);
    Route::delete('/contents/{content}/comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('/quizzes/{quiz}/attempt', [QuizAttemptController::class, 'store']);
});

Route::middleware(['auth.api:sanctum', 'admin'])->group(function () {
    Route::get('/admin/stats', [AdminStatsController::class, 'index']);
    Route::get('/admin/contents', [ContentController::class, 'adminIndex']);
    Route::get('/admin/quizzes', [QuizController::class, 'adminIndex']);
    Route::get('/admin/quizzes/{quiz}', [QuizController::class, 'adminShow']);
    Route::get('/admin/topics', [TopicController::class, 'adminIndex']);
    Route::get('/admin/topics/{topic}', [TopicController::class, 'adminShow']);
    Route::get('/admin/map-narratives', [MapNarrativeController::class, 'adminIndex']);
    Route::get('/admin/map-narratives/{mapNarrative}', [MapNarrativeController::class, 'adminShow']);
    Route::get('/admin/users', [UserController::class, 'adminIndex']);
    Route::put('/admin/users/{user}', [UserController::class, 'updateStatus']);
    Route::post('/contents', [ContentController::class, 'store']);
    Route::put('/contents/{content}', [ContentController::class, 'update']);
    Route::post('/contents/{content}', [ContentController::class, 'update']);
    Route::delete('/contents/{content}', [ContentController::class, 'destroy']);
    Route::post('/quizzes', [QuizController::class, 'store']);
    Route::put('/quizzes/{quiz}', [QuizController::class, 'update']);
    Route::delete('/quizzes/{quiz}', [QuizController::class, 'destroy']);
    Route::post('/topics', [TopicController::class, 'store']);
    Route::put('/topics/{topic}', [TopicController::class, 'update']);
    Route::delete('/topics/{topic}', [TopicController::class, 'destroy']);
    Route::post('/map-narratives', [MapNarrativeController::class, 'store']);
    Route::put('/map-narratives/{mapNarrative}', [MapNarrativeController::class, 'update']);
    Route::delete('/map-narratives/{mapNarrative}', [MapNarrativeController::class, 'destroy']);
});
