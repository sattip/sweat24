<?php

namespace App\Http\Controllers;

use App\Models\BodyMeasurement;
use Illuminate\Http\Request;

class BodyMeasurementController extends Controller
{
    public function index()
    {
        return BodyMeasurement::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|integer',
            'date' => 'required|date',
            'weight' => 'nullable',
            'height' => 'nullable',
            'waist' => 'nullable',
            'hips' => 'nullable',
            'chest' => 'nullable',
            'arm' => 'nullable',
            'thigh' => 'nullable',
            'body_fat' => 'nullable',
            'notes' => 'nullable',
        ]);

        return BodyMeasurement::create($data);
    }

    public function show(BodyMeasurement $measurement)
    {
        return $measurement;
    }

    public function update(Request $request, BodyMeasurement $measurement)
    {
        $measurement->update($request->all());
        return $measurement;
    }

    public function destroy(BodyMeasurement $measurement)
    {
        $measurement->delete();
        return response()->noContent();
    }
}
