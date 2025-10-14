# Muscle Groups Feature - Backend Requirements

## Overview
Αυτό το έγγραφο περιγράφει τις απαιτήσεις για την υλοποίηση της λειτουργικότητας καταγραφής μυϊκών ομάδων για προπονήσεις.

## Database Schema

### Νέος Πίνακας: `workout_muscle_groups`

```sql
CREATE TABLE workout_muscle_groups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    muscle_groups JSON NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,

    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking_muscle_groups (booking_id)
);
```

**Εξήγηση:**
- `booking_id`: Το ID της κράτησης/προπόνησης
- `user_id`: Το ID του χρήστη
- `muscle_groups`: JSON array με τις επιλεγμένες μυϊκές ομάδες (π.χ. `["total_body"]`, `["legs", "chest"]`)
- `UNIQUE KEY`: Κάθε booking μπορεί να έχει μόνο μία καταγραφή μυϊκών ομάδων

### Διαθέσιμες Μυϊκές Ομάδες

Οι επιτρεπόμενες τιμές στο `muscle_groups` JSON array:
- `total_body` - Total Body (προεπιλογή)
- `legs` - Πόδια
- `chest` - Στήθος
- `back` - Πλάτη
- `shoulders` - Ώμοι
- `arms` - Χέρια
- `core` - Κοιλιακοί
- `cardio` - Καρδιο

## API Endpoints

### 1. Αποθήκευση Μυϊκών Ομάδων

**Endpoint:** `POST /api/v1/workouts/{booking_id}/muscle-groups`

**Request Body:**
```json
{
  "muscle_groups": ["total_body"]
}
```

**Παράδειγμα με πολλαπλές επιλογές:**
```json
{
  "muscle_groups": ["legs", "chest", "core"]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Muscle groups saved successfully",
  "data": {
    "id": 1,
    "booking_id": 123,
    "user_id": 45,
    "muscle_groups": ["total_body"],
    "created_at": "2025-10-14T10:30:00.000000Z",
    "updated_at": "2025-10-14T10:30:00.000000Z"
  }
}
```

**Response (Error - 422):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "muscle_groups": [
      "The muscle groups field is required.",
      "The muscle groups must be an array.",
      "Invalid muscle group selected."
    ]
  }
}
```

**Validation Rules:**
- `muscle_groups`: required, array, min:1
- Each item in `muscle_groups` must be one of: `total_body`, `legs`, `chest`, `back`, `shoulders`, `arms`, `core`, `cardio`

**Business Logic:**
1. Έλεγχος ότι το booking ανήκει στον authenticated χρήστη
2. Έλεγχος ότι το booking έχει status "attended" (ο χρήστης πρέπει να είχε παρουσία)
3. Αν υπάρχει ήδη καταγραφή για αυτό το booking, θα γίνει update (όχι insert)
4. Προεπιλογή: αν δεν υπάρχει καταγραφή, το default είναι `["total_body"]`

### 2. Ανάκτηση Μυϊκών Ομάδων για Συγκεκριμένη Προπόνηση

**Endpoint:** `GET /api/v1/workouts/{booking_id}/muscle-groups`

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 123,
    "user_id": 45,
    "muscle_groups": ["total_body"],
    "created_at": "2025-10-14T10:30:00.000000Z",
    "updated_at": "2025-10-14T10:30:00.000000Z"
  }
}
```

**Response (Not Found - 404):**
```json
{
  "success": false,
  "message": "No muscle groups recorded for this workout"
}
```

### 3. Ενημερωμένο Endpoint Ιστορικού Προπονήσεων

**Endpoint:** `GET /api/test-history?user_id={user_id}`

**Προσθήκη στο Response:**
Το response πρέπει να περιλαμβάνει και τις μυϊκές ομάδες για κάθε προπόνηση.

**Ενημερωμένο Response:**
```json
[
  {
    "id": 123,
    "user_id": 45,
    "class_id": 10,
    "class_name": "HIIT Training",
    "instructor": "Γιάννης Παπαδόπουλος",
    "date": "2025-10-10",
    "time": "18:00",
    "type": "HIIT",
    "attended": 1,
    "muscle_groups": ["legs", "core"],  // ⬅️ ΝΕΟ ΠΕΔΙΟ
    "muscle_groups_recorded": true      // ⬅️ ΝΕΟ ΠΕΔΙΟ (boolean)
  },
  {
    "id": 122,
    "user_id": 45,
    "class_id": 8,
    "class_name": "Yoga Flow",
    "instructor": "Μαρία Κωνσταντίνου",
    "date": "2025-10-08",
    "time": "10:00",
    "type": "Yoga",
    "attended": 1,
    "muscle_groups": null,              // ⬅️ Δεν έχει καταγραφή
    "muscle_groups_recorded": false     // ⬅️ false όταν δεν υπάρχει καταγραφή
  }
]
```

## Laravel Implementation Example

