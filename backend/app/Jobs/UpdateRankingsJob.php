<?php

namespace App\Jobs;

use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Cache;

class UpdateRankingsJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Fetch Top Detectives
        $topDetectives = User::orderByDesc('fame')
            ->orderByDesc('cases_solved') // Tie breaker
            ->limit(50)
            ->get(['id', 'name', 'alias', 'fame', 'streak', 'cases_solved as solve_count', 'rank']);

        // Fetch Top Criminals
        // Assuming 'prestige' and 'cases_created' are maintained correctly,
        // we query users directly to get the current most wanted.
        $topCriminals = User::orderByDesc('prestige')
            ->orderByDesc('cases_created') // Tie breaker
            ->limit(50)
            ->get(['id', 'name', 'alias', 'prestige', 'cases_created', 'rank as ranking']);

        // Cache the results for 15 minutes
        Cache::put('leaderboard_detectives', $topDetectives, now()->addMinutes(15));
        Cache::put('leaderboard_criminals', $topCriminals, now()->addMinutes(15));
    }
}
