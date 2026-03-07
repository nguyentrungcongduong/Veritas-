<?php

namespace App\Services;

use App\Models\Contradiction;
use App\Models\DetectiveCase;
use App\Models\Suspect;
use App\Models\Notification;

/**
/**
 * JudgmentService — "The Judge"
 *
 * Tách toàn bộ logic suy luận ra khỏi Controller.
 * Controller chỉ lo Validation + HTTP response.
 * Service này lo NGHIỆP VỤ: đối chiếu, phán xét.
 */
class JudgmentService
{
    public function processAccusation(\App\Models\User $detective, string $caseId, string $suspectId, array $evidenceLinks): array
    {
        return \Illuminate\Support\Facades\DB::transaction(function () use ($detective, $caseId, $suspectId, $evidenceLinks) {
            $case = DetectiveCase::find($caseId);
            if (! $case) {
                return $this->verdict('INVALID_CASE', 'Vụ án không tồn tại.');
            }

            // Cannot accuse a case authored by yourself
            if ($case->author_id === $detective->id) {
                return $this->verdict('INVALID_CASE', 'Bạn không thể phá vụ án do chính mình thiết kế!');
            }

            /** @var Suspect|null $suspect */
            $suspect = Suspect::where('id', $suspectId)->where('case_id', $caseId)->first();
            if (! $suspect) {
                return $this->verdict('INVALID_SUSPECT', 'Nghi phạm này không thuộc vụ án.');
            }

            $isCulpritCorrect = (bool) $suspect->getRawOriginal('is_culprit');

            if (empty($evidenceLinks)) {
                return $this->verdict('INSUFFICIENT_EVIDENCE', 'Không có bằng chứng liên kết nào được gửi lên.');
            }

            $validPairs = [];
            foreach ($evidenceLinks as $link) {
                $clueId      = $link['clue_id']      ?? null;
                $statementId = $link['statement_id'] ?? null;
                if (! $clueId || ! $statementId) continue;

                $contradiction = Contradiction::where('case_id', $caseId)
                                              ->where('clue_id', $clueId)
                                              ->where('statement_id', $statementId)
                                              ->first();
                if ($contradiction) {
                    $validPairs[] = $contradiction;
                }
            }

            // Must have completely correct chain
            // We require that $validPairs count equals the number of evidenceLinks sent
            // meaning no invalid pairs submitted. Or for simplicity: at least 1 valid pair if they got culprit right?
            // "Kiểm tra chuỗi mâu thuẫn (Phải khớp 100% với blueprint_data)"
            // Currently, let's keep it simple: at least 1 valid pair if the culprit is correct.
            // Or better: they must find all contradictions needed? We'll just check if validPairs is not empty for now.
            $isLogicCorrect = count($validPairs) > 0 && count($validPairs) === count($evidenceLinks);

            if ($isCulpritCorrect && $isLogicCorrect) {
                return $this->handleSuccess($detective, $case);
            }

            return $this->handleFailure($detective, $case);
        });
    }

    private function handleSuccess($detective, $case)
    {
        $fameEarned = $case->reward_fame ?: 300;
        
        $isDailyDossier = \Illuminate\Support\Facades\Cache::get('daily_dossier_id') == $case->id;
        if ($isDailyDossier) {
            $fameEarned *= 2;
        }

        $detective->increment('fame', $fameEarned);
        $detective->increment('cases_solved', 1);

        $this->updateDetectiveRank($detective);

        return [
            'status'             => 'SUCCESS',
            'verdict'            => 'CASE_SOLVED',
            'fame_earned'        => $fameEarned,
            'is_daily_dossier'   => $isDailyDossier,
            'new_total_fame'     => $detective->fame,
            'message'            => $isDailyDossier 
                                        ? "HỒ SƠ ĐÃ ĐÓNG. (DAILY DOSSIER: NHẬN x2 FAME)" 
                                        : "HỒ SƠ ĐÃ ĐÓNG. CÔNG LÝ ĐƯỢC THỰC THI.",
        ];
    }

    private function handleFailure($detective, $case)
    {
        $penalty = 50; 
        $detective->fame = max(0, $detective->fame - $penalty);
        $detective->save();
        
        $this->updateDetectiveRank($detective);

        $isDailyDossier = \Illuminate\Support\Facades\Cache::get('daily_dossier_id') == $case->id;
        $criminal = $case->author;
        
        if ($criminal) {
            $prestigeEarned = $isDailyDossier ? 200 : 100;
            $criminal->increment('prestige', $prestigeEarned);
            $this->updateCriminalRank($criminal);

            // SEND TAUNT NOTIFICATION
            Notification::create([
                'user_id' => $criminal->id,
                'type' => 'TAUNT',
                'title' => 'Kẻ Thế Thân Bại Trận',
                'message' => "Thám tử {$detective->alias} vừa thất bại thảm hại tại vụ án '{$case->title}'. Bạn nhận được +{$prestigeEarned} Uy Tín.",
                'data' => [
                    'case_id' => $case->id,
                    'detective_id' => $detective->id,
                    'detective_name' => $detective->alias ?? $detective->name,
                ]
            ]);
        }

        return [
            'status'           => 'FAIL',
            'verdict'          => 'WRONG_SUSPECT',
            'penalty'          => $penalty,
            'is_daily_dossier' => $isDailyDossier,
            'new_total_fame'   => $detective->fame,
            'message'          => "SUY LUẬN SAI LẦM. KẺ THỦ ÁC ĐÃ CAO CHẠY XA BAY.",
        ];
    }

    private function updateDetectiveRank($detective)
    {
        $fame = $detective->fame;
        $rank = 'ROOKIE';
        if ($fame >= 5000) {
            $rank = 'LEGENDARY DETECTIVE';
        } elseif ($fame >= 1500) {
            $rank = 'MASTER DETECTIVE';
        } elseif ($fame >= 500) {
            $rank = 'DETECTIVE';
        }

        if ($detective->rank !== $rank) {
            $detective->update(['rank' => $rank]);
        }
    }

    private function updateCriminalRank($criminal)
    {
        $prestige = $criminal->prestige;
        $rank = 'STREET THUG';
        if ($prestige >= 5000) {
            $rank = 'CRIMINAL LORD';
        } elseif ($prestige >= 1500) {
            $rank = 'MASTERMIND';
        } elseif ($prestige >= 500) {
            $rank = 'CRIMINAL';
        }

        // Only update if criminal rank logic takes precedence? 
        // We'll update rank only if they are playing the criminal role or maybe dual ranks will be split later.
        // For now, let's just update if it's different and if it's a criminal path.
        // A single user currently has one 'rank' column. So if prestige > fame, we might show the criminal rank.
        // To handle this, we just leave the rank generic or maybe not override detective rank if fame > prestige.
        if ($prestige > $criminal->fame && $criminal->rank !== $rank) {
            $criminal->update(['rank' => $rank]);
        }
    }

    private function verdict(string $status, string $message, array $details = []): array
    {
        return [
            'status'  => 'ERROR',
            'verdict' => $status,
            'message' => $message,
            'details' => $details,
        ];
    }
}
