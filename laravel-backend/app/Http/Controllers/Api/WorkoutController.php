<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workout;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class WorkoutController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = $request->user()->workouts()->with(['fitnessClass', 'trainer']);

        // Filter by workout type
        if ($request->has('type')) {
            $query->where('workout_type', $request->type);
        }

        // Filter recent workouts
        if ($request->has('recent_days')) {
            $query->recent($request->recent_days);
        }

        $workouts = $query->orderBy('completed_at', 'desc')->paginate($request->get('per_page', 15));

        return response()->json($workouts);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'nullable|exists:fitness_classes,id',
            'trainer_id' => 'nullable|exists:trainers,id',
            'name' => 'required|string|max:255',
            'workout_type' => 'required|string|max:255',
            'duration' => 'required|integer|min:1',
            'calories_burned' => 'nullable|integer|min:0',
            'rating' => 'nullable|numeric|min:1|max:5',
            'notes' => 'nullable|string',
            'completed_at' => 'required|date',
        ]);

        $workout = Workout::create([
            'user_id' => $request->user()->id,
            ...$request->all()
        ]);

        return response()->json($workout->load(['fitnessClass', 'trainer']), Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Workout $workout)
    {
        $this->authorize('view', $workout);

        return response()->json($workout->load(['fitnessClass', 'trainer', 'user']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Workout $workout)
    {
        $this->authorize('update', $workout);

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'workout_type' => 'sometimes|string|max:255',
            'duration' => 'sometimes|integer|min:1',
            'calories_burned' => 'nullable|integer|min:0',
            'rating' => 'nullable|numeric|min:1|max:5',
            'notes' => 'nullable|string',
            'completed_at' => 'sometimes|date',
        ]);

        $workout->update($request->all());

        return response()->json($workout->load(['fitnessClass', 'trainer']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Workout $workout)
    {
        $this->authorize('delete', $workout);

        $workout->delete();

        return response()->json(['message' => 'Workout deleted successfully'], Response::HTTP_NO_CONTENT);
    }

    /**
     * Get workout statistics for the authenticated user.
     */
    public function stats(Request $request)
    {
        $user = $request->user();
        
        $stats = [
            'total_workouts' => $user->workouts()->count(),
            'total_duration' => $user->workouts()->sum('duration'),
            'total_calories' => $user->workouts()->sum('calories_burned'),
            'average_rating' => $user->workouts()->whereNotNull('rating')->avg('rating'),
            'this_month_workouts' => $user->workouts()->whereMonth('completed_at', now()->month)->count(),
            'workout_types' => $user->workouts()
                ->selectRaw('workout_type, COUNT(*) as count')
                ->groupBy('workout_type')
                ->get(),
        ];

        return response()->json($stats);
    }
}