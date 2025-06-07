<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BodyMeasurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'measurement_date',
        'weight',
        'height',
        'waist',
        'hips',
        'chest',
        'arm',
        'thigh',
        'body_fat_percentage',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'measurement_date' => 'date',
            'weight' => 'decimal:2',
            'height' => 'decimal:2',
            'waist' => 'decimal:2',
            'hips' => 'decimal:2',
            'chest' => 'decimal:2',
            'arm' => 'decimal:2',
            'thigh' => 'decimal:2',
            'body_fat_percentage' => 'decimal:2',
        ];
    }

    /**
     * Get the user this measurement belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}