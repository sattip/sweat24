# Sweat24 Laravel Backend

This Laravel 11 backend provides the API for the Sweat24 fitness application.

## Generated Models and Features

Based on analysis of the React frontend, this backend includes:

### Models
- User (authentication, profile management)
- Class (fitness classes)
- Booking (class reservations)
- Workout (workout history)
- Product (store items)
- Order & OrderItem (e-commerce)
- Service (specialized services)
- Appointment (service bookings)
- Measurement (body measurements)
- Trainer (instructors)

### API Endpoints
All endpoints follow the `/api/*` convention with Sanctum authentication.

### Features
- Laravel Sanctum authentication
- RESTful API controllers
- Database migrations
- Model factories and seeders
- Policy-based authorization
- MySQL database support

## Setup Instructions

1. Install dependencies: `composer install`
2. Copy environment file: `cp .env.example .env`
3. Generate application key: `php artisan key:generate`
4. Configure database settings in `.env`
5. Run migrations: `php artisan migrate`
6. Seed database: `php artisan db:seed`
7. Install Sanctum: `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
8. Start server: `php artisan serve`

## API Documentation

See the generated API routes for complete endpoint documentation.