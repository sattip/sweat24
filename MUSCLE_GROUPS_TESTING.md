# Muscle Groups Feature - Testing Guide

## Επισκόπηση

Η λειτουργία καταγραφής μυϊκών ομάδων επιτρέπει στους χρήστες να καταγράφουν ποιες μυϊκές ομάδες γύμνασαν σε κάθε προπόνηση που παρακολούθησαν.

## Frontend Implementation

### Αλλαγές που έγιναν:

1. **Νέο Component: `MuscleGroupDialog.tsx`**
   - Lokation: `src/components/workouts/MuscleGroupDialog.tsx`
   - Λειτουργία: Dialog για επιλογή μυϊκών ομάδων
   - Features:
     - Επιλογή από 8 προκαθορισμένες μυϊκές ομάδες
     - Αυτόματη φόρτωση αποθηκευμένων επιλογών
     - Validation logic (Total Body vs άλλες ομάδες)
     - Integration με API

2. **Service: `muscleGroupService`**
   - Location: `src/services/apiService.ts` (τέλος του αρχείου)
   - Functions:
     - `saveMuscleGroups(bookingId, muscleGroups)` - POST /api/v1/workouts/{id}/muscle-groups
     - `getMuscleGroups(bookingId)` - GET /api/v1/workouts/{id}/muscle-groups

3. **Updated: `WorkoutHistoryPage.tsx`**
   - Προσθήκη κουμπιού "Καταγραφή μυϊκών ομάδων"
   - Visual indicator όταν έχουν ήδη καταγραφεί μυϊκές ομάδες (checkmark)
   - Αυτόματη ανανέωση μετά την αποθήκευση

4. **Updated: `DashboardPage.tsx`**
   - Νέο Quick Action card για Ιστορικό Προπονήσεων

5. **Updated: `App.tsx`**
   - Προσθήκη route `/workout-history`

## Πώς να δοκιμάσετε το Feature

### Option 1: Μέσω UI (Recommended)

1. **Login** στην εφαρμογή
2. Πηγαίνετε στο **Dashboard**
3. Κάντε κλικ στο **"Ιστορικό Προπονήσεων"**
4. Επιλέξτε μια προπόνηση που έχετε παρακολουθήσει (με παρουσία)
5. Κάντε κλικ στο **"Καταγραφή μυϊκών ομάδων"**
6. Επιλέξτε τις μυϊκές ομάδες που γυμνάσατε
7. Κάντε κλικ **"Αποθήκευση"**

**Αποτέλεσμα:**
- Το κουμπί θα αλλάξει σε "Επεξεργασία μυϊκών ομάδων" με checkmark
- Οι μυϊκές ομάδες θα αποθηκευτούν στο backend

### Option 2: Μέσω Console (Advanced Testing)

1. **Login** στην εφαρμογή
2. Ανοίξτε το **Browser Console** (F12)
3. Αντιγράψτε και κάντε paste το περιεχόμενο του `test-muscle-groups.ts`
4. Ενημερώστε τις μεταβλητές:
   ```javascript
   const TEST_CONFIG = {
     baseUrl: 'https://api.sweat93.gr/api/v1',
     authToken: localStorage.getItem('auth_token'), // Auto-loaded
     testBookingId: 123, // CHANGE THIS to actual booking ID
     testUserId: 45,     // CHANGE THIS to actual user ID
   };
   ```
5. Τρέξτε τα tests:
   ```javascript
   // Τρέξτε όλα τα tests
   runAllTests();

   // Ή τρέξτε συγκεκριμένα tests
   testSaveMuscleGroups();
   testGetMuscleGroups();
   testGetWorkoutHistory();
   ```

### Option 3: Μέσω cURL

```bash
# 1. Save muscle groups
curl -X POST https://api.sweat93.gr/api/v1/workouts/123/muscle-groups \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"muscle_groups": ["legs", "core"]}'

# 2. Get muscle groups
curl -X GET https://api.sweat93.gr/api/v1/workouts/123/muscle-groups \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Get workout history
curl -X GET "https://api.sweat93.gr/api/test-history?user_id=45"
```

## Expected API Responses

### POST /api/v1/workouts/{id}/muscle-groups (Success)

