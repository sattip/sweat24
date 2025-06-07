<?php

namespace App\Http\Controllers\Api;

use App\Models\Workout;
use App\Models\WorkoutSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class WorkoutController extends BaseController
{
    /**
     * Display a listing of workouts.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Workout::with('instructor');
        
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        
        if ($request->has('difficulty_level')) {
            $query->where('difficulty_level', $request->difficulty_level);
        }

        $workouts = $query->get();
        return $this->sendResponse($workouts, 'Workouts retrieved successfully.');
    }

    /**
     * Display the specified workout.
     */
    public function show($id): JsonResponse
    {
        $workout = Workout::with(['instructor', 'sessions' => function($query) {
            $query->where('scheduled_date', '>=', now()->toDateString())
                  ->orderBy('scheduled_date')
                  ->orderBy('start_time');
        }])->find($id);

        if (!$workout) {
            return $this->sendError('Workout not found.');
        }

        return $this->sendResponse($workout, 'Workout retrieved successfully.');
    }

    /**
     * Get workout schedule
     */
    public function schedule(Request $request): JsonResponse
    {
        $query = WorkoutSession::with(['workout', 'workout.instructor'])
                              ->where('scheduled_date', '>=', now()->toDateString());

        if ($request->has('date')) {
            $query->whereDate('scheduled_date', $request->date);
        }

        if ($request->has('week')) {
            $startOfWeek = now()->startOfWeek();
            $endOfWeek = now()->endOfWeek();
            $query->whereBetween('scheduled_date', [$startOfWeek, $endOfWeek]);
        }

        $sessions = $query->orderBy('scheduled_date')
                         ->orderBy('start_time')
                         ->get();

        return $this->sendResponse($sessions, 'Workout schedule retrieved successfully.');
    }
}