<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\FitnessClassController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\WorkoutController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\MeasurementController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\TrainerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes (no authentication required)
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
});

// Public routes for browsing
Route::get('classes', [FitnessClassController::class, 'index']);
Route::get('classes/{fitnessClass}', [FitnessClassController::class, 'show']);
Route::get('products', [ProductController::class, 'index']);
Route::get('products/{product}', [ProductController::class, 'show']);
Route::get('products/category/{category}', [ProductController::class, 'byCategory']);
Route::get('services', [ServiceController::class, 'index']);
Route::get('services/{service}', [ServiceController::class, 'show']);
Route::get('trainers', [TrainerController::class, 'index']);
Route::get('trainers/{trainer}', [TrainerController::class, 'show']);
Route::get('trainers/{trainer}/schedule', [TrainerController::class, 'schedule']);

// Protected routes (authentication required)
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });

    // User's bookings
    Route::apiResource('bookings', BookingController::class);

    // User's workouts
    Route::apiResource('workouts', WorkoutController::class);
    Route::get('workouts-stats', [WorkoutController::class, 'stats']);

    // User's measurements
    Route::apiResource('measurements', MeasurementController::class);
    Route::get('measurements-trends', [MeasurementController::class, 'trends']);

    // User's orders
    Route::apiResource('orders', OrderController::class);

    // User's appointments
    Route::apiResource('appointments', AppointmentController::class);

    // Admin routes (for gym staff/admin)
    Route::middleware('can:admin')->group(function () {
        
        // Class management
        Route::apiResource('admin/classes', FitnessClassController::class)->except(['index', 'show']);
        
        // Product management
        Route::apiResource('admin/products', ProductController::class)->except(['index', 'show']);
        
        // Service management
        Route::apiResource('admin/services', ServiceController::class)->except(['index', 'show']);
        
        // Trainer management
        Route::apiResource('admin/trainers', TrainerController::class)->except(['index', 'show']);
        
        // Order management
        Route::get('admin/orders', [OrderController::class, 'index']);
        Route::get('admin/orders/{order}', [OrderController::class, 'show']);
        Route::patch('admin/orders/{order}', [OrderController::class, 'update']);
        
        // Appointment management
        Route::get('admin/appointments', [AppointmentController::class, 'index']);
        Route::patch('admin/appointments/{appointment}', [AppointmentController::class, 'update']);
        
    });
});