# Laravel Backend Folder Structure

## Generated Laravel Project Structure

```
laravel-backend/
├── app/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── Controller.php
│   │       └── Api/
│   │           ├── AuthController.php
│   │           ├── FitnessClassController.php
│   │           ├── BookingController.php
│   │           ├── WorkoutController.php
│   │           ├── ProductController.php
│   │           ├── OrderController.php
│   │           ├── MeasurementController.php
│   │           ├── AppointmentController.php
│   │           ├── ServiceController.php
│   │           └── TrainerController.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── FitnessClass.php
│   │   ├── Booking.php
│   │   ├── Workout.php
│   │   ├── Product.php
│   │   ├── Order.php
│   │   ├── OrderItem.php
│   │   ├── Service.php
│   │   ├── Appointment.php
│   │   ├── Measurement.php
│   │   └── Trainer.php
│   └── Policies/
│       ├── BookingPolicy.php
│       ├── WorkoutPolicy.php
│       ├── OrderPolicy.php
│       ├── MeasurementPolicy.php
│       └── AppointmentPolicy.php
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000001_create_users_table.php
│   │   ├── 0001_01_01_000002_create_trainers_table.php
│   │   ├── 0001_01_01_000003_create_fitness_classes_table.php
│   │   ├── 0001_01_01_000004_create_bookings_table.php
│   │   ├── 0001_01_01_000005_create_workouts_table.php
│   │   ├── 0001_01_01_000006_create_products_table.php
│   │   ├── 0001_01_01_000007_create_orders_table.php
│   │   ├── 0001_01_01_000008_create_order_items_table.php
│   │   ├── 0001_01_01_000009_create_services_table.php
│   │   ├── 0001_01_01_000010_create_appointments_table.php
│   │   ├── 0001_01_01_000011_create_measurements_table.php
│   │   └── 0001_01_01_000012_create_personal_access_tokens_table.php
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php
│       ├── TrainerSeeder.php
│       ├── FitnessClassSeeder.php
│       ├── ProductSeeder.php
│       └── ServiceSeeder.php
├── routes/
│   └── api.php
├── .env.example
├── composer.json
└── README.md
```

## API Endpoints Overview

### Authentication Routes
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout (requires auth)
- `GET /api/auth/me` - Get current user (requires auth)

### Public Routes (No Authentication Required)
- `GET /api/classes` - List all fitness classes
- `GET /api/classes/{id}` - Get specific class details
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get specific product
- `GET /api/products/category/{category}` - Get products by category
- `GET /api/services` - List all services
- `GET /api/services/{id}` - Get specific service
- `GET /api/trainers` - List all trainers
- `GET /api/trainers/{id}` - Get trainer details
- `GET /api/trainers/{id}/schedule` - Get trainer schedule

### Protected Routes (Authentication Required)

#### User Bookings
- `GET /api/bookings` - List user's bookings
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/{id}` - Get booking details
- `PUT /api/bookings/{id}` - Update booking
- `DELETE /api/bookings/{id}` - Cancel booking

#### User Workouts
- `GET /api/workouts` - List user's workouts
- `POST /api/workouts` - Log new workout
- `GET /api/workouts/{id}` - Get workout details
- `PUT /api/workouts/{id}` - Update workout
- `DELETE /api/workouts/{id}` - Delete workout
- `GET /api/workouts-stats` - Get workout statistics

#### User Measurements
- `GET /api/measurements` - List user's measurements
- `POST /api/measurements` - Add new measurement
- `GET /api/measurements/{id}` - Get measurement details
- `PUT /api/measurements/{id}` - Update measurement
- `DELETE /api/measurements/{id}` - Delete measurement
- `GET /api/measurements-trends` - Get measurement trends for charts

#### User Orders
- `GET /api/orders` - List user's orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order details
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Cancel order

#### User Appointments
- `GET /api/appointments` - List user's appointments
- `POST /api/appointments` - Request new appointment
- `GET /api/appointments/{id}` - Get appointment details
- `PUT /api/appointments/{id}` - Update appointment
- `DELETE /api/appointments/{id}` - Cancel appointment

### Admin Routes (Requires Admin Access)
- Class Management: `/api/admin/classes/*`
- Product Management: `/api/admin/products/*`
- Service Management: `/api/admin/services/*`
- Trainer Management: `/api/admin/trainers/*`
- Order Management: `/api/admin/orders/*`
- Appointment Management: `/api/admin/appointments/*`

## Database Models and Relationships

### User
- Has many: bookings, workouts, measurements, orders, appointments
- Fields: first_name, last_name, email, password, phone, date_of_birth, referral_source, membership info

### FitnessClass
- Belongs to: trainer (instructor)
- Has many: bookings
- Fields: name, description, duration, max_capacity, location, class_type, difficulty_level, schedule info

### Booking
- Belongs to: user, fitness_class
- Fields: booking_date, status, notes

### Workout
- Belongs to: user, fitness_class (optional), trainer (optional)
- Fields: name, workout_type, duration, calories_burned, rating, notes, completed_at

### Product
- Has many: order_items
- Fields: name, description, price, category, image_url, stock_quantity, sku

### Order & OrderItem
- Order belongs to: user, has many: order_items
- OrderItem belongs to: order, product
- Order fields: total_amount, status, pickup_option, contact info
- OrderItem fields: quantity, unit_price, total_price, options

### Service & Appointment
- Service has many: appointments
- Appointment belongs to: user, service, trainer (optional)
- Service fields: name, description, service_type, duration, price
- Appointment fields: appointment_date, appointment_time, status, notes, preferred_times

### Measurement
- Belongs to: user
- Fields: measurement_date, weight, height, body measurements, body_fat_percentage, muscle_mass, notes

### Trainer
- Has many: fitness_classes, workouts, appointments
- Fields: first_name, last_name, email, phone, bio, specializations, experience_years, certifications

## Authentication & Authorization

- **Sanctum-based API authentication** with token-based auth
- **Policy-based authorization** for user-owned resources
- **Admin middleware** for administrative functions
- **CORS configuration** for frontend integration

## Database Features

- **MySQL database** with comprehensive migrations
- **Comprehensive seeders** with sample data
- **Foreign key constraints** maintaining data integrity
- **Indexed columns** for optimal query performance
- **JSON columns** for flexible data storage (specializations, certifications, options)