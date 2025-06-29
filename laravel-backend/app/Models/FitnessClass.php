<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FitnessClass extends Model
{
    use HasFactory;

    protected $table = 'fitness_classes';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'name',
        'description',
        'instructor_id',
        'duration',
        'max_capacity',
        'location',
        'class_type',
        'difficulty_level',
        'start_time',
        'end_time',
        'recurring_pattern',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'start_time' => 'datetime',
            'end_time' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the instructor for the class.
     */
    public function instructor()
    {
        return $this->belongsTo(Trainer::class, 'instructor_id');
    }

    /**
     * Get the bookings for the class.
     */
    public function bookings()
    {
        return $this->hasMany(Booking::class, 'class_id');
    }

    /**
     * Get the available spots for the class.
     */
    public function getAvailableSpotsAttribute(): int
    {
        return $this->max_capacity - $this->bookings()->count();
    }

    /**
     * Check if the class is full.
     */
    public function isFull(): bool
    {
        return $this->available_spots <= 0;
    }
}