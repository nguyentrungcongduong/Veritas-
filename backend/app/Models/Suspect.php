<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Suspect extends Model
{
    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'case_id',
        'name',
        'bio',
        'is_culprit',
    ];

    protected $hidden = ['is_culprit']; // NEVER expose culprit via API

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    public function case(): BelongsTo
    {
        return $this->belongsTo(DetectiveCase::class, 'case_id');
    }

    public function statements(): HasMany
    {
        return $this->hasMany(Statement::class, 'suspect_id');
    }
}
