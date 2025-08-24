<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'photo_date',
        'photo_path',
        'photo_type',
        'description',
        'is_before',
        'is_after',
    ];

    protected function casts(): array
    {
        return [
            'photo_date' => 'date',
            'is_before' => 'boolean',
            'is_after' => 'boolean',
        ];
    }

    /**
     * Get the user this progress photo belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}