```json
{
  "success": true,
  "message": "Muscle groups saved successfully",
  "data": {
    "id": 1,
    "booking_id": 123,
    "user_id": 45,
    "muscle_groups": ["legs", "core"],
    "created_at": "2025-10-14T10:30:00.000000Z",
    "updated_at": "2025-10-14T10:30:00.000000Z"
  }
}
```

### GET /api/v1/workouts/{id}/muscle-groups (Success)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "booking_id": 123,
    "user_id": 45,
    "muscle_groups": ["legs", "core"],
    "created_at": "2025-10-14T10:30:00.000000Z",
    "updated_at": "2025-10-14T10:30:00.000000Z"
  }
}
```

### GET /api/test-history (Success)

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
    "muscle_groups": ["legs", "core"],
    "muscle_groups_recorded": true
  }
]
```

## Validation Tests

### Test 1: Empty Array (Should Fail - 422)

```json
{
  "muscle_groups": []
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "muscle_groups": ["The muscle groups must have at least 1 items."]
  }
}
```

### Test 2: Invalid Muscle Group (Should Fail - 422)

```json
{
  "muscle_groups": ["invalid_group"]
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "muscle_groups.0": ["The selected muscle groups.0 is invalid."]
  }
}
```

### Test 3: Unauthorized Access (Should Fail - 403)

Προσπάθεια αποθήκευσης μυϊκών ομάδων για booking που δεν ανήκει στον χρήστη.

**Expected Response:**
```json
{
  "success": false,
  "message": "Unauthorized access to this booking"
}
```

### Test 4: Workout Not Attended (Should Fail - 422)

Προσπάθεια αποθήκευσης μυϊκών ομάδων για booking που δεν παρακολούθησε ο χρήστης.

**Expected Response:**
```json
{
  "success": false,
  "message": "Cannot record muscle groups for a workout you did not attend"
}
```

## Troubleshooting

### Πρόβλημα: "Not authenticated"

**Λύση:**
1. Κάντε login ξανά
2. Ελέγξτε ότι υπάρχει `auth_token` στο localStorage:
   ```javascript
   console.log(localStorage.getItem('auth_token'));
   ```

### Πρόβλημα: "Unauthorized access to this booking"

**Λύση:**
- Βεβαιωθείτε ότι χρησιμοποιείτε booking ID που ανήκει στον συνδεδεμένο χρήστη

### Πρόβλημα: "Cannot record muscle groups for a workout you did not attend"

**Λύση:**
- Μόνο workouts με `attended = 1` μπορούν να έχουν καταγραφή μυϊκών ομάδων
- Χρησιμοποιήστε το `/api/test-history` endpoint για να βρείτε attended workouts

### Πρόβλημα: Δεν εμφανίζεται το checkmark μετά την αποθήκευση

**Λύση:**
1. Ελέγξτε το console για errors
2. Κλείστε και ξανανοίξτε το dialog
3. Refresh τη σελίδα

## Available Muscle Groups

Οι έγκυρες τιμές για το `muscle_groups` array:

1. `total_body` - Total Body (προεπιλογή)
2. `legs` - Πόδια
3. `chest` - Στήθος
4. `back` - Πλάτη
5. `shoulders` - Ώμοι
6. `arms` - Χέρια
7. `core` - Κοιλιακοί
8. `cardio` - Καρδιο

## Database Verification

Για να επαληθεύσετε ότι τα δεδομένα αποθηκεύτηκαν στη βάση:

```sql
-- Check all muscle groups records
SELECT * FROM workout_muscle_groups;

-- Check muscle groups for specific booking
SELECT * FROM workout_muscle_groups WHERE booking_id = 123;

-- Check muscle groups for specific user
SELECT * FROM workout_muscle_groups WHERE user_id = 45;

-- Join with bookings to see full details
SELECT
  wmg.*,
  b.class_id,
  c.name as class_name,
  b.attended
FROM workout_muscle_groups wmg
JOIN bookings b ON wmg.booking_id = b.id
JOIN classes c ON b.class_id = c.id
WHERE wmg.user_id = 45;
```

## Notes

- Κάθε booking μπορεί να έχει μόνο μία καταγραφή μυϊκών ομάδων
- Αν υπάρχει ήδη καταγραφή, θα γίνει update (όχι insert)
- Η προεπιλεγμένη τιμή είναι `["total_body"]`
- Το frontend αποτρέπει την ταυτόχρονη επιλογή "Total Body" με άλλες ομάδες
