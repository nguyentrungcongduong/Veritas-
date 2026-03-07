<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'description'    => $this->description,
            'type'           => $this->type,
            'discovery_tier' => $this->discovery_tier,
            // trigger_keyword ẩn khỏi API — chỉ dùng server-side
        ];
    }
}
