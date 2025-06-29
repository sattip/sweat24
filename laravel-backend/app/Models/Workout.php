<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workout extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'class_id',
        'trainer_id',
        'name',
        'workout_type',
        'duration',
        'calories_burned',
        'rating',
        'notes',
        'completed_at',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
            'duration' => 'integer',
            'calories_burned' => 'integer',
            'rating' => 'decimal:1',
        ];
    }

    /**
     * Get the user that completed the workout.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the class associated with the workout.
     */
    public function fitnessClass()
    {
        return $this->belongsTo(FitnessClass::class, 'class_id');
    }

    /**
     * Get the trainer for the workout.
     */
    public function trainer()
    {
        return $this->belongsTo(Trainer::class);
    }

    /**
     * Scope a query to only include recent workouts.
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('completed_at', '>=', now()->subDays($days));
    }
}