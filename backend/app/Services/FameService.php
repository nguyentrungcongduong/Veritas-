<?php

namespace App\Services;

use App\Models\Investigation;

/**
 * FameService — Bộ máy tính điểm danh vọng
 *
 * Phase 1: Logic cơ bản. Sau này mở rộng:
 *   - Fame decay nếu case bị solve 100%
 *   - Anti-alt farming detection
 *   - Criminal prestige (nếu case không ai solve được)
 */
class FameService
{
    // Hệ số thưởng theo độ khó (sau này connect với cases.difficulty)
    private const DIFFICULTY_MULTIPLIER = [
        1 => 1.0,
        2 => 1.5,
        3 => 2.0,
        4 => 3.0,
        5 => 5.0,
    ];

    // Khấu trừ điểm khi dùng bảo bối (Gadget Penalties)
    private const GADGET_ACCURACY_PENALTY = 0.20; // -20% mỗi lần dùng đồ chơi
    private const VOICE_CHANGER_PENALTY = 0.50;   // -50% nếu dùng máy giả giọng (auto-solve 1 suspect)

    /**
     * Thưởng Fame khi phá án thành công.
     *
     * @param  Investigation  $investigation
     * @param  int            $baseScore     Điểm tính từ JudgmentService
     * @param  int            $difficulty    Độ khó vụ án (1-5)
     * @return int            Fame thực tế được cộng
     */
    public function reward(Investigation $investigation, int $baseScore = 1000, int $difficulty = 1): int
    {
        $multiplier = self::DIFFICULTY_MULTIPLIER[$difficulty] ?? 1.0;

        // Tính toán Penalty từ bảo bối (Gadgets)
        // Giả sử gadget usage được lưu trong discovered_clues['gadgets_used']
        $gadgetsUsed = $investigation->discovered_clues['gadgets_used'] ?? [];
        $gadgetPenaltyMultiplier = 1.0 - (count($gadgetsUsed) * self::GADGET_ACCURACY_PENALTY);
        
        // Cú chốt: Nếu dùng Voice Changer thì bị chia đôi Fame
        if (in_array('voice_changer', $gadgetsUsed)) {
            $gadgetPenaltyMultiplier *= self::VOICE_CHANGER_PENALTY;
        }

        // Đảm bảo multiplier không âm
        $gadgetPenaltyMultiplier = max(0.1, $gadgetPenaltyMultiplier);

        // Bonus khi còn nhiều attempts: 3 → x1.5, 2 → x1.2, 1 → x1.0
        $attemptBonus = match ($investigation->attempts_left) {
            3 => 1.5,
            2 => 1.2,
            default => 1.0,
        };

        $fameEarned = (int) round($baseScore * $multiplier * $attemptBonus * $gadgetPenaltyMultiplier);

        $investigation->update([
            'status'      => 'solved',
            'fame_earned' => $fameEarned,
            'solved_at'   => now(),
        ]);

        if ($investigation->user) {
            $user = $investigation->user;
            $user->fame += $fameEarned;
            $user->cases_solved += 1;
            $user->streak += 1;
            $user->save();
        }

        // Mastermind Bonus: Nếu thám tử phải dùng bảo bối, tội phạm nhận được 20 prestige/món
        if (!empty($gadgetsUsed)) {
            $case = $investigation->case;
            if ($case && $case->author_id) {
                $author = \App\Models\User::find($case->author_id);
                if ($author) {
                    $author->increment('prestige', count($gadgetsUsed) * 20);
                }
            }
        }

        return $fameEarned;
    }

    /**
     * Trừ 1 lượt đoán khi sai. Trả về số lượt còn lại.
     */
    public function penalize(Investigation $investigation): int
    {
        if ($investigation->attempts_left <= 0) {
            return 0;
        }

        $investigation->decrement('attempts_left');
        $investigation->refresh();

        if ($investigation->attempts_left === 0) {
            $investigation->update(['status' => 'failed']);
            
            if ($investigation->user) {
                // Thua thì mất chuỗi thắng
                $investigation->user->update(['streak' => 0]);
                
                // Đồng thời cộng điểm Prestige cho tác giả vụ án
                $case = $investigation->case;
                if ($case && $case->author_id) {
                    $author = \App\Models\User::find($case->author_id);
                    if ($author) {
                        $author->increment('prestige', 100); // 100 point cho tội phạm khiến thám tử bị loại
                    }
                }
            }
        }

        return $investigation->attempts_left;
    }
}
