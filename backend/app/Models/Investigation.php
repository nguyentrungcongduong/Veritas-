<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Investigation extends Model
{
    protected $fillable = [
        'user_id',
        'case_id',
        'status',
        'attempts_left',
        'fame_earned',
        'discovered_clues',
        'board_state',
        'solved_at',
    ];

    protected $casts = [
        'discovered_clues' => 'array',
        'board_state'      => 'array',
        'solved_at'        => 'datetime',
    ];

    public function case(): BelongsTo
    {
        return $this->belongsTo(DetectiveCase::class, 'case_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExhausted(): bool
    {
        return $this->attempts_left <= 0 || $this->status === 'failed';
    }

    public function isSolved(): bool
    {
        return $this->status === 'solved';
    }
}
