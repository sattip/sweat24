<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Referral extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'friend_name', 'friend_email'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
