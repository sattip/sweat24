<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ServiceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Service::query();

        // Filter by active status
        if ($request->has('active')) {
            $query->where('is_active', $request->boolean('active'));
        }

        // Filter by service type
        if ($request->has('type')) {
            $query->where('service_type', $request->type);
        }

        $services = $query->active()->get();

        return response()->json($services);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'service_type' => 'required|in:personal-training,ems-training,pilates-reformer,cardio-personal',
            'duration' => 'required|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $service = Service::create($request->all());

        return response()->json($service, Response::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(Service $service)
    {
        return response()->json($service);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Service $service)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'service_type' => 'sometimes|in:personal-training,ems-training,pilates-reformer,cardio-personal',
            'duration' => 'sometimes|integer|min:1',
            'price' => 'nullable|numeric|min:0',
            'is_active' => 'boolean',
        ]);

        $service->update($request->all());

        return response()->json($service);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Service $service)
    {
        $service->delete();

        return response()->json(['message' => 'Service deleted successfully'], Response::HTTP_NO_CONTENT);
    }
}