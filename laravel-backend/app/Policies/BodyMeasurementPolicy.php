<?php

namespace App\Policies;

use App\Models\User;
use App\Models\BodyMeasurement;

class BodyMeasurementPolicy
{
    /**
     * Determine whether the user can view any body measurements.
     */
    public function viewAny(User $user): bool
    {
        return true; // Users can view their own measurements
    }

    /**
     * Determine whether the user can view the body measurement.
     */
    public function view(User $user, BodyMeasurement $bodyMeasurement): bool
    {
        return $user->id === $bodyMeasurement->user_id;
    }

    /**
     * Determine whether the user can create body measurements.
     */
    public function create(User $user): bool
    {
        return true; // All authenticated users can create measurements
    }

    /**
     * Determine whether the user can update the body measurement.
     */
    public function update(User $user, BodyMeasurement $bodyMeasurement): bool
    {
        return $user->id === $bodyMeasurement->user_id;
    }

    /**
     * Determine whether the user can delete the body measurement.
     */
    public function delete(User $user, BodyMeasurement $bodyMeasurement): bool
    {
        return $user->id === $bodyMeasurement->user_id;
    }
}