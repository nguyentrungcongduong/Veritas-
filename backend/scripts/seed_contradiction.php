<?php

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$SUSPECT_ID = 'de66a955-540a-41ce-a6c5-629688578d95';
$CLUE_ID    = 15;
$CASE_ID    = 'c3b52ec7-a03e-4f9e-a2db-928c0f475db9';

// Create statement
$stmt = App\Models\Statement::create([
    'suspect_id'      => $SUSPECT_ID,
    'content'         => 'Tôi đang nghỉ giải lao ở tầng 3 lúc sự việc xảy ra — có đồng nghiệp chứng kiến.',
    'type'            => 'lie',
    'discovery_tier'  => 1,
    'trigger_keyword' => 'alibi',
]);

echo "✓ Statement created: ID={$stmt->id}\n";

// Create contradiction (Clue → Statement)
$con = App\Models\Contradiction::create([
    'case_id'      => $CASE_ID,
    'clue_id'      => $CLUE_ID,
    'statement_id' => $stmt->id,
    'explanation'  => 'Security badge log shows Chen was NOT on floor 3 at the time — his alibi is fabricated.',
]);

echo "✓ Contradiction created: ID={$con->id} (Clue {$CLUE_ID} → Statement {$stmt->id})\n";
echo "✓ Done. Case should now pass Isolation Check.\n";
