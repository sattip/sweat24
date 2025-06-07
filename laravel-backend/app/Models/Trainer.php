<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trainer extends Model
{
    use HasFactory;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'specialties',
        'bio',
        'photo_path',
        'experience_years',
        'certifications',
        'hourly_rate',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'specialties' => 'array',
            'certifications' => 'array',
            'hourly_rate' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the workouts this trainer teaches.
     */
    public function workouts(): HasMany
    {
        return $this->hasMany(Workout::class, 'instructor_id');
    }

    /**
     * Get the appointments for this trainer.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Accessor for full name.
     */
    public function getFullNameAttribute(): string
    {
        return $this->first_name . ' ' . $this->last_name;
    }
}