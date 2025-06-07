<?php

namespace App\Http\Controllers\Api;

use App\Models\WorkoutHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class WorkoutHistoryController extends BaseController
{
    /**
     * Display user's workout history.
     */
    public function index(Request $request): JsonResponse
    {
        $history = $request->user()
                          ->workoutHistory()
                          ->with(['workoutSession', 'workoutSession.workout', 'workoutSession.workout.instructor'])
                          ->orderBy('completed_at', 'desc')
                          ->get();

        return $this->sendResponse($history, 'Workout history retrieved successfully.');
    }

    /**
     * Store a new workout history entry.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'workout_session_id' => 'required|exists:workout_sessions,id',
            'attended' => 'required|boolean',
            'completed_at' => 'required|date',
            'duration_minutes' => 'nullable|integer|min:1|max:300',
            'calories_burned' => 'nullable|integer|min:1|max:2000',
            'rating' => 'nullable|integer|min:1|max:5',
            'notes' => 'nullable|string|max:1000',
        ]);

        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }

        // Check if history already exists for this session
        $existingHistory = WorkoutHistory::where('user_id', $request->user()->id)
                                        ->where('workout_session_id', $request->workout_session_id)
                                        ->first();

        if ($existingHistory) {
            return $this->sendError('Workout history already exists for this session.');
        }

        $history = WorkoutHistory::create([
            'user_id' => $request->user()->id,
            'workout_session_id' => $request->workout_session_id,
            'attended' => $request->attended,
            'completed_at' => $request->completed_at,
            'duration_minutes' => $request->duration_minutes,
            'calories_burned' => $request->calories_burned,
            'rating' => $request->rating,
            'notes' => $request->notes,
        ]);

        $history->load(['workoutSession', 'workoutSession.workout', 'workoutSession.workout.instructor']);

        return $this->sendResponse($history, 'Workout history saved successfully.');
    }

    /**
     * Display the specified workout history.
     */
    public function show($id, Request $request): JsonResponse
    {
        $history = WorkoutHistory::where('id', $id)
                                ->where('user_id', $request->user()->id)
                                ->with(['workoutSession', 'workoutSession.workout', 'workoutSession.workout.instructor'])
                                ->first();

        if (!$history) {
            return $this->sendError('Workout history not found.');
        }

        return $this->sendResponse($history, 'Workout history retrieved successfully.');
    }

    /**
     * Update workout history.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $history = WorkoutHistory::where('id', $id)
                                ->where('user_id', $request->user()->id)
                                ->first();

        if (!$history) {
            return $this->sendError('Workout history not found.');
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'nullable|integer|min:1|max:5',
            'notes' => 'nullable|string|max:1000',
        ]);

        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }

        $history->update($request->only(['rating', 'notes']));

        return $this->sendResponse($history, 'Workout history updated successfully.');
    }

    /**
     * Get user's workout statistics.
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $stats = [
            'total_workouts' => $user->workoutHistory()->where('attended', true)->count(),
            'total_minutes' => $user->workoutHistory()->where('attended', true)->sum('duration_minutes'),
            'total_calories' => $user->workoutHistory()->where('attended', true)->sum('calories_burned'),
            'average_rating' => $user->workoutHistory()->where('attended', true)->whereNotNull('rating')->avg('rating'),
            'last_workout' => $user->workoutHistory()->where('attended', true)->orderBy('completed_at', 'desc')->first(),
        ];

        return $this->sendResponse($stats, 'Workout statistics retrieved successfully.');
    }
}