<?php

namespace App\Http\Controllers\Api;

use App\Models\BodyMeasurement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class BodyMeasurementController extends BaseController
{
    /**
     * Display user's body measurements.
     */
    public function index(Request $request): JsonResponse
    {
        $measurements = $request->user()
                               ->bodyMeasurements()
                               ->orderBy('measurement_date', 'desc')
                               ->get();

        return $this->sendResponse($measurements, 'Body measurements retrieved successfully.');
    }

    /**
     * Store a new body measurement.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'measurement_date' => 'required|date',
            'weight' => 'nullable|numeric|min:0|max:999.99',
            'height' => 'nullable|numeric|min:0|max:999.99',
            'waist' => 'nullable|numeric|min:0|max:999.99',
            'hips' => 'nullable|numeric|min:0|max:999.99',
            'chest' => 'nullable|numeric|min:0|max:999.99',
            'arm' => 'nullable|numeric|min:0|max:999.99',
            'thigh' => 'nullable|numeric|min:0|max:999.99',
            'body_fat_percentage' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }

        $measurement = BodyMeasurement::create([
            'user_id' => $request->user()->id,
            'measurement_date' => $request->measurement_date,
            'weight' => $request->weight,
            'height' => $request->height,
            'waist' => $request->waist,
            'hips' => $request->hips,
            'chest' => $request->chest,
            'arm' => $request->arm,
            'thigh' => $request->thigh,
            'body_fat_percentage' => $request->body_fat_percentage,
            'notes' => $request->notes,
        ]);

        return $this->sendResponse($measurement, 'Body measurement saved successfully.');
    }

    /**
     * Display the specified measurement.
     */
    public function show($id, Request $request): JsonResponse
    {
        $measurement = BodyMeasurement::where('id', $id)
                                     ->where('user_id', $request->user()->id)
                                     ->first();

        if (!$measurement) {
            return $this->sendError('Body measurement not found.');
        }

        return $this->sendResponse($measurement, 'Body measurement retrieved successfully.');
    }

    /**
     * Update the specified measurement.
     */
    public function update(Request $request, $id): JsonResponse
    {
        $measurement = BodyMeasurement::where('id', $id)
                                     ->where('user_id', $request->user()->id)
                                     ->first();

        if (!$measurement) {
            return $this->sendError('Body measurement not found.');
        }

        $validator = Validator::make($request->all(), [
            'measurement_date' => 'sometimes|required|date',
            'weight' => 'nullable|numeric|min:0|max:999.99',
            'height' => 'nullable|numeric|min:0|max:999.99',
            'waist' => 'nullable|numeric|min:0|max:999.99',
            'hips' => 'nullable|numeric|min:0|max:999.99',
            'chest' => 'nullable|numeric|min:0|max:999.99',
            'arm' => 'nullable|numeric|min:0|max:999.99',
            'thigh' => 'nullable|numeric|min:0|max:999.99',
            'body_fat_percentage' => 'nullable|numeric|min:0|max:100',
            'notes' => 'nullable|string|max:1000',
        ]);

        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }

        $measurement->update($request->only([
            'measurement_date', 'weight', 'height', 'waist', 'hips', 
            'chest', 'arm', 'thigh', 'body_fat_percentage', 'notes'
        ]));

        return $this->sendResponse($measurement, 'Body measurement updated successfully.');
    }

    /**
     * Remove the specified measurement.
     */
    public function destroy($id, Request $request): JsonResponse
    {
        $measurement = BodyMeasurement::where('id', $id)
                                     ->where('user_id', $request->user()->id)
                                     ->first();

        if (!$measurement) {
            return $this->sendError('Body measurement not found.');
        }

        $measurement->delete();

        return $this->sendResponse([], 'Body measurement deleted successfully.');
    }
}