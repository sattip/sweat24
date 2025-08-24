<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class BookingController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = $request->user()->bookings()->with(['fitnessClass.instructor']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter upcoming bookings
        if ($request->boolean('upcoming')) {
            $query->upcoming();
        }

        $bookings = $query->orderBy('booking_date', 'desc')->paginate($request->get('per_page', 15));

        return response()->json($bookings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'class_id' => 'required|exists:fitness_classes,id',
            'booking_date' => 'required|date|after_or_equal:today',
            'notes' => 'nullable|string',
        ]);

        // Check if the class is available
        $fitnessClass = \App\Models\FitnessClass::findOrFail($request->class_id);
        
        if ($fitnessClass->isFull()) {
            return response()->json(['message' => 'Class is full'], Response::HTTP_CONFLICT);
        }

        // Check if user already has a booking for this class and date
        $existingBooking = Booking::where([
            'user_id' => $request->user()->id,
            'class_id' => $request->class_id,
            'booking_date' => $request->booking_date,
        ])->first();

        if ($existingBooking) {
            return response()->json(['message' => 'You already have a booking for this class'], Response::HTTP_CONFLICT);
        }

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'class_id' => $request->class_id,
            'booking_date' => $request->booking_date,
            'notes' => $request->notes,
            'status' => 'confirmed',
        ]);

        return response()->json($booking->load('fitnessClass.instructor'), Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Booking $booking)
    {
        $this->authorize('view', $booking);

        return response()->json($booking->load(['fitnessClass.instructor', 'user']));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Booking $booking)
    {
        $this->authorize('update', $booking);

        $request->validate([
            'status' => 'sometimes|in:pending,confirmed,cancelled,completed',
            'notes' => 'nullable|string',
        ]);

        $booking->update($request->only(['status', 'notes']));

        return response()->json($booking->load('fitnessClass.instructor'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Booking $booking)
    {
        $this->authorize('delete', $booking);

        $booking->delete();

        return response()->json(['message' => 'Booking cancelled successfully'], Response::HTTP_NO_CONTENT);
    }
}