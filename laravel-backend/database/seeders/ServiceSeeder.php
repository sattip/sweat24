<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Service::create([
            'name' => 'Personal Training',
            'description' => 'One-on-one training sessions with a certified personal trainer tailored to your specific fitness goals.',
            'service_type' => 'personal-training',
            'duration' => 60,
            'price' => 75.00,
            'is_active' => true,
        ]);

        Service::create([
            'name' => 'EMS Training',
            'description' => 'Electrical Muscle Stimulation training that activates more muscle fibers in less time.',
            'service_type' => 'ems-training',
            'duration' => 45,
            'price' => 85.00,
            'is_active' => true,
        ]);

        Service::create([
            'name' => 'Pilates Reformer',
            'description' => 'Specialized Pilates sessions using the reformer machine for improved core strength and flexibility.',
            'service_type' => 'pilates-reformer',
            'duration' => 50,
            'price' => 65.00,
            'is_active' => true,
        ]);

        Service::create([
            'name' => 'Cardio Personal',
            'description' => 'Focused cardio training sessions designed to improve your cardiovascular health and endurance.',
            'service_type' => 'cardio-personal',
            'duration' => 45,
            'price' => 55.00,
            'is_active' => true,
        ]);
    }
}