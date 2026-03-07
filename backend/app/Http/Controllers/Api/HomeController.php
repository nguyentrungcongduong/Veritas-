<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetectiveCase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Get trending/open cases for the homepage feed.
     */
    public function trending(Request $request): JsonResponse
    {
        $query = DetectiveCase::where('status', 'published')
            ->orderBy('created_at', 'desc');

        if ($request->filled('difficulty') && $request->difficulty !== 'all') {
            $query->where('difficulty', (int) $request->difficulty);
        }

        $paginator = $query->paginate(5);

        $cases = collect($paginator->items())->map(function ($case) {
            return [
                'id'          => $case->id,
                'title'       => mb_strtoupper($case->title),
                'description' => mb_strlen($case->description) > 100 ? mb_substr($case->description, 0, 100) . '...' : $case->description,
                'date'        => $case->created_at->format('M d, Y'),
                'difficulty'  => $case->difficulty,
                'solve_rate'  => rand(10, 80) . '%', // Mock data
                'reward'      => rand(500, 2000),    // Mock data
            ];
        });

        return response()->json([
            'bulletin_date' => now()->format('l, F j, Y'),
            'cases'         => $cases,
            'pagination'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
            ],
            'stats'         => [
                'cases_solved' => 12409, // Mock
                'most_wanted'  => 452,   // Mock
                'active_agents'=> 1023,  // Mock
            ]
        ]);
    }
}
