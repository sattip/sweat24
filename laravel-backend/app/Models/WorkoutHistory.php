<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'workout_session_id',
        'attended',
        'completed_at',
        'duration_minutes',
        'calories_burned',
        'rating',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'attended' => 'boolean',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * Get the user this workout history belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the workout session this history record is for.
     */
    public function workoutSession(): BelongsTo
    {
        return $this->belongsTo(WorkoutSession::class);
    }
}