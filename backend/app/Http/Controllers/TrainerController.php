<?php

namespace App\Http\Controllers;

use App\Models\Trainer;
use Illuminate\Http\Request;

class TrainerController extends Controller
{
    public function index()
    {
        return Trainer::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'title' => 'required',
            'image_url' => 'nullable',
            'bio' => 'nullable',
        ]);

        return Trainer::create($data);
    }

    public function show(Trainer $trainer)
    {
        return $trainer;
    }

    public function update(Request $request, Trainer $trainer)
    {
        $trainer->update($request->all());
        return $trainer;
    }

    public function destroy(Trainer $trainer)
    {
        $trainer->delete();
        return response()->noContent();
    }
}
