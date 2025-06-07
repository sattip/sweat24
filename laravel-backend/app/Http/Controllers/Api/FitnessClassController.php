<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FitnessClass;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class FitnessClassController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = FitnessClass::with(['instructor', 'bookings']);

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Filter by class type
        if ($request->has('type')) {
            $query->where('class_type', $request->type);
        }

        // Filter by difficulty
        if ($request->has('difficulty')) {
            $query->where('difficulty_level', $request->difficulty);
        }

        // Filter by date range
        if ($request->has('start_date')) {
            $query->where('start_time', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('end_time', '<=', $request->end_date);
        }

        $classes = $query->paginate($request->get('per_page', 15));

        return response()->json($classes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'instructor_id' => 'required|exists:trainers,id',
            'duration' => 'required|integer|min:1',
            'max_capacity' => 'required|integer|min:1',
            'location' => 'required|string|max:255',
            'class_type' => 'required|string|max:255',
            'difficulty_level' => 'required|in:beginner,intermediate,advanced',
            'start_time' => 'required|date',
            'end_time' => 'required|date|after:start_time',
            'recurring_pattern' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $fitnessClass = FitnessClass::create($request->all());

        return response()->json($fitnessClass->load('instructor'), Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(FitnessClass $fitnessClass)
    {
        return response()->json($fitnessClass->load(['instructor', 'bookings.user']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, FitnessClass $fitnessClass)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'instructor_id' => 'sometimes|exists:trainers,id',
            'duration' => 'sometimes|integer|min:1',
            'max_capacity' => 'sometimes|integer|min:1',
            'location' => 'sometimes|string|max:255',
            'class_type' => 'sometimes|string|max:255',
            'difficulty_level' => 'sometimes|in:beginner,intermediate,advanced',
            'start_time' => 'sometimes|date',
            'end_time' => 'sometimes|date|after:start_time',
            'recurring_pattern' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $fitnessClass->update($request->all());

        return response()->json($fitnessClass->load('instructor'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FitnessClass $fitnessClass)
    {
        $fitnessClass->delete();

        return response()->json(['message' => 'Class deleted successfully'], Response::HTTP_NO_CONTENT);
    }
}