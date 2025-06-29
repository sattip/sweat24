<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Measurement;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MeasurementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $measurements = $request->user()
            ->measurements()
            ->latest()
            ->paginate($request->get('per_page', 15));

        return response()->json($measurements);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'measurement_date' => 'required|date',
            'weight' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'waist' => 'nullable|numeric|min:0',
            'hips' => 'nullable|numeric|min:0',
            'chest' => 'nullable|numeric|min:0',
            'arm' => 'nullable|numeric|min:0',
            'thigh' => 'nullable|numeric|min:0',
            'body_fat_percentage' => 'nullable|numeric|min:0|max:100',
            'muscle_mass' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $measurement = Measurement::create([
            'user_id' => $request->user()->id,
            ...$request->all()
        ]);

        return response()->json($measurement, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Measurement $measurement)
    {
        $this->authorize('view', $measurement);

        return response()->json($measurement);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Measurement $measurement)
    {
        $this->authorize('update', $measurement);

        $request->validate([
            'measurement_date' => 'sometimes|date',
            'weight' => 'nullable|numeric|min:0',
            'height' => 'nullable|numeric|min:0',
            'waist' => 'nullable|numeric|min:0',
            'hips' => 'nullable|numeric|min:0',
            'chest' => 'nullable|numeric|min:0',
            'arm' => 'nullable|numeric|min:0',
            'thigh' => 'nullable|numeric|min:0',
            'body_fat_percentage' => 'nullable|numeric|min:0|max:100',
            'muscle_mass' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $measurement->update($request->all());

        return response()->json($measurement);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Measurement $measurement)
    {
        $this->authorize('delete', $measurement);

        $measurement->delete();

        return response()->json(['message' => 'Measurement deleted successfully'], Response::HTTP_NO_CONTENT);
    }

    /**
     * Get measurement trends for charts.
     */
    public function trends(Request $request)
    {
        $measurements = $request->user()
            ->measurements()
            ->select(['measurement_date', 'weight', 'body_fat_percentage', 'muscle_mass'])
            ->orderBy('measurement_date')
            ->get();

        return response()->json($measurements);
    }
}