# Sweat24 Laravel Backend API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication

All authenticated requests must include the Bearer token in the Authorization header:
```
Authorization: Bearer your-auth-token-here
```

## Example API Calls

### Authentication

#### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "phone": "+30 6944 123456",
    "date_of_birth": "1990-05-15",
    "referral_source": "friend",
    "referral_name": "Jane Smith"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

### Classes

#### Get All Classes
```bash
curl -X GET "http://localhost:8000/api/classes?type=Yoga&difficulty=intermediate&per_page=10"
```

#### Get Class Details
```bash
curl -X GET http://localhost:8000/api/classes/1
```

### Bookings

#### Create Booking
```bash
curl -X POST http://localhost:8000/api/bookings \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": 1,
    "booking_date": "2025-05-25T07:30:00Z",
    "notes": "First time trying yoga"
  }'
```

#### Get User Bookings
```bash
curl -X GET "http://localhost:8000/api/bookings?upcoming=true&per_page=10" \
  -H "Authorization: Bearer your-token"
```

### Workouts

#### Log Workout
```bash
curl -X POST http://localhost:8000/api/workouts \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "class_id": 1,
    "trainer_id": 1,
    "name": "Power Yoga Session",
    "workout_type": "Yoga",
    "duration": 60,
    "calories_burned": 300,
    "rating": 4.5,
    "notes": "Great session, felt very relaxed",
    "completed_at": "2025-05-24T08:30:00Z"
  }'
```

#### Get Workout Statistics
```bash
curl -X GET http://localhost:8000/api/workouts-stats \
  -H "Authorization: Bearer your-token"
```

### Products

#### Get Products by Category
```bash
curl -X GET "http://localhost:8000/api/products?category=supplements&in_stock=true&per_page=10"
```

#### Get Product Details
```bash
curl -X GET http://localhost:8000/api/products/1
```

### Orders

#### Create Order
```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "options": {
          "size": "Large",
          "flavor": "Vanilla"
        }
      },
      {
        "product_id": 3,
        "quantity": 1,
        "options": {
          "color": "Black"
        }
      }
    ],
    "pickup_option": "gym",
    "contact_name": "John Doe",
    "contact_email": "john.doe@example.com",
    "contact_phone": "+30 6944 123456",
    "notes": "Please call when ready for pickup"
  }'
```

### Measurements

#### Add Body Measurement
```bash
curl -X POST http://localhost:8000/api/measurements \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "measurement_date": "2025-05-24",
    "weight": 75.5,
    "height": 175.0,
    "waist": 80.0,
    "hips": 95.0,
    "chest": 100.0,
    "arm": 35.0,
    "thigh": 55.0,
    "body_fat_percentage": 18.5,
    "muscle_mass": 45.2,
    "notes": "Monthly measurement after 3 months of training"
  }'
```

#### Get Measurement Trends
```bash
curl -X GET http://localhost:8000/api/measurements-trends \
  -H "Authorization: Bearer your-token"
```

### Appointments

#### Request Service Appointment
```bash
curl -X POST http://localhost:8000/api/appointments \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "service_id": 1,
    "trainer_id": 2,
    "appointment_date": "2025-05-28",
    "appointment_time": "14:00",
    "notes": "First personal training session",
    "preferred_times": [
      {"date": "2025-05-28", "time": "14:00"},
      {"date": "2025-05-29", "time": "10:00"},
      {"date": "2025-05-30", "time": "16:00"}
    ]
  }'
```

### Services

#### Get All Services
```bash
curl -X GET "http://localhost:8000/api/services?type=personal-training&active=true"
```

### Trainers

#### Get All Trainers
```bash
curl -X GET "http://localhost:8000/api/trainers?specialization=Yoga&per_page=10"
```

#### Get Trainer Schedule
```bash
curl -X GET "http://localhost:8000/api/trainers/1/schedule?date=2025-05-25"
```

## Response Examples

### Successful Authentication Response
```json
{
  "access_token": "1|abc123def456...",
  "token_type": "Bearer",
  "user": {
    "id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "full_name": "John Doe",
    "membership_type": "basic",
    "membership_status": "active",
    "created_at": "2025-05-24T10:00:00.000000Z"
  }
}
```

### Class List Response
```json
{
  "data": [
    {
      "id": 1,
      "name": "Power Yoga",
      "description": "Dynamic yoga flow combining strength, flexibility, and mindfulness.",
      "duration": 60,
      "max_capacity": 15,
      "location": "Yoga Studio",
      "class_type": "Yoga",
      "difficulty_level": "intermediate",
      "start_time": "2025-05-25T07:30:00.000000Z",
      "end_time": "2025-05-25T08:30:00.000000Z",
      "available_spots": 6,
      "instructor": {
        "id": 1,
        "first_name": "Emma",
        "last_name": "Wilson",
        "full_name": "Emma Wilson"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 5
  }
}
```

### Workout Statistics Response
```json
{
  "total_workouts": 25,
  "total_duration": 1500,
  "total_calories": 12500,
  "average_rating": 4.2,
  "this_month_workouts": 8,
  "workout_types": [
    {"workout_type": "Yoga", "count": 8},
    {"workout_type": "HIIT", "count": 6},
    {"workout_type": "Strength", "count": 5},
    {"workout_type": "Cycling", "count": 6}
  ]
}
```

### Error Response
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

## Status Codes

- `200` - OK
- `201` - Created
- `204` - No Content (for deletions)
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., class is full)
- `422` - Validation Error
- `500` - Internal Server Error

## Frontend Integration Examples

### React/JavaScript Examples

#### Login and Store Token
```javascript
const login = async (email, password) => {
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (response.ok) {
    localStorage.setItem('authToken', data.access_token);
    return data.user;
  }
  throw new Error(data.message);
};
```

#### Authenticated API Call
```javascript
const fetchUserBookings = async () => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('http://localhost:8000/api/bookings', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (response.ok) {
    return await response.json();
  }
  throw new Error('Failed to fetch bookings');
};
```

#### Create Booking
```javascript
const createBooking = async (classId, bookingDate, notes = '') => {
  const token = localStorage.getItem('authToken');
  const response = await fetch('http://localhost:8000/api/bookings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      class_id: classId,
      booking_date: bookingDate,
      notes: notes,
    }),
  });

  if (response.ok) {
    return await response.json();
  }
  const error = await response.json();
  throw new Error(error.message);
};
```

## CORS Configuration

The Laravel backend is configured to accept requests from your React frontend. Make sure to update the CORS settings in your Laravel configuration if deploying to production with a different domain.