<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class DetectiveCase extends Model
{
    protected $table = 'cases';

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'title',
        'description',
        'author_id',
        'status',
        'react_flow_draft',
        'difficulty',
        'reward_fame',
        'blueprint_data',
        'correct_suspect_id',
        'is_solved_by_creator',
    ];

    protected $casts = [
        'react_flow_draft'    => 'array',
        'blueprint_data'      => 'array',
        'is_solved_by_creator' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function suspects(): HasMany
    {
        return $this->hasMany(Suspect::class, 'case_id');
    }

    public function clues(): HasMany
    {
        return $this->hasMany(Clue::class, 'case_id');
    }

    public function contradictions(): HasMany
    {
        return $this->hasMany(Contradiction::class, 'case_id');
    }

    public function investigations(): HasMany
    {
        return $this->hasMany(Investigation::class, 'case_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
