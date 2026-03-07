<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'title'       => $this->title,
            'description' => $this->description,
            'status'      => $this->status,
            'suspects'    => SuspectResource::collection($this->whenLoaded('suspects')),
            'clues'       => ClueResource::collection($this->whenLoaded('clues')),
        ];
    }
}
