<?php

namespace App\Http\Controllers;

use App\Models\ProgressPhoto;
use Illuminate\Http\Request;

class ProgressPhotoController extends Controller
{
    public function index()
    {
        return ProgressPhoto::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|integer',
            'image_path' => 'required',
            'date' => 'required|date',
            'caption' => 'nullable'
        ]);

        return ProgressPhoto::create($data);
    }

    public function show(ProgressPhoto $photo)
    {
        return $photo;
    }

    public function update(Request $request, ProgressPhoto $photo)
    {
        $photo->update($request->all());
        return $photo;
    }

    public function destroy(ProgressPhoto $photo)
    {
        $photo->delete();
        return response()->noContent();
    }
}
