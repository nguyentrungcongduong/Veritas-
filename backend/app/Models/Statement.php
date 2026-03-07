<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Statement extends Model
{
    protected $fillable = [
        'suspect_id',
        'content',
        'type',
        'discovery_tier',
        'trigger_keyword',
    ];

    public function suspect(): BelongsTo
    {
        return $this->belongsTo(Suspect::class, 'suspect_id');
    }
}
