<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contradiction extends Model
{
    protected $fillable = [
        'case_id',
        'clue_id',
        'statement_id',
        'explanation',
    ];

    public function case(): BelongsTo
    {
        return $this->belongsTo(DetectiveCase::class, 'case_id');
    }

    public function clue(): BelongsTo
    {
        return $this->belongsTo(Clue::class, 'clue_id');
    }

    public function statement(): BelongsTo
    {
        return $this->belongsTo(Statement::class, 'statement_id');
    }
}
