<?php

namespace App\Http\Controllers\Api;

use App\Models\Appointment;
use App\Models\Service;
use App\Models\Trainer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class AppointmentController extends BaseController
{
    /**
     * Display user's appointments.
     */
    public function index(Request $request): JsonResponse
    {
        $appointments = $request->user()
                               ->appointments()
                               ->with(['trainer', 'service'])
                               ->orderBy('appointment_date', 'desc')
                               ->orderBy('start_time', 'desc')
                               ->get();

        return $this->sendResponse($appointments, 'Appointments retrieved successfully.');
    }

    /**
     * Create a new appointment request.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'trainer_id' => 'nullable|exists:trainers,id',
            'service_id' => 'required|exists:services,id',
            'preferred_times' => 'required|array|min:1',
            'preferred_times.*.date' => 'required|date|after:today',
            'preferred_times.*.time' => 'required|date_format:H:i',
            'notes' => 'nullable|string|max:1000',
        ]);

        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }

        $service = Service::find($request->service_id);
        
        // If trainer is specified, check if they're active
        if ($request->trainer_id) {
            $trainer = Trainer::where('id', $request->trainer_id)
                             ->where('is_active', true)
                             ->first();
            if (!$trainer) {
                return $this->sendError('Trainer not found or inactive.');
            }
        }

        $appointment = Appointment::create([
            'user_id' => $request->user()->id,
            'trainer_id' => $request->trainer_id,
            'service_id' => $request->service_id,
            'status' => 'requested',
            'notes' => $request->notes,
            'preferred_times' => $request->preferred_times,
        ]);

        $appointment->load(['trainer', 'service']);

        return $this->sendResponse($appointment, 'Appointment request submitted successfully.');
    }

    /**
     * Display the specified appointment.
     */
    public function show($id, Request $request): JsonResponse
    {
        $appointment = Appointment::where('id', $id)
                                 ->where('user_id', $request->user()->id)
                                 ->with(['trainer', 'service'])
                                 ->first();

        if (!$appointment) {
            return $this->sendError('Appointment not found.');
        }

        return $this->sendResponse($appointment, 'Appointment retrieved successfully.');
    }

    /**
     * Cancel an appointment.
     */
    public function cancel($id, Request $request): JsonResponse
    {
        $appointment = Appointment::where('id', $id)
                                 ->where('user_id', $request->user()->id)
                                 ->first();

        if (!$appointment) {
            return $this->sendError('Appointment not found.');
        }

        if ($appointment->status === 'cancelled') {
            return $this->sendError('Appointment is already cancelled.');
        }

        if ($appointment->status === 'completed') {
            return $this->sendError('Cannot cancel completed appointment.');
        }

        $appointment->update(['status' => 'cancelled']);

        return $this->sendResponse($appointment, 'Appointment cancelled successfully.');
    }

    /**
     * Get available services.
     */
    public function services(): JsonResponse
    {
        $services = Service::where('is_active', true)->get();
        return $this->sendResponse($services, 'Services retrieved successfully.');
    }
}