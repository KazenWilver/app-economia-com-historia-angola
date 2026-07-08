<?php

use App\Http\Controllers\Auth\AdminRegisterController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\ContentController;
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

Route::middleware('auth.api:sanctum')->group(function () {
    Route::post('/contents/{content}/comments', [CommentController::class, 'store']);
    Route::delete('/contents/{content}/comments/{comment}', [CommentController::class, 'destroy']);
});

Route::middleware(['auth.api:sanctum', 'admin'])->group(function () {
    Route::get('/admin/contents', [ContentController::class, 'adminIndex']);
    Route::post('/contents', [ContentController::class, 'store']);
    Route::put('/contents/{content}', [ContentController::class, 'update']);
    Route::post('/contents/{content}', [ContentController::class, 'update']);
    Route::delete('/contents/{content}', [ContentController::class, 'destroy']);
});
