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

        // Bonus khi còn nhiều attempts: 3 → x1.5, 2 → x1.2, 1 → x1.0
        $attemptBonus = match ($investigation->attempts_left) {
            3 => 1.5,
            2 => 1.2,
            default => 1.0,
        };

        $fameEarned = (int) round($baseScore * $multiplier * $attemptBonus);

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

        // Penalty cho Criminal (tạm đơn giản: không cộng prestige nếu solve ngay trong lượt đầu)
        // Creator prestige logic sẽ nằm ở bên ngoài hoặc khi criminal check.

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
