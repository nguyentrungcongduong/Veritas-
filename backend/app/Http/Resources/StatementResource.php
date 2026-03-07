<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StatementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'content'        => $this->content,
            'discovery_tier' => $this->discovery_tier,
            // KHÔNG có 'type' (truth/lie)
            // KHÔNG có 'trigger_keyword'
        ];
    }
}
