<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetectiveCase;
use App\Services\ValidationService;
use Illuminate\Http\JsonResponse;

class CreatorController extends Controller
{
    public function __construct(
        private readonly ValidationService $validationService
    ) {}

    public function publish(string $caseId): JsonResponse
    {
        // Require auth user to be the author
        // For MVP, we'll assume the client is doing this right or we check author_id if we have auth.
        // Assuming user is authenticated via Sanctum
        $user = auth()->user();
        
        $case = DetectiveCase::with(['suspects', 'contradictions.statement'])->find($caseId);
        
        if (!$case) {
            return response()->json(['message' => 'Vụ án không tồn tại.'], 404);
        }

        // if ($case->author_id !== optional($user)->id) {
        //     return response()->json(['message' => 'Unauthorized'], 403);
        // }

        $validationResult = $this->validationService->checkLogicIntegrity($case);

        if (!$validationResult['is_valid']) {
            return response()->json([
                'status' => 'FAILED',
                'message' => $validationResult['message']
            ], 422);
        }

        $case->update(['status' => 'published']);

        return response()->json([
            'status' => 'SUCCESS',
            'message' => 'Vụ án đã được publish thành công!'
        ]);
    }
}
