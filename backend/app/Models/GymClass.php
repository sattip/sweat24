<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GymClass extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'day', 'time', 'instructor',
        'spots_available', 'total_spots'
    ];
}
