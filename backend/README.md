# Sweat24 Laravel Backend

This folder contains a minimal Laravel 11 project structure. Install dependencies and run migrations:

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

The API uses Laravel Sanctum for authentication.
