<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CaseFeedResource;
use App\Models\DetectiveCase;
use Illuminate\Http\Request;

class CaseController extends Controller
{
    // ────────────────────────────────────────────────────────────────
    // GET /api/v1/cases
    // Trả về danh sách vụ án đã published — không lộ solution
    // ────────────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $cases = DetectiveCase::where('status', 'published')
            ->with('author:id,name')                // Chỉ lấy id + name, không lấy password/email
            ->select([
                'id',
                'title',
                'description',
                'difficulty',
                'reward_fame',
                'author_id',
                'created_at',
            ])
            ->withCount('investigations')           // Hiện "X thám tử đã tham gia"
            ->orderBy('created_at', 'desc')
            ->paginate($request->integer('per_page', 12));

        return CaseFeedResource::collection($cases);
    }
}
