<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CaseResource;
use App\Http\Resources\ClueResource;
use App\Http\Resources\StatementResource;
use App\Http\Resources\SuspectResource;
use App\Models\DetectiveCase;
use App\Models\Investigation;
use App\Services\DiscoveryService;
use App\Services\FameService;
use App\Services\JudgmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InvestigationController extends Controller
{
    public function __construct(
        private readonly JudgmentService  $judgmentService,
        private readonly FameService      $fameService,
        private readonly DiscoveryService $discoveryService,
    ) {}

    // ────────────────────────────────────────────────────────────────
    // GET /api/v1/cases/{case_id}
    // Trả về case data ĐÃ LỌC theo discovery progress
    // ────────────────────────────────────────────────────────────────
    public function show(string $caseId): JsonResponse
    {
        $case = DetectiveCase::with(['suspects', 'clues'])->find($caseId);

        if (! $case) {
            return response()->json(['message' => 'Vụ án không tồn tại.'], 404);
        }

        // Lấy investigation (hoặc null = guest chưa start)
        $investigation = Investigation::where('case_id', $caseId)
            ->where('user_id', auth('sanctum')->id())
            ->first();

        // Lọc data theo discovery progress
        $discovered = $this->discoveryService->getCaseDataForInvestigation($case, $investigation);

        // Build suspects với chỉ visible statements
        $suspectsData = $case->suspects->map(function ($suspect) use ($discovered) {
            $visibleStatements = $discovered['visible_statements']->get($suspect->id, collect());
            return [
                'id'         => $suspect->id,
                'name'       => $suspect->name,
                'bio'        => $suspect->bio,
                'statements' => StatementResource::collection($visibleStatements),
            ];
        });

        return response()->json([
            'id'                => $case->id,
            'title'             => $case->title,
            'description'       => $case->description,
            'status'            => $case->status,
            'suspects'          => $suspectsData,
            'clues'             => ClueResource::collection($discovered['visible_clues']),
            // Discovery metadata cho UI redacted count
            'discovery'         => [
                'hidden_clues'      => $discovered['hidden_clues'],
                'hidden_statements' => $discovered['hidden_statements'],
                'total_clues'       => $discovered['total_clues'],
                'total_statements'  => $discovered['total_statements'],
            ],
            'investigation'     => $investigation ? [
                'id'             => $investigation->id,
                'status'         => $investigation->status,
                'attempts_left'  => $investigation->attempts_left,
            ] : null,
        ]);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/investigations/{case_id}/start
    // ────────────────────────────────────────────────────────────────
    public function start(string $caseId): JsonResponse
    {
        $case = DetectiveCase::find($caseId);
        if (! $case) {
            return response()->json(['message' => 'Vụ án không tồn tại.'], 404);
        }

        $userId = auth('sanctum')->id();
        $investigation = Investigation::firstOrCreate(
            ['case_id' => $caseId, 'user_id' => $userId],
            ['attempts_left' => 3, 'status' => 'investigating', 'discovered_clues' => [
                'clue_ids'          => [],
                'statement_ids'     => [],
                'unlocked_keywords' => [],
            ]]
        );

        return response()->json([
            'investigation_id' => $investigation->id,
            'case_id'          => $caseId,
            'status'           => $investigation->status,
            'attempts_left'    => $investigation->attempts_left,
        ]);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/investigations/{case_id}/unlock
    // Discovery Engine — unlock hidden clues/statements by keyword
    // ────────────────────────────────────────────────────────────────
    public function unlock(Request $request, string $caseId): JsonResponse
    {
        $validated = $request->validate([
            'keyword' => ['required', 'string', 'max:100'],
        ]);

        $case = DetectiveCase::with('suspects')->find($caseId);
        if (! $case) {
            return response()->json(['message' => 'Vụ án không tồn tại.'], 404);
        }

        $userId = auth('sanctum')->id();
        $investigation = Investigation::firstOrCreate(
            ['case_id' => $caseId, 'user_id' => $userId],
            ['attempts_left' => 3, 'status' => 'investigating', 'discovered_clues' => [
                'clue_ids' => [], 'statement_ids' => [], 'unlocked_keywords' => [],
            ]]
        );

        if ($investigation->isExhausted() || $investigation->isSolved()) {
            return response()->json([
                'message' => 'Cuộc điều tra đã kết thúc.',
            ], 403);
        }

        $result = $this->discoveryService->unlockByKeyword(
            $case,
            $investigation,
            $validated['keyword']
        );

        return response()->json($result);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/investigations/{case_id}/accuse
    // "The Judgment" + Penalty
    // ────────────────────────────────────────────────────────────────
    public function accuse(Request $request, string $caseId): JsonResponse
    {
        $validated = $request->validate([
            'suspect_id'                    => ['required', 'uuid'],
            'evidence_links'                => ['required', 'array', 'min:1'],
            'evidence_links.*.clue_id'      => ['required', 'integer'],
            'evidence_links.*.statement_id' => ['required', 'integer'],
        ]);

        $user = $request->user();

        $investigation = Investigation::firstOrCreate(
            ['case_id' => $caseId, 'user_id' => $user->id],
            ['attempts_left' => 3, 'status' => 'investigating']
        );

        if ($investigation->isExhausted()) {
            return response()->json([
                'verdict'       => 'OUT_OF_ATTEMPTS',
                'status'        => 'ERROR',
                'message'       => '💀 Bạn đã hết lượt suy luận! Vụ án này đã thất bại.',
                'attempts_left' => 0,
            ], 403);
        }

        if ($investigation->isSolved()) {
            return response()->json([
                'verdict' => 'ALREADY_SOLVED',
                'status'  => 'ERROR',
                'message' => '✅ Vụ án này đã được phá giải trước đó.',
            ], 400);
        }

        // processAccusation handles rank/fame logic and returns an array with status, penalty/fame_earned
        $result = $this->judgmentService->processAccusation(
            $user,
            $caseId,
            $validated['suspect_id'],
            $validated['evidence_links']
        );

        if ($result['status'] === 'SUCCESS') {
            $investigation->update([
                'status' => 'solved',
                'fame_earned' => $result['fame_earned'],
                'solved_at' => now(),
            ]);

            return response()->json([
                ...$result,
                'attempts_used' => 3 - $investigation->attempts_left + 1,
            ]);
        }
        
        if ($result['status'] === 'FAIL') {
            $investigation->decrement('attempts_left');
            $investigation->refresh();

            if ($investigation->attempts_left <= 0) {
                $investigation->update(['status' => 'failed']);
            }

            return response()->json([
                ...$result,
                'attempts_left' => $investigation->attempts_left,
                'hint'          => $investigation->attempts_left <= 0
                    ? '💀 Đây là lần đoán cuối cùng và bạn đã thua!'
                    : "⚠️ Còn {$investigation->attempts_left} lần đoán. Hãy nghĩ kỹ hơn.",
            ], 422);
        }

        return response()->json($result, 400);
    }

    // ────────────────────────────────────────────────────────────────
    // GET /api/v1/cases/{case_id}/reveal
    // "The Post-Mortem" — Full truth revealed after solve or fail
    // ────────────────────────────────────────────────────────────────
    public function reveal(string $caseId): JsonResponse
    {
        $case = DetectiveCase::with([
            'suspects.statements',
            'clues',
            'contradictions.clue',
            'contradictions.statement.suspect',
        ])->find($caseId);

        if (!$case) {
            return response()->json(['message' => 'Vụ án không tồn tại.'], 404);
        }

        // Find the investigation to determine outcome
        $investigation = Investigation::where('case_id', $caseId)
            ->where('user_id', auth('sanctum')->id())
            ->first();

        $isSolved   = $investigation?->status === 'solved';
        $isExhausted = $investigation?->isExhausted() ?? false;

        // Culprit
        $culprit = $case->suspects->firstWhere('is_culprit', true);

        // Criminal gloat messages
        $gloatMessages = [
            'win' => [
                "Tôi phải thừa nhận — bạn sắc bén hơn tôi nghĩ, Thám tử. Badge Log đó đáng lẽ đã chôn vùi tất cả.",
                "Ấn tượng. Thật sự ấn tượng. Nhưng đừng tưởng lần sau sẽ dễ như vậy.",
                "Bạn đã phá được án của tôi. Nhưng tôi sẽ trở lại với một kế hoạch hoàn hảo hơn.",
                "Trò chơi kết thúc — lần này. Tôi sẽ nhớ tên bạn, Detective.",
                "Kế hoạch không hoàn hảo. Nhưng lần sau, tôi sẽ không để lại dấu vết nào cả.",
            ],
            'lose' => [
                "Better luck next time, Detective. You missed the Surgeon by a heartbeat.",
                "Cảm ơn vì đã thử sức. Vụ án này sẽ mãi là một bí ẩn với bạn.",
                "Yếu quá. Tôi đã để lại đủ manh mối — thế mà bạn vẫn không tìm ra.",
                "Thám tử à, khi bạn tìm ra sự thật, tôi đã ở nơi khác từ lâu rồi.",
                "Tôi thiết kế vụ án này để vừa đủ phức tạp. Đủ để vượt qua bạn.",
            ],
        ];

        $gloatKey = $isSolved ? 'win' : 'lose';
        $gloat    = $gloatMessages[$gloatKey][array_rand($gloatMessages[$gloatKey])];

        // Build full suspect data with truth revealed
        $suspectsData = $case->suspects->map(fn ($s) => [
            'id'          => $s->id,
            'name'        => $s->name,
            'bio'         => $s->bio,
            'is_culprit'  => (bool) $s->is_culprit,
            'role_label'  => $s->is_culprit ? 'THE CULPRIT' : 'INNOCENT',
            'statements'  => $s->statements->map(fn ($st) => [
                'id'      => $st->id,
                'content' => $st->content,
                'type'    => $st->type,   // truth | lie — revealed!
                'type_label' => $st->type === 'lie' ? '⚠ LIE' : '✓ TRUTH',
            ]),
        ]);

        // Build contradiction graph (crim's handiwork)
        $contradictions = $case->contradictions->map(fn ($c) => [
            'id'          => $c->id,
            'clue_id'     => $c->clue_id,
            'clue_name'   => $c->clue?->name,
            'statement_id'=> $c->statement_id,
            'statement'   => $c->statement?->content,
            'suspect_name'=> $c->statement?->suspect?->name,
            'explanation' => $c->explanation,
            'is_culprit_statement' => (bool) ($c->statement?->suspect?->is_culprit ?? false),
        ]);

        return response()->json([
            'case_id'         => $case->id,
            'title'           => $case->title,
            'description'     => $case->description,
            'culprit'         => $culprit ? [
                'id'   => $culprit->id,
                'name' => $culprit->name,
                'bio'  => $culprit->bio,
            ] : null,
            'suspects'        => $suspectsData,
            'clues'           => $case->clues->map(fn ($c) => [
                'id'          => $c->id,
                'name'        => $c->name,
                'description' => $c->description,
                'type'        => $c->type,
            ]),
            'contradictions'  => $contradictions,
            'blueprint_data'  => $case->blueprint_data,
            'outcome'         => [
                'solved'      => $isSolved,
                'exhausted'   => $isExhausted,
                'status'      => $isSolved ? 'SOLVED' : ($isExhausted ? 'FAILED' : 'VIEWING'),
            ],
            'criminal_gloat'  => $gloat,
        ]);
    }
}

