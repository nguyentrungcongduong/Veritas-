<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetectiveCase;
use App\Models\Suspect;
use App\Models\Clue;
use App\Models\Statement;
use App\Models\Contradiction;
use App\Services\ValidationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PlannerController extends Controller
{
    public function __construct(
        private readonly ValidationService $validationService
    ) {}

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/planner
    // ────────────────────────────────────────────────────────────────
    public function create(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'difficulty'  => ['required', 'integer', 'min:1', 'max:5'],
            'reward_fame' => ['nullable', 'integer', 'min:50'],
        ]);

        $case = DetectiveCase::create([
            'title'        => $validated['title'],
            'description'  => $validated['description'],
            'difficulty'   => $validated['difficulty'],
            'reward_fame'  => $validated['reward_fame'] ?? ($validated['difficulty'] * 100),
            'status'       => 'draft',
            'author_id'    => null, // TODO: auth()->id()
        ]);

        return response()->json([
            'id'          => $case->id,
            'title'       => $case->title,
            'description' => $case->description,
            'difficulty'  => $case->difficulty,
            'reward_fame' => $case->reward_fame,
            'status'      => $case->status,
        ], 201);
    }

    // ────────────────────────────────────────────────────────────────
    // GET /api/v1/planner/{uuid}
    // ────────────────────────────────────────────────────────────────
    public function show(string $caseId): JsonResponse
    {
        $case = DetectiveCase::with([
            'suspects.statements',
            'clues',
            'contradictions',
        ])->find($caseId);

        if (!$case) {
            return response()->json(['message' => 'Vụ án không tồn tại.'], 404);
        }

        return response()->json([
            'id'                   => $case->id,
            'title'                => $case->title,
            'description'          => $case->description,
            'difficulty'           => $case->difficulty,
            'reward_fame'          => $case->reward_fame,
            'status'               => $case->status,
            'blueprint_data'       => $case->blueprint_data,
            'correct_suspect_id'   => $case->correct_suspect_id,
            'is_solved_by_creator' => $case->is_solved_by_creator,
            'suspects' => $case->suspects->map(fn ($s) => [
                'id'         => $s->id,
                'name'       => $s->name,
                'bio'        => $s->bio,
                'is_culprit' => (bool) $s->is_culprit,
                'statements' => $s->statements->map(fn ($st) => [
                    'id'              => $st->id,
                    'content'         => $st->content,
                    'type'            => $st->type,
                    'discovery_tier'  => $st->discovery_tier,
                    'trigger_keyword' => $st->trigger_keyword,
                ]),
            ]),
            'clues' => $case->clues->map(fn ($c) => [
                'id'              => $c->id,
                'name'            => $c->name,
                'description'     => $c->description,
                'type'            => $c->type,
                'discovery_tier'  => $c->discovery_tier,
                'trigger_keyword' => $c->trigger_keyword,
            ]),
            'contradictions' => $case->contradictions->map(fn ($con) => [
                'id'           => $con->id,
                'clue_id'      => $con->clue_id,
                'statement_id' => $con->statement_id,
                'explanation'  => $con->explanation,
            ]),
        ]);
    }

    // ────────────────────────────────────────────────────────────────
    // PATCH /api/v1/planner/{uuid}/save
    // ────────────────────────────────────────────────────────────────
    public function save(Request $request, string $caseId): JsonResponse
    {
        $case = DetectiveCase::find($caseId);
        if (!$case) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate([
            'blueprint_data'     => ['nullable', 'array'],
            'title'              => ['sometimes', 'string', 'max:255'],
            'description'        => ['sometimes', 'string'],
            'difficulty'         => ['sometimes', 'integer', 'min:1', 'max:5'],
            'reward_fame'        => ['sometimes', 'integer', 'min:50'],
            'correct_suspect_id' => ['nullable', 'string'],
        ]);

        $case->update($validated);

        return response()->json([
            'status'   => 'saved',
            'saved_at' => now()->toIso8601String(),
        ]);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/planner/{uuid}/suspects
    // ────────────────────────────────────────────────────────────────
    public function addSuspect(Request $request, string $caseId): JsonResponse
    {
        $case = DetectiveCase::find($caseId);
        if (!$case) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'bio'        => ['nullable', 'string'],
            'is_culprit' => ['boolean'],
        ]);

        $isCulprit = $validated['is_culprit'] ?? false;

        // Reset existing culprit
        if ($isCulprit) {
            $case->suspects()->update(['is_culprit' => false]);
        }

        $suspect = Suspect::create([
            'case_id'    => $caseId,
            'name'       => $validated['name'],
            'bio'        => $validated['bio'] ?? '',
            'is_culprit' => $isCulprit,
        ]);

        // Sync correct_suspect_id on case
        if ($isCulprit) {
            $case->update(['correct_suspect_id' => $suspect->id]);
        }

        return response()->json([
            'id'         => $suspect->id,
            'name'       => $suspect->name,
            'bio'        => $suspect->bio,
            'is_culprit' => (bool) $suspect->is_culprit,
        ], 201);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/planner/{uuid}/clues
    // ────────────────────────────────────────────────────────────────
    public function addClue(Request $request, string $caseId): JsonResponse
    {
        $case = DetectiveCase::find($caseId);
        if (!$case) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate([
            'name'            => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'type'            => ['required', 'in:physical,digital,testimony'],
            'discovery_tier'  => ['sometimes', 'integer', 'min:0', 'max:3'],
            'trigger_keyword' => ['nullable', 'string', 'max:100'],
        ]);

        $clue = Clue::create([
            'case_id'         => $caseId,
            'name'            => $validated['name'],
            'description'     => $validated['description'] ?? '',
            'type'            => $validated['type'],
            'discovery_tier'  => $validated['discovery_tier'] ?? 0,
            'trigger_keyword' => $validated['trigger_keyword'] ?? null,
        ]);

        return response()->json([
            'id'   => $clue->id,
            'name' => $clue->name,
            'type' => $clue->type,
        ], 201);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/planner/{uuid}/statements
    // ────────────────────────────────────────────────────────────────
    public function addStatement(Request $request, string $caseId): JsonResponse
    {
        $validated = $request->validate([
            'suspect_id'      => ['required', 'string'],   // UUID
            'content'         => ['required', 'string'],
            'type'            => ['required', 'in:truth,lie'],
            'discovery_tier'  => ['sometimes', 'integer', 'min:0', 'max:3'],
            'trigger_keyword' => ['nullable', 'string', 'max:100'],
        ]);

        $statement = Statement::create([
            'suspect_id'      => $validated['suspect_id'],
            'content'         => $validated['content'],
            'type'            => $validated['type'],
            'discovery_tier'  => $validated['discovery_tier'] ?? 0,
            'trigger_keyword' => $validated['trigger_keyword'] ?? null,
        ]);

        return response()->json([
            'id'      => $statement->id,
            'content' => $statement->content,
            'type'    => $statement->type,
        ], 201);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/planner/{uuid}/contradictions
    // ────────────────────────────────────────────────────────────────
    public function addContradiction(Request $request, string $caseId): JsonResponse
    {
        $validated = $request->validate([
            'clue_id'      => ['required', 'integer'],
            'statement_id' => ['required', 'integer'],
            'explanation'  => ['required', 'string'],
        ]);

        $contradiction = Contradiction::create([
            'case_id'      => $caseId,
            'clue_id'      => $validated['clue_id'],
            'statement_id' => $validated['statement_id'],
            'explanation'  => $validated['explanation'],
        ]);

        return response()->json(['id' => $contradiction->id], 201);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/planner/{uuid}/validate
    // Graph-based "Isolation Check"
    // ────────────────────────────────────────────────────────────────
    public function validate(string $caseId): JsonResponse
    {
        $case = DetectiveCase::with(['suspects.statements', 'clues', 'contradictions'])->find($caseId);
        if (!$case) return response()->json(['message' => 'Not found'], 404);

        $errors  = [];
        $passed  = [];

        // ── Check 1: Ít nhất 2 suspects ─────────────────────────────
        $suspectCount = $case->suspects->count();
        if ($suspectCount < 2) {
            $errors[] = "Cần ít nhất 2 nghi phạm (hiện có {$suspectCount}).";
        } else {
            $passed[] = "✓ Suspects: {$suspectCount} nghi phạm";
        }

        // ── Check 2: Có đúng 1 culprit ──────────────────────────────
        $culprits = $case->suspects->where('is_culprit', true);
        if ($culprits->count() === 0) {
            $errors[] = "Chưa chỉ định Hung thủ (Culprit).";
        } elseif ($culprits->count() > 1) {
            $errors[] = "Chỉ được 1 Hung thủ, hiện có {$culprits->count()}.";
        } else {
            $passed[] = "✓ Culprit: {$culprits->first()->name}";
        }

        // ── Check 3: Ít nhất 1 clue ─────────────────────────────────
        $clueCount = $case->clues->count();
        if ($clueCount === 0) {
            $errors[] = "Cần ít nhất 1 manh mối (Clue).";
        } else {
            $passed[] = "✓ Clues: {$clueCount} manh mối";
        }

        // ── Check 4: Graph Isolation — mỗi innocent cần 1 contradiction
        // Scan blueprint_data nodes/edges nếu có, otherwise dùng DB
        $graphErrors = $this->runIsolationCheck($case);
        $errors = array_merge($errors, $graphErrors);

        // ── Check 5: Self-Solve completed ───────────────────────────
        if (!$case->is_solved_by_creator) {
            $errors[] = "Bạn phải tự phá được vụ án của mình trong The Self-Solve trước khi Publish!";
        } else {
            $passed[] = "✓ Self-Solve: Đã xác nhận";
        }

        $isValid = empty($errors);

        return response()->json([
            'valid'   => $isValid,
            'passed'  => $passed,
            'errors'  => $errors,
            'message' => $isValid
                ? 'Logic graph hợp lệ. Operation sẵn sàng triển khai!'
                : implode(' | ', $errors),
        ]);
    }

    /**
     * Isolation Check Algorithm — Graph-based
     *
     * Rule: Every INNOCENT suspect must have at least one edge
     * connecting a Clue node → their Statement node (contradiction).
     * This ensures detectives can eliminate all innocents logically.
     */
    private function runIsolationCheck(DetectiveCase $case): array
    {
        $errors = [];

        // Try graph-based check first (blueprint_data)
        $blueprintData = $case->blueprint_data;

        if (!empty($blueprintData['nodes']) && !empty($blueprintData['edges'])) {
            $nodes = $blueprintData['nodes'];
            $edges = $blueprintData['edges'];

            // Index nodes by id
            $nodeById = [];
            foreach ($nodes as $node) {
                $nodeById[$node['id']] = $node;
            }

            // Find innocent suspects (not culprit)
            $innocents = array_filter($nodes, fn($n) =>
                $n['type'] === 'suspect' && !($n['data']['is_culprit'] ?? false)
            );

            foreach ($innocents as $innocent) {
                $suspectNodeId = $innocent['id'];
                $suspectName   = $innocent['data']['label'] ?? $innocent['data']['name'] ?? 'Unknown';
                $hasContradiction = false;

                // For each edge, check if it connects Clue → Statement of this suspect
                foreach ($edges as $edge) {
                    $sourceNode = $nodeById[$edge['source']] ?? null;
                    $targetNode = $nodeById[$edge['target']] ?? null;

                    if (!$sourceNode || !$targetNode) continue;

                    // Source must be a clue, target must be a statement
                    if ($sourceNode['type'] !== 'clue' || $targetNode['type'] !== 'statement') continue;

                    // Target statement must belong to this innocent suspect
                    $stmtSuspectId = $targetNode['data']['suspectId']
                        ?? $targetNode['data']['suspect_id']
                        ?? null;

                    // Match by node ID prefix or dbId
                    $stmtDbSuspectId = $targetNode['data']['dbSuspectId'] ?? null;
                    $innocentDbId    = $innocent['data']['dbId'] ?? null;

                    $matchByNodeRef = $stmtSuspectId === $suspectNodeId;
                    $matchByDbId    = $stmtDbSuspectId && $innocentDbId && $stmtDbSuspectId === $innocentDbId;
                    // Also check if the statement node id contains the suspect node id
                    $matchByPrefix  = str_starts_with($targetNode['id'], "stmt-") &&
                                      str_contains($targetNode['id'], substr($suspectNodeId, -8));

                    if ($matchByNodeRef || $matchByDbId) {
                        $hasContradiction = true;
                        break;
                    }
                }

                if (!$hasContradiction) {
                    $errors[] = "Nghi phạm [{$suspectName}] chưa có bằng chứng ngoại phạm. Thám tử không thể loại trừ!";
                }
            }

            return $errors;
        }

        // Fallback: DB-based check (contradictions table)
        $culprit   = $case->suspects->firstWhere('is_culprit', true);
        $innocents = $case->suspects->where('is_culprit', false);

        foreach ($innocents as $innocent) {
            $hasContradiction = false;
            foreach ($innocent->statements as $statement) {
                $linkedToClue = $case->contradictions
                    ->where('statement_id', $statement->id)
                    ->isNotEmpty();
                if ($linkedToClue) {
                    $hasContradiction = true;
                    break;
                }
            }

            if (!$hasContradiction) {
                $errors[] = "Nghi phạm [{$innocent->name}] chưa có Contradiction. Thám tử không thể loại trừ!";
            }
        }

        return $errors;
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/planner/{uuid}/self-solve
    // Criminal tự phá án — gửi lên suspect_id mà họ cho là Hung thủ
    // ────────────────────────────────────────────────────────────────
    public function selfSolve(Request $request, string $caseId): JsonResponse
    {
        $case = DetectiveCase::find($caseId);
        if (!$case) return response()->json(['message' => 'Not found'], 404);

        $validated = $request->validate([
            'accused_suspect_id' => ['required', 'string'],
        ]);

        // Tìm culprit trong DB
        $actualCulprit = $case->suspects()->where('is_culprit', true)->first();

        if (!$actualCulprit) {
            return response()->json([
                'correct' => false,
                'message' => 'Vụ án chưa có Hung thủ được chỉ định!',
            ], 422);
        }

        $isCorrect = $validated['accused_suspect_id'] === $actualCulprit->id
                  || $validated['accused_suspect_id'] === $case->correct_suspect_id;

        if ($isCorrect) {
            $case->update(['is_solved_by_creator' => true]);
        }

        return response()->json([
            'correct'        => $isCorrect,
            'culprit_name'   => $isCorrect ? $actualCulprit->name : null,
            'message'        => $isCorrect
                ? "✓ Chính xác! {$actualCulprit->name} chính là Hung thủ. Self-Solve hoàn thành!"
                : "✗ Sai rồi. Chính tội phạm giỏi nhất cũng phải hiểu rõ kế hoạch của mình.",
        ]);
    }

    // ────────────────────────────────────────────────────────────────
    // POST /api/v1/planner/{uuid}/publish
    // ────────────────────────────────────────────────────────────────
    public function publish(string $caseId): JsonResponse
    {
        $case = DetectiveCase::with(['suspects.statements', 'clues', 'contradictions'])->find($caseId);
        if (!$case) return response()->json(['message' => 'Not found'], 404);

        // Re-run full validation
        $validateResponse = $this->validate($caseId);
        $validateData     = json_decode($validateResponse->getContent(), true);

        if (!$validateData['valid']) {
            return response()->json([
                'status'  => 'BLOCKED',
                'message' => $validateData['message'],
                'errors'  => $validateData['errors'],
            ], 422);
        }

        $case->update(['status' => 'published']);

        return response()->json([
            'status'  => 'PUBLISHED',
            'success' => true,
            'message' => '💀 Vụ án đã lên sàn. Thám tử đang đến...',
            'case_id' => $caseId,
        ]);
    }
}
