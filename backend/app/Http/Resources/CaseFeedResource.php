<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * CaseFeedResource — Dành cho danh sách Agency.
 * Tuyệt đối KHÔNG tiết lộ solution, correct_suspect_id, hay bất kỳ thông tin nhạy cảm nào.
 */
class CaseFeedResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'title'                => $this->title,
            'description'          => $this->description,
            'difficulty'           => (int) ($this->difficulty ?? 1),
            'reward_fame'          => (int) ($this->reward_fame ?? 100),
            'investigations_count' => (int) ($this->investigations_count ?? 0),
            'created_at'           => $this->created_at?->toIso8601String(),
            'author'               => $this->whenLoaded('author', fn () => [
                'id'       => $this->author?->id,
                'username' => $this->author?->name ?? 'Anonymous',
            ]),
        ];
    }
}
