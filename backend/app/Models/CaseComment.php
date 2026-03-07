<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CaseComment extends Model
{
    protected $fillable = [
        'case_id',
        'user_id',
        'content',
        'status_at_comment',
        'solve_time',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
