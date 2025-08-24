<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workout extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'type',
        'duration_minutes',
        'instructor_id',
        'capacity',
        'location',
        'difficulty_level',
    ];

    /**
     * Get the instructor that teaches this workout.
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Trainer::class, 'instructor_id');
    }

    /**
     * Get the bookings for this workout.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * Get the workout sessions scheduled for this workout.
     */
    public function sessions(): HasMany
    {
        return $this->hasMany(WorkoutSession::class);
    }
}