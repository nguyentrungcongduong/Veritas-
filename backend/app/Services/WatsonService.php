<?php

namespace App\Services;

use App\Models\Contradiction;
use App\Models\Investigation;
use Illuminate\Support\Facades\Log;

class WatsonService
{
    /**
     * Watson Assistant — The Auto-Logic Mentor
     * 
     * Tier 1: Relationship Highlight (Rung 2 Node liên quan)
     * Tier 2: Logic Type Insight (Nói ra loại mâu thuẫn)
     */
    public function getHint(Investigation $investigation, int $tier = 1): array
    {
        // 1. Get all contradictions for this case
        $case = $investigation->case;
        $contradictions = Contradiction::where('case_id', $case->id)->get();

        if ($contradictions->isEmpty()) {
            return ['message' => 'Watson cannot find any clues for you right now.', 'status' => 'EMPTY'];
        }

        // 2. Pick a random contradiction as the hint source
        $hintSrc = $contradictions->random();

        // 3. Track tool usage in investigation metadata
        $progress = $investigation->discovered_clues ?? [];
        $gadgetsUsed = $progress['gadgets_used'] ?? [];
        $gadgetsUsed[] = 'watson_tier_' . $tier;

        $investigation->update([
            'discovered_clues' => array_merge($progress, ['gadgets_used' => $gadgetsUsed])
        ]);

        $hint = [
            'status' => 'SUCCESS',
            'tier'   => $tier,
            'penalty' => $tier === 1 ? '-20% Accuracy' : '-40% Accuracy',
        ];

        if ($tier === 1) {
            // Tier 1: Highlight the nodes
            $hint['data'] = [
                'clue_id'      => $hintSrc->clue_id,
                'statement_id' => $hintSrc->statement_id,
                'message'      => 'Watson notes a strange tension between these two items...',
            ];
        } else {
            // Tier 2: Provide logic type insight
            $statement = $hintSrc->statement;
            $hint['data'] = [
                'clue_id'      => $hintSrc->clue_id,
                'statement_id' => $hintSrc->statement_id,
                'logic_type'   => $statement->type ?? 'logic_flaw',
                'message'      => "Watson whispers: 'I've detected a " . ($statement->type ?? 'logic') . " inconsistency here. Look closely at the keywords.'",
            ];
        }

        return $hint;
    }
}
