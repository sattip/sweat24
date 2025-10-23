<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index()
    {
        return Appointment::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|integer',
            'service_id' => 'required|integer',
            'trainer_id' => 'nullable|integer',
            'preferred_times' => 'required',
            'notes' => 'nullable',
        ]);

        return Appointment::create($data);
    }

    public function show(Appointment $appointment)
    {
        return $appointment;
    }

    public function update(Request $request, Appointment $appointment)
    {
        $appointment->update($request->all());
        return $appointment;
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->noContent();
    }
}
