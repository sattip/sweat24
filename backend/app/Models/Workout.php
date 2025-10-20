<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Workout extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'name', 'date', 'time', 'instructor', 'type', 'duration'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
