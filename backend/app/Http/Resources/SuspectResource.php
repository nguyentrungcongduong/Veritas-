<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * SuspectResource — TUYỆT ĐỐI không trả về is_culprit.
 *
 * Architect note: Logic Decoupling.
 * Thám tử chỉ thấy tên, bio, avatar.
 * is_culprit chỉ tồn tại server-side trong JudgmentService.
 */
class SuspectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'bio'        => $this->bio,
            'statements' => StatementResource::collection($this->whenLoaded('statements')),
            // KHÔNG có is_culprit ở đây — bao giờ cũng vậy
        ];
    }
}
