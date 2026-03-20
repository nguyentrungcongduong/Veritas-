<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed nhanh 6 vụ án cho production deploy
        $this->call(QuickCasesSeeder::class);
    }
}
