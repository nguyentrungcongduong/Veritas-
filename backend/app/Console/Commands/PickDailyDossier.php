<?php

namespace App\Console\Commands;

use App\Models\DetectiveCase;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class PickDailyDossier extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'veritas:pick-daily-dossier';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Pick the hardest case of the day and promote it as the Daily Dossier.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Finding the hardest case in the last 48 hours...');

        $case = DetectiveCase::where('status', 'published')
            ->where('created_at', '>=', now()->subHours(48))
            ->withCount('investigations')
            ->get()
            ->sortByDesc(function ($case) {
                // Determine failed count
                $failed = $case->investigations()->where('status', 'failed')->count();
                $total = $case->investigations_count;
                
                // If nobody played, rating is 0. Else calculate based on difficulty and fail rate.
                return ($total > 0) ? ($failed / $total) * ($case->difficulty ?? 3) * 10 : 0;
            })
            ->first();

        if ($case) {
            Cache::put('daily_dossier_id', $case->id, now()->addDay());
            $this->info("Selected Case {$case->title} (ID: {$case->id}) as Daily Dossier.");
        } else {
            // Fallback: Just grab any random published case if no recent ones exist.
            $fallback = DetectiveCase::where('status', 'published')->inRandomOrder()->first();
            if ($fallback) {
                Cache::put('daily_dossier_id', $fallback->id, now()->addDay());
                $this->info("Fallback Selected Case {$fallback->title} (ID: {$fallback->id}) as Daily Dossier.");
            } else {
                $this->warn('No cases available to be chosen as Daily Dossier.');
            }
        }
    }
}
