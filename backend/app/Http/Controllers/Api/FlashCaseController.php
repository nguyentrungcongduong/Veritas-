<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FlashCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FlashCaseController extends Controller
{
    /**
     * List all flash cases.
     */
    public function index(): JsonResponse
    {
        $cases = FlashCase::with('author:id,alias')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json($cases);
    }

    /**
     * Store a new flash case (The Flash Creator).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title'         => ['required', 'string', 'max:255'],
            'description'   => ['required', 'string'],
            'image_url'     => ['nullable', 'url'],
            'options'       => ['required', 'array', 'size:3'],
            'options.*'     => ['required', 'string', 'max:255'],
            'correct_index' => ['required', 'integer', 'min:0', 'max:2'],
            'explanation'   => ['nullable', 'string'],
        ]);

        $flashCase = FlashCase::create([
            ...$validated,
            'author_id' => Auth::id(),
        ]);

        return response()->json([
            'message' => 'Flash case Published successfully!',
            'data'    => $flashCase,
        ], 201);
    }

    /**
     * Show a specific flash case.
     */
    public function show(string $id): JsonResponse
    {
        $flashCase = FlashCase::with('author:id,alias')->findOrFail($id);
        return response()->json($flashCase);
    }

    /**
     * Solve a flash case.
     */
    public function solve(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'selected_index' => ['required', 'integer', 'min:0', 'max:2'],
        ]);

        $flashCase = FlashCase::findOrFail($id);
        $isCorrect = $request->selected_index === $flashCase->correct_index;

        if ($isCorrect) {
            $flashCase->increment('solved_count');
            // Reward low fame for flash cases
            $user = Auth::user();
            if ($user) {
                $user->increment('fame', 50);
            }
        } else {
            $flashCase->increment('failed_count');
        }

        return response()->json([
            'correct'     => $isCorrect,
            'explanation' => $flashCase->explanation,
            'fame_earned' => $isCorrect ? 50 : 0,
        ]);
    }
}
