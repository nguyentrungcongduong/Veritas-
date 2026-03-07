<?php

namespace App\Services;

use App\Models\Clue;
use App\Models\DetectiveCase;
use App\Models\Investigation;
use App\Models\Statement;

/**
 * DiscoveryService — "The Unveiler"
 *
 * Quản lý progressive revelation:
 *   - Tier 0: thấy ngay khi bắt đầu điều tra
 *   - Tier 1: unlock khi click trigger_keyword liên quan
 *   - Tier 2: unlock khi đã có Tier 1 trước đó
 *   - Tier 3: hidden — unlock qua special trigger
 *
 * discovered_clues trong Investigation lưu dạng:
 *   { "clue_ids": [1,2], "statement_ids": [1,4], "unlocked_keywords": ["mã truy cập"] }
 */
class DiscoveryService
{
    /**
     * Lấy dữ liệu case đã lọc theo discovery progress.
     * Chỉ trả clues/statements mà thám tử thực sự đã unlock.
     */
    public function getCaseDataForInvestigation(DetectiveCase $case, ?Investigation $investigation): array
    {
        $progress = $investigation
            ? ($investigation->discovered_clues ?? [])
            : [];

        $unlockedClueIds     = $progress['clue_ids'] ?? [];
        $unlockedStatementIds = $progress['statement_ids'] ?? [];

        // Tier 0 luôn visible
        $visibleClues = $case->clues()
            ->where(function ($q) use ($unlockedClueIds) {
                $q->where('discovery_tier', 0)
                  ->orWhereIn('id', $unlockedClueIds);
            })
            ->get();

        $visibleStatements = Statement::whereIn('suspect_id', $case->suspects->pluck('id'))
            ->where(function ($q) use ($unlockedStatementIds) {
                $q->where('discovery_tier', 0)
                  ->orWhereIn('id', $unlockedStatementIds);
            })
            ->get()
            ->groupBy('suspect_id');

        // Tính redacted items count (để UI biết còn bao nhiêu ẩn)
        $totalClues      = $case->clues()->count();
        $totalStatements = Statement::whereIn('suspect_id', $case->suspects->pluck('id'))->count();
        $hiddenClues     = $totalClues - $visibleClues->count();
        $hiddenStatements = $totalStatements - $visibleStatements->flatten()->count();

        return [
            'visible_clues'      => $visibleClues,
            'visible_statements' => $visibleStatements,
            'hidden_clues'       => $hiddenClues,
            'hidden_statements'  => $hiddenStatements,
            'total_clues'        => $totalClues,
            'total_statements'   => $totalStatements,
        ];
    }

    /**
     * Unlock items bằng keyword.
     * Khi thám tử click vào một keyword trong text, check xem
     * có clue/statement nào có trigger_keyword matching không.
     *
     * @return array Danh sách items mới được unlock
     */
    public function unlockByKeyword(
        DetectiveCase $case,
        Investigation $investigation,
        string $keyword
    ): array {
        $keyword  = mb_strtolower(trim($keyword));
        $progress = $investigation->discovered_clues ?? [];
        $unlockedClueIds      = $progress['clue_ids'] ?? [];
        $unlockedStatementIds = $progress['statement_ids'] ?? [];
        $unlockedKeywords     = $progress['unlocked_keywords'] ?? [];

        if (in_array($keyword, $unlockedKeywords)) {
            return ['newly_unlocked' => [], 'message' => 'Keyword đã được khám phá.'];
        }

        $newlyUnlocked = [];

        // Tìm clues matching keyword
        $matchingClues = $case->clues()
            ->where('trigger_keyword', $keyword)
            ->whereNotIn('id', $unlockedClueIds)
            ->get();

        foreach ($matchingClues as $clue) {
            // Check prerequisite: chỉ unlock tier N nếu đã có tier N-1
            if ($this->canUnlockTier($clue->discovery_tier, $progress)) {
                $unlockedClueIds[] = $clue->id;
                $newlyUnlocked[]   = [
                    'type' => 'clue',
                    'id'   => $clue->id,
                    'name' => $clue->name,
                    'tier' => $clue->discovery_tier,
                ];
            }
        }

        // Tìm statements matching keyword
        $suspectIds = $case->suspects->pluck('id');
        $matchingStatements = Statement::whereIn('suspect_id', $suspectIds)
            ->where('trigger_keyword', $keyword)
            ->whereNotIn('id', $unlockedStatementIds)
            ->get();

        foreach ($matchingStatements as $st) {
            if ($this->canUnlockTier($st->discovery_tier, $progress)) {
                $unlockedStatementIds[] = $st->id;
                $newlyUnlocked[]        = [
                    'type'    => 'statement',
                    'id'      => $st->id,
                    'content' => $st->content,
                    'tier'    => $st->discovery_tier,
                ];
            }
        }

        // Save progress
        $unlockedKeywords[] = $keyword;
        $investigation->update([
            'discovered_clues' => [
                'clue_ids'          => array_values(array_unique($unlockedClueIds)),
                'statement_ids'     => array_values(array_unique($unlockedStatementIds)),
                'unlocked_keywords' => array_values(array_unique($unlockedKeywords)),
            ],
        ]);

        return [
            'newly_unlocked' => $newlyUnlocked,
            'message'        => count($newlyUnlocked) > 0
                ? count($newlyUnlocked) . ' mục bằng chứng mới vừa được phát hiện!'
                : 'Không tìm thấy manh mối mới từ keyword này.',
        ];
    }

    /**
     * Check prerequisite tier: tier 2 cần ít nhất 1 item tier 1 đã unlock.
     */
    private function canUnlockTier(int $tier, array $progress): bool
    {
        if ($tier <= 1) return true;

        // Tier 2+ cần có ít nhất 1 item đã unlock ở tier thấp hơn
        $unlockedClueIds     = $progress['clue_ids'] ?? [];
        $unlockedStatementIds = $progress['statement_ids'] ?? [];

        return count($unlockedClueIds) > 0 || count($unlockedStatementIds) > 0;
    }
}