### Model: `WorkoutMuscleGroup.php`

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkoutMuscleGroup extends Model
{
    protected $fillable = [
        'booking_id',
        'user_id',
        'muscle_groups',
    ];

    protected $casts = [
        'muscle_groups' => 'array',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Validation constants
    public const VALID_MUSCLE_GROUPS = [
        'total_body',
        'legs',
        'chest',
        'back',
        'shoulders',
        'arms',
        'core',
        'cardio',
    ];
}
```

### Controller: `WorkoutMuscleGroupController.php`

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\WorkoutMuscleGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WorkoutMuscleGroupController extends Controller
{
    /**
     * Store or update muscle groups for a workout
     */
    public function store(Request $request, $bookingId)
    {
        // Validate request
        $validated = $request->validate([
            'muscle_groups' => [
                'required',
                'array',
                'min:1',
            ],
            'muscle_groups.*' => [
                'required',
                'string',
                'in:' . implode(',', WorkoutMuscleGroup::VALID_MUSCLE_GROUPS),
            ],
        ]);

        // Get the booking
        $booking = Booking::findOrFail($bookingId);

        // Check if booking belongs to authenticated user
        if ($booking->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this booking',
            ], 403);
        }

        // Check if user attended the workout
        if (!$booking->attended) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot record muscle groups for a workout you did not attend',
            ], 422);
        }

        // Update or create muscle groups record
        $muscleGroups = WorkoutMuscleGroup::updateOrCreate(
            [
                'booking_id' => $bookingId,
                'user_id' => Auth::id(),
            ],
            [
                'muscle_groups' => $validated['muscle_groups'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Muscle groups saved successfully',
            'data' => $muscleGroups,
        ], 200);
    }

    /**
     * Get muscle groups for a specific workout
     */
    public function show($bookingId)
    {
        $booking = Booking::findOrFail($bookingId);

        // Check if booking belongs to authenticated user
        if ($booking->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to this booking',
            ], 403);
        }

        $muscleGroups = WorkoutMuscleGroup::where('booking_id', $bookingId)
            ->where('user_id', Auth::id())
            ->first();

        if (!$muscleGroups) {
            return response()->json([
                'success' => false,
                'message' => 'No muscle groups recorded for this workout',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $muscleGroups,
        ], 200);
    }
}
```

### Routes: `api.php`

```php
// Muscle Groups routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/workouts/{bookingId}/muscle-groups', [WorkoutMuscleGroupController::class, 'store']);
    Route::get('/workouts/{bookingId}/muscle-groups', [WorkoutMuscleGroupController::class, 'show']);
});
```

### Updated Test History Endpoint

Στο existing controller που επιστρέφει το workout history, προσθέστε:

```php
// In your existing workout history query
$workouts = Booking::where('user_id', $userId)
    ->where('attended', 1)
    ->with(['muscleGroups']) // Add relationship
    ->get()
    ->map(function ($booking) {
        return [
            'id' => $booking->id,
            'user_id' => $booking->user_id,
            'class_id' => $booking->class_id,
            'class_name' => $booking->class->name,
            'instructor' => $booking->class->instructor->name,
            'date' => $booking->class->date,
            'time' => $booking->class->time,
            'type' => $booking->class->type,
            'attended' => $booking->attended,
            'muscle_groups' => $booking->muscleGroups?->muscle_groups,
            'muscle_groups_recorded' => $booking->muscleGroups !== null,
        ];
    });
```

Προσθέστε το relationship στο `Booking` model:

```php
// In Booking.php model
public function muscleGroups()
{
    return $this->hasOne(WorkoutMuscleGroup::class);
}
```

## Testing

### Test Cases

1. **Επιτυχής αποθήκευση με total_body**
   - POST `/api/v1/workouts/123/muscle-groups` με `{"muscle_groups": ["total_body"]}`
   - Αναμένεται: 200 OK

2. **Επιτυχής αποθήκευση με πολλαπλές ομάδες**
   - POST `/api/v1/workouts/123/muscle-groups` με `{"muscle_groups": ["legs", "chest", "core"]}`
   - Αναμένεται: 200 OK

3. **Validation error - κενό array**
   - POST `/api/v1/workouts/123/muscle-groups` με `{"muscle_groups": []}`
   - Αναμένεται: 422 Validation Error

4. **Validation error - μη έγκυρη ομάδα**
   - POST `/api/v1/workouts/123/muscle-groups` με `{"muscle_groups": ["invalid_group"]}`
   - Αναμένεται: 422 Validation Error

5. **Unauthorized access**
   - POST `/api/v1/workouts/123/muscle-groups` για booking που δεν ανήκει στον χρήστη
   - Αναμένεται: 403 Forbidden

6. **Workout not attended**
   - POST `/api/v1/workouts/123/muscle-groups` για booking με `attended = 0`
   - Αναμένεται: 422 Validation Error

## Notes

- Η λειτουργικότητα είναι ήδη υλοποιημένη στο frontend
- Το frontend χρησιμοποιεί mock data μέχρι να υλοποιηθεί το backend
- Η προεπιλεγμένη τιμή είναι `["total_body"]`
- Όταν ο χρήστης επιλέξει "Total Body" και άλλη ομάδα, το "Total Body" αφαιρείται αυτόματα
- Όταν ο χρήστης επιλέξει μόνο "Total Body", όλες οι άλλες επιλογές αφαιρούνται
