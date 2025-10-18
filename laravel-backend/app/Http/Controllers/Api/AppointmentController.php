<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class AppointmentController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = $request->user()->appointments()->with(['service', 'trainer']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter upcoming appointments
        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        $appointments = $query->orderBy('appointment_date', 'desc')->paginate($request->get('per_page', 15));

        return response()->json($appointments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'service_id' => 'required|exists:services,id',
            'trainer_id' => 'nullable|exists:trainers,id',
            'appointment_date' => 'required|date|after_or_equal:today',
            'appointment_time' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string',
            'preferred_times' => 'nullable|array',
            'preferred_times.*' => 'string',
        ]);

        $appointment = Appointment::create([
            'user_id' => $request->user()->id,
            'service_id' => $request->service_id,
            'trainer_id' => $request->trainer_id,
            'appointment_date' => $request->appointment_date,
            'appointment_time' => $request->appointment_time,
            'notes' => $request->notes,
            'preferred_times' => $request->preferred_times,
            'status' => 'pending',
        ]);

        return response()->json($appointment->load(['service', 'trainer']), Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Appointment $appointment)
    {
        $this->authorize('view', $appointment);

        return response()->json($appointment->load(['service', 'trainer', 'user']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Appointment $appointment)
    {
        $this->authorize('update', $appointment);

        $request->validate([
            'appointment_date' => 'sometimes|date|after_or_equal:today',
            'appointment_time' => 'nullable|date_format:H:i',
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed',
            'notes' => 'nullable|string',
            'preferred_times' => 'nullable|array',
        ]);

        $appointment->update($request->all());

        return response()->json($appointment->load(['service', 'trainer']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Appointment $appointment)
    {
        $this->authorize('delete', $appointment);

        $appointment->delete();

        return response()->json(['message' => 'Appointment cancelled successfully'], Response::HTTP_NO_CONTENT);
    }
}