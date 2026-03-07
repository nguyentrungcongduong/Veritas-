<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DetectiveCase;
use App\Http\Resources\CaseResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DailyDossierController extends Controller
{
    /**
     * Get the current Daily Dossier case.
     */
    public function show(): JsonResponse
    {
        $dossierId = Cache::get('daily_dossier_id');

        if (!$dossierId) {
            return response()->json(null);
        }

        $case = DetectiveCase::with(['author'])
            ->withCount(['investigations as failed_count' => function ($query) {
                $query->where('status', 'failed');
            }])
            ->find($dossierId);

        if (!$case) {
            return response()->json(null);
        }

        return response()->json([
            'case' => new CaseResource($case),
            'failed_count' => $case->failed_count,
        ]);
    }
}
