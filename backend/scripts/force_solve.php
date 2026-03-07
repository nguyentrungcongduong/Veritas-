<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$CASE_ID = 'c3b52ec7-a03e-4f9e-a2db-928c0f475db9';

$investigation = App\Models\Investigation::updateOrCreate(
    ['case_id' => $CASE_ID, 'user_id' => null],
    [
        'status' => 'solved',
        'attempts_left' => 3,
        'discovered_clues' => ['clue_ids' => [], 'statement_ids' => [], 'unlocked_keywords' => []]
    ]
);

echo "Investigation forced to SOLVED.\n";
