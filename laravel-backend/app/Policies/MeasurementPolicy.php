<?php

namespace App\Policies;

use App\Models\Measurement;
use App\Models\User;

class MeasurementPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Measurement $measurement): bool
    {
        return $user->id === $measurement->user_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Measurement $measurement): bool
    {
        return $user->id === $measurement->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Measurement $measurement): bool
    {
        return $user->id === $measurement->user_id;
    }
}