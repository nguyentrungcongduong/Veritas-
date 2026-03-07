<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\UpdateRankingsJob;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Update leaderboard rankings every 15 minutes
Schedule::job(new UpdateRankingsJob)->everyFifteenMinutes();

// Pick a new Daily Dossier every day at midnight
Schedule::command('veritas:pick-daily-dossier')->daily();
