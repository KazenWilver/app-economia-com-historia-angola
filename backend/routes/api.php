<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Auth\RegisterController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => config('app.name'),
        'message' => 'Jindungo API',
        'status' => 'ok',
    ]);
});

Route::post('/auth/register', [RegisterController::class, 'store']);
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
