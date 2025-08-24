<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Measurement extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
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
        'muscle_mass',
        'notes',
    ];

    /**
     * Get the attributes that should be cast.
     */
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
            'muscle_mass' => 'decimal:2',
        ];
    }

    /**
     * Get the user for the measurement.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope a query to order by measurement date.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('measurement_date', 'desc');
    }
}