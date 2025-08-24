<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BodyMeasurement extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'date', 'weight', 'height', 'waist', 'hips', 'chest',
        'arm', 'thigh', 'body_fat', 'notes'
    ];

    protected $casts = [
        'date' => 'date'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
