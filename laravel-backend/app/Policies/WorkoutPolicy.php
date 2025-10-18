<?php

namespace App\Policies;

use App\Models\Workout;
use App\Models\User;

class WorkoutPolicy
{
    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Workout $workout): bool
    {
        return $user->id === $workout->user_id;
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
    public function update(User $user, Workout $workout): bool
    {
        return $user->id === $workout->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Workout $workout): bool
    {
        return $user->id === $workout->user_id;
    }
}