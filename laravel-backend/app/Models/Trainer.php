<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trainer extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'bio',
        'specializations',
        'experience_years',
        'certifications',
        'profile_image',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'specializations' => 'array',
            'certifications' => 'array',
            'experience_years' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the trainer's full name.
     */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Get the classes for the trainer.
     */
    public function fitnessClasses()
    {
        return $this->hasMany(FitnessClass::class, 'instructor_id');
    }

    /**
     * Get the workouts for the trainer.
     */
    public function workouts()
    {
        return $this->hasMany(Workout::class);
    }

    /**
     * Get the appointments for the trainer.
     */
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Scope a query to only include active trainers.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}