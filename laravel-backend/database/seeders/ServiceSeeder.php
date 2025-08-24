<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Service;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $services = [
            [
                'name' => 'Personal Training',
                'description' => 'One-on-one training sessions with a certified personal trainer.',
                'duration_minutes' => 60,
                'price' => 45.00,
                'category' => 'personal-training',
                'is_active' => true,
            ],
            [
                'name' => 'EMS Training',
                'description' => 'Electrical Muscle Stimulation training for efficient workouts.',
                'duration_minutes' => 30,
                'price' => 35.00,
                'category' => 'ems-training',
                'is_active' => true,
            ],
            [
                'name' => 'Pilates Reformer',
                'description' => 'Specialized Pilates sessions using the reformer machine.',
                'duration_minutes' => 50,
                'price' => 40.00,
                'category' => 'pilates-reformer',
                'is_active' => true,
            ],
            [
                'name' => 'Cardio Personal',
                'description' => 'Focused cardio training sessions for improved endurance.',
                'duration_minutes' => 45,
                'price' => 35.00,
                'category' => 'cardio-personal',
                'is_active' => true,
            ],
            [
                'name' => 'Nutrition Consultation',
                'description' => 'Personalized nutrition planning and dietary guidance.',
                'duration_minutes' => 30,
                'price' => 25.00,
                'category' => 'nutrition',
                'is_active' => true,
            ],
            [
                'name' => 'Massage Therapy',
                'description' => 'Therapeutic massage for muscle recovery and relaxation.',
                'duration_minutes' => 60,
                'price' => 50.00,
                'category' => 'therapy',
                'is_active' => true,
            ],
        ];

        foreach ($services as $service) {
            Service::create($service);
        }
    }
}