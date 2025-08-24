<?php

namespace App\Http\Controllers;

use App\Models\GymClass;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    public function index()
    {
        return GymClass::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'day' => 'required',
            'time' => 'required',
            'instructor' => 'required',
            'spots_available' => 'required|integer',
            'total_spots' => 'required|integer'
        ]);

        return GymClass::create($data);
    }

    public function show(GymClass $class)
    {
        return $class;
    }

    public function update(Request $request, GymClass $class)
    {
        $class->update($request->all());
        return $class;
    }

    public function destroy(GymClass $class)
    {
        $class->delete();
        return response()->noContent();
    }
}
