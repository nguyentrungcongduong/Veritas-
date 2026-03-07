<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();

        // Count how many detectives were fooled by this criminal's cases
        $fooledCount = DB::table('investigations')
            ->join('cases', 'investigations.case_id', '=', 'cases.id')
            ->where('cases.author_id', $user->id)
            ->where('investigations.status', 'failed')
            ->count();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'alias' => $user->alias ?? $user->name,
            'rank' => $user->rank ?? 'ROOKIE',
            'fame' => $user->fame,
            'prestige' => $user->prestige,
            'solved_count' => $user->cases_solved,
            'created_count' => $user->cases_created,
            'fooled_count' => $fooledCount,
        ]);
    }
}
