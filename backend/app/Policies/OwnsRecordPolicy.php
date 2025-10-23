<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class OwnsRecordPolicy
{
    public function update(User $user, Model $record): bool
    {
        return $record->user_id === $user->id;
    }

    public function delete(User $user, Model $record): bool
    {
        return $record->user_id === $user->id;
    }
}
