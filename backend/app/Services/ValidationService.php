<?php

namespace App\Services;

use App\Models\DetectiveCase;

class ValidationService
{
    /**
     * Kiểm tra nhanh xem Logic của vụ án có toàn vẹn không.
     * Tội phạm không thể Publish một vụ án "lỗi", không có đường dẫn tới Hung Thủ.
     */
    public function checkLogicIntegrity(DetectiveCase $case): array
    {
        // Require it to be solved once by creator!
        if (!$case->is_solved_by_creator) {
            return [
                'is_valid' => false,
                'message'  => 'Bạn phải tự phá được vụ án của mình trong The Self-Solve trước khi Publish!'
            ];
        }

        // Must have at least one valid contradiction for the actual culprit
        // (Assuming the actual culprit logic is embedded in the db contradictions mapped to suspects)
        $hasCulprit = $case->suspects()->where('is_culprit', true)->exists();
        if (!$hasCulprit) {
             return [
                 'is_valid' => false,
                 'message'  => 'Chưa chỉ định Hung thủ hợp lệ!'
             ];
        }
        
        // We'll trust the database logic. The real test is if the contradictions table holds connections to the true culprit.
        $culprit = $case->suspects()->where('is_culprit', true)->first();
        
        $hasContradictionForCulprit = $case->contradictions()
            ->whereHas('statement', function($q) use ($culprit) {
                $q->where('suspect_id', $culprit->id);
            })->exists();

        if (!$hasContradictionForCulprit) {
            return [
                'is_valid' => false,
                'message'  => 'Cần ít nhất một mâu thuẫn đánh thẳng vào Lời Khai của Hung Thủ!'
            ];
        }

        // Đảm bảo mọi nghi phạm VÔ TỘI đều có ít nhất 1 dây mâu thuẫn chỉ vào (để thám tử loại trừ)
        $innocentSuspects = $case->suspects()->where('is_culprit', false)->get();
        foreach ($innocentSuspects as $suspect) {
             $hasContradiction = $case->contradictions()->whereHas('statement', function($q) use ($suspect) {
                 $q->where('suspect_id', $suspect->id);
             })->exists();
             
             if (!$hasContradiction) {
                 return [
                     'is_valid' => false,
                     'message'  => "Vụ án chưa hợp lệ: Nghi phạm {$suspect->name} chưa có mâu thuẫn nào để thám tử loại trừ!"
                 ];
             }
        }

        return [
            'is_valid' => true,
            'message'  => 'Logic vụ án Toàn vẹn. Sẵn sàng Publish.'
        ];
    }
}
