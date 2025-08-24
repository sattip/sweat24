<?php

namespace App\Http\Controllers\Api;

use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TrainerController extends BaseController
{
    /**
     * Display a listing of trainers.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Trainer::where('is_active', true);
        
        if ($request->has('specialty')) {
            $query->whereJsonContains('specialties', $request->specialty);
        }

        $trainers = $query->orderBy('first_name')->get();
        return $this->sendResponse($trainers, 'Trainers retrieved successfully.');
    }

    /**
     * Display the specified trainer.
     */
    public function show($id): JsonResponse
    {
        $trainer = Trainer::where('is_active', true)
                         ->with(['workouts', 'appointments' => function($query) {
                             $query->where('appointment_date', '>=', now()->toDateString())
                                   ->orderBy('appointment_date')
                                   ->orderBy('start_time');
                         }])
                         ->find($id);

        if (!$trainer) {
            return $this->sendError('Trainer not found.');
        }

        return $this->sendResponse($trainer, 'Trainer retrieved successfully.');
    }
}