<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class TrainerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Trainer::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Filter by specialization
        if ($request->has('specialization')) {
            $query->whereJsonContains('specializations', $request->specialization);
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', '%' . $search . '%')
                  ->orWhere('last_name', 'like', '%' . $search . '%');
            });
        }

        $trainers = $query->active()->paginate($request->get('per_page', 15));

        return response()->json($trainers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:trainers,email',
            'phone' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'specializations' => 'nullable|array',
            'experience_years' => 'required|integer|min:0',
            'certifications' => 'nullable|array',
            'profile_image' => 'nullable|url',
            'is_active' => 'boolean',
        ]);

        $trainer = Trainer::create($request->all());

        return response()->json($trainer, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Trainer $trainer)
    {
        return response()->json($trainer->load(['fitnessClasses', 'appointments']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Trainer $trainer)
    {
        $request->validate([
            'first_name' => 'sometimes|string|max:255',
            'last_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:trainers,email,' . $trainer->id,
            'phone' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'specializations' => 'nullable|array',
            'experience_years' => 'sometimes|integer|min:0',
            'certifications' => 'nullable|array',
            'profile_image' => 'nullable|url',
            'is_active' => 'boolean',
        ]);

        $trainer->update($request->all());

        return response()->json($trainer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Trainer $trainer)
    {
        $trainer->delete();

        return response()->json(['message' => 'Trainer deleted successfully'], Response::HTTP_NO_CONTENT);
    }

    /**
     * Get trainer's schedule.
     */
    public function schedule(Request $request, Trainer $trainer)
    {
        $classes = $trainer->fitnessClasses()
            ->with('bookings')
            ->where('is_active', true)
            ->when($request->has('date'), function ($query) use ($request) {
                $query->whereDate('start_time', $request->date);
            })
            ->orderBy('start_time')
            ->get();

        return response()->json($classes);
    }
}