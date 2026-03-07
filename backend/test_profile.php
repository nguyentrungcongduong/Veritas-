<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::first();
echo "Testing for user: " . $user->name . "\n";

$count = \Illuminate\Support\Facades\DB::table('investigations')
    ->join('cases', 'investigations.case_id', '=', 'cases.id')
    ->where('cases.author_id', $user->id)
    ->where('investigations.status', 'failed')
    ->count();

echo "Fooled count: " . $count . "\n";
