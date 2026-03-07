<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class LeaderboardController extends Controller
{
    /**
     * Get the leaderboard data for both Detectives and Criminals.
     * Fetches from Cache to optimize performance.
     */
    public function index(): JsonResponse
    {
        // Try getting from cache. If not found, dispatch sync job or return empty.
        $detectives = Cache::get('leaderboard_detectives', []);
        $criminals = Cache::get('leaderboard_criminals', []);

        // Optional: If empty and you want immediate calculation, you could run the job logic directly,
        // but for high performance returning empty (or starting a background job) is fine if cache is clear.
        if (empty($detectives) && empty($criminals)) {
            // Force dispatch just to generate data immediately if cache was just flushed.
            // Normally this should be scheduled in Console/Kernel.php.
            \App\Jobs\UpdateRankingsJob::dispatchSync();
            $detectives = Cache::get('leaderboard_detectives', []);
            $criminals = Cache::get('leaderboard_criminals', []);
        }

        return response()->json([
            'detectives' => $detectives,
            'criminals' => $criminals,
        ]);
    }
}
