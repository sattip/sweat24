<?php

namespace App\Http\Controllers\Api;

use App\Models\Booking;
use App\Models\WorkoutSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class BookingController extends BaseController
{
    /**
     * Display user's bookings.
     */
    public function index(Request $request): JsonResponse
    {
        $bookings = $request->user()
                           ->bookings()
                           ->with(['workoutSession', 'workoutSession.workout', 'workoutSession.workout.instructor'])
                           ->orderBy('created_at', 'desc')
                           ->get();

        return $this->sendResponse($bookings, 'Bookings retrieved successfully.');
    }

    /**
     * Create a new booking.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'workout_session_id' => 'required|exists:workout_sessions,id',
        ]);

        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }

        $workoutSession = WorkoutSession::with('workout')->find($request->workout_session_id);
        
        // Check if session is in the future
        $sessionDateTime = $workoutSession->scheduled_date . ' ' . $workoutSession->start_time;
        if (strtotime($sessionDateTime) <= time()) {
            return $this->sendError('Cannot book past sessions.', [], 400);
        }

        // Check capacity
        if ($workoutSession->current_capacity >= $workoutSession->workout->capacity) {
            return $this->sendError('Session is fully booked.', [], 400);
        }

        // Check if user already booked this session
        $existingBooking = Booking::where('user_id', $request->user()->id)
                                 ->where('workout_session_id', $request->workout_session_id)
                                 ->where('status', '!=', 'cancelled')
                                 ->first();

        if ($existingBooking) {
            return $this->sendError('You have already booked this session.', [], 400);
        }

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'workout_session_id' => $request->workout_session_id,
            'status' => 'booked',
            'booked_at' => now(),
        ]);

        // Update session capacity
        $workoutSession->increment('current_capacity');

        $booking->load(['workoutSession', 'workoutSession.workout', 'workoutSession.workout.instructor']);

        return $this->sendResponse($booking, 'Booking created successfully.');
    }

    /**
     * Cancel a booking.
     */
    public function cancel($id, Request $request): JsonResponse
    {
        $booking = Booking::where('id', $id)
                         ->where('user_id', $request->user()->id)
                         ->first();

        if (!$booking) {
            return $this->sendError('Booking not found.');
        }

        if ($booking->status === 'cancelled') {
            return $this->sendError('Booking is already cancelled.');
        }

        $workoutSession = $booking->workoutSession;
        $sessionDateTime = $workoutSession->scheduled_date . ' ' . $workoutSession->start_time;
        
        // Check if cancellation is too late (e.g., less than 2 hours before)
        if (strtotime($sessionDateTime) - time() < 2 * 3600) {
            return $this->sendError('Cannot cancel booking less than 2 hours before the session.', [], 400);
        }

        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        // Update session capacity
        $workoutSession->decrement('current_capacity');

        return $this->sendResponse($booking, 'Booking cancelled successfully.');
    }

    /**
     * Display the specified booking.
     */
    public function show($id, Request $request): JsonResponse
    {
        $booking = Booking::where('id', $id)
                         ->where('user_id', $request->user()->id)
                         ->with(['workoutSession', 'workoutSession.workout', 'workoutSession.workout.instructor'])
                         ->first();

        if (!$booking) {
            return $this->sendError('Booking not found.');
        }

        return $this->sendResponse($booking, 'Booking retrieved successfully.');
    }
}