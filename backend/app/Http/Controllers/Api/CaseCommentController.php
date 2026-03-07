<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CaseComment;
use App\Models\DetectiveCase;
use App\Models\Investigation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CaseCommentController extends Controller
{
    public function index(string $caseId): JsonResponse
    {
        $userId = auth()->id() ?? 1;

        $case = DetectiveCase::find($caseId);
        if (!$case) {
            return response()->json(['message' => 'Vụ án không tồn tại.'], 404);
        }

        if ($case->author_id !== $userId) {
            $inv = Investigation::where('case_id', $caseId)
                ->where('user_id', $userId)
                ->first();

            if (!$inv || ($inv->status !== 'solved' && $inv->status !== 'failed' && $inv->status !== 'SOLVED' && $inv->status !== 'FAILED')) {
                return response()->json(['message' => 'You can\'t talk at the crime scene yet.'], 403);
            }
        }

        $comments = CaseComment::where('case_id', $caseId)
            ->with('user:id,name,alias,rank')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'user_name' => $comment->user?->alias ?? $comment->user?->name ?? 'Anonymous',
                    'user_rank' => $comment->user?->rank ?? 'ROOKIE',
                    'content' => $comment->content,
                    'status_at_comment' => $comment->status_at_comment,
                    'solve_time' => $comment->solve_time,
                    'created_at' => $comment->created_at->diffForHumans(),
                ];
            });

        return response()->json($comments);
    }

    public function store(Request $request, string $caseId): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:1000'],
        ]);

        $userId = auth()->id() ?? 1;

        $case = DetectiveCase::find($caseId);
        if (!$case) {
            return response()->json(['message' => 'Vụ án không tồn tại.'], 404);
        }

        $status = 'UNKNOWN';
        $solveTime = null;

        if ($case->author_id === $userId) {
            $status = 'AUTHOR';
        } else {
            $inv = Investigation::where('case_id', $caseId)
                ->where('user_id', $userId)
                ->first();

            if (!$inv || ($inv->status !== 'solved' && $inv->status !== 'failed' && $inv->status !== 'SOLVED' && $inv->status !== 'FAILED')) {
                return response()->json(['message' => 'You can\'t talk at the crime scene yet.'], 403);
            }

            $status = strtoupper($inv->status); // 'SOLVED' or 'FAILED'
            if ($status === 'SOLVED') {
                $solveTime = $inv->updated_at->diffInSeconds($inv->created_at);
            }
        }

        $comment = CaseComment::create([
            'case_id' => $caseId,
            'user_id' => $userId,
            'content' => $validated['content'],
            'status_at_comment' => $status,
            'solve_time' => $solveTime,
        ]);

        $comment->load('user:id,name,alias,rank');

        return response()->json([
            'message' => 'Ghi chú hiện trường được niêm phong.',
            'comment' => [
                'id' => $comment->id,
                'user_name' => $comment->user?->alias ?? $comment->user?->name ?? 'Anonymous',
                'user_rank' => $comment->user?->rank ?? 'ROOKIE',
                'content' => $comment->content,
                'status_at_comment' => $comment->status_at_comment,
                'solve_time' => $comment->solve_time,
                'created_at' => $comment->created_at->diffForHumans(),
            ]
        ], 201);
    }
}
