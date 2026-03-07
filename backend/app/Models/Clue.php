<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Clue extends Model
{
    protected $fillable = [
        'case_id',
        'name',
        'description',
        'type',
        'discovery_tier',
        'trigger_keyword',
    ];

    public function case(): BelongsTo
    {
        return $this->belongsTo(DetectiveCase::class, 'case_id');
    }
}
