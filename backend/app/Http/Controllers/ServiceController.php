<?php

namespace App\Http\Controllers;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index()
    {
        return Service::all();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'description' => 'required',
        ]);

        return Service::create($data);
    }

    public function show(Service $service)
    {
        return $service;
    }

    public function update(Request $request, Service $service)
    {
        $service->update($request->all());
        return $service;
    }

    public function destroy(Service $service)
    {
        $service->delete();
        return response()->noContent();
    }
}
