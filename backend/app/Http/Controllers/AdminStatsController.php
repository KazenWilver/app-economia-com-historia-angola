<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\QuizAttempt;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;

class AdminStatsController extends Controller
{
    public function index(): JsonResponse
    {
        $contentsByType = Content::query()
            ->selectRaw('type, COUNT(*) as total')
            ->groupBy('type')
            ->orderBy('type')
            ->pluck('total', 'type');

        $contentsByStatus = Content::query()
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->orderBy('status')
            ->pluck('total', 'status');

        $monthlyActivity = collect(range(5, 0))->map(function (int $monthsAgo): array {
            $start = Carbon::now()->subMonths($monthsAgo)->startOfMonth();
            $end = $start->copy()->endOfMonth();

            return [
                'month' => $start->locale('pt_PT')->translatedFormat('M Y'),
                'users' => User::query()
                    ->whereBetween('created_at', [$start, $end])
                    ->count(),
                'quiz_attempts' => QuizAttempt::query()
                    ->whereBetween('created_at', [$start, $end])
                    ->count(),
                'topics' => Topic::query()
                    ->whereBetween('created_at', [$start, $end])
                    ->count(),
            ];
        })->values();

        return response()->json([
            'data' => [
                'totals' => [
                    'users' => User::query()->count(),
                    'contents' => Content::query()->count(),
                    'quiz_attempts' => QuizAttempt::query()->count(),
                    'topics' => Topic::query()->count(),
                ],
                'contents_by_type' => $contentsByType,
                'contents_by_status' => $contentsByStatus,
                'monthly_activity' => $monthlyActivity,
            ],
        ]);
    }
}
