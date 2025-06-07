<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\WorkoutController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BodyMeasurementController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\TrainerController;
use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\WorkoutHistoryController;
use App\Http\Controllers\Api\RewardController;

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

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public product routes
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/categories', [ProductController::class, 'categories']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Public workout routes
Route::get('/workouts', [WorkoutController::class, 'index']);
Route::get('/workouts/{id}', [WorkoutController::class, 'show']);
Route::get('/schedule', [WorkoutController::class, 'schedule']);

// Public trainer routes
Route::get('/trainers', [TrainerController::class, 'index']);
Route::get('/trainers/{id}', [TrainerController::class, 'show']);

// Public service routes
Route::get('/services', [AppointmentController::class, 'services']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Booking routes
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings/{id}/cancel', [BookingController::class, 'cancel']);

    // Body measurements routes
    Route::get('/body-measurements', [BodyMeasurementController::class, 'index']);
    Route::post('/body-measurements', [BodyMeasurementController::class, 'store']);
    Route::get('/body-measurements/{id}', [BodyMeasurementController::class, 'show']);
    Route::put('/body-measurements/{id}', [BodyMeasurementController::class, 'update']);
    Route::delete('/body-measurements/{id}', [BodyMeasurementController::class, 'destroy']);

    // Order routes
    Route::get('/orders', [OrderController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);

    // Appointment routes
    Route::get('/appointments', [AppointmentController::class, 'index']);
    Route::post('/appointments', [AppointmentController::class, 'store']);
    Route::get('/appointments/{id}', [AppointmentController::class, 'show']);
    Route::post('/appointments/{id}/cancel', [AppointmentController::class, 'cancel']);

    // Workout history routes
    Route::get('/workout-history', [WorkoutHistoryController::class, 'index']);
    Route::post('/workout-history', [WorkoutHistoryController::class, 'store']);
    Route::get('/workout-history/{id}', [WorkoutHistoryController::class, 'show']);
    Route::put('/workout-history/{id}', [WorkoutHistoryController::class, 'update']);
    Route::get('/workout-stats', [WorkoutHistoryController::class, 'stats']);

    // Reward routes
    Route::get('/rewards', [RewardController::class, 'index']);
    Route::get('/rewards/{id}', [RewardController::class, 'show']);
    Route::post('/rewards/{id}/use', [RewardController::class, 'use']);

    // User info route
    Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
        return $request->user();
    });
});