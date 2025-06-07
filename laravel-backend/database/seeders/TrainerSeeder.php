<?php

namespace Database\Seeders;

use App\Models\Trainer;
use Illuminate\Database\Seeder;

class TrainerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Trainer::create([
            'first_name' => 'Emma',
            'last_name' => 'Wilson',
            'email' => 'emma.wilson@sweat24.com',
            'phone' => '+30 210 123 4567',
            'bio' => 'Certified yoga instructor with 8+ years of experience in Power Yoga and Vinyasa flow.',
            'specializations' => ['Yoga', 'Pilates', 'Meditation'],
            'experience_years' => 8,
            'certifications' => ['RYT-500', 'Pilates Certification', 'Meditation Teacher Training'],
            'is_active' => true,
        ]);

        Trainer::create([
            'first_name' => 'Mike',
            'last_name' => 'Johnson',
            'email' => 'mike.johnson@sweat24.com',
            'phone' => '+30 210 123 4568',
            'bio' => 'High-intensity interval training specialist and former competitive athlete.',
            'specializations' => ['HIIT', 'CrossFit', 'Athletic Training'],
            'experience_years' => 6,
            'certifications' => ['ACSM-CPT', 'CrossFit Level 2', 'TRX Certification'],
            'is_active' => true,
        ]);

        Trainer::create([
            'first_name' => 'Sarah',
            'last_name' => 'Davis',
            'email' => 'sarah.davis@sweat24.com',
            'phone' => '+30 210 123 4569',
            'bio' => 'Cycling enthusiast and indoor cycling instructor passionate about music-driven workouts.',
            'specializations' => ['Cycling', 'Spin', 'Cardio'],
            'experience_years' => 5,
            'certifications' => ['Spinning Instructor', 'Indoor Cycling Certification'],
            'is_active' => true,
        ]);

        Trainer::create([
            'first_name' => 'Chris',
            'last_name' => 'Taylor',
            'email' => 'chris.taylor@sweat24.com',
            'phone' => '+30 210 123 4570',
            'bio' => 'Strength and conditioning coach with expertise in Olympic lifting and powerlifting.',
            'specializations' => ['Strength Training', 'Powerlifting', 'Olympic Lifting'],
            'experience_years' => 10,
            'certifications' => ['NSCA-CSCS', 'USA Weightlifting', 'Powerlifting Coach'],
            'is_active' => true,
        ]);

        Trainer::create([
            'first_name' => 'James',
            'last_name' => 'Miller',
            'email' => 'james.miller@sweat24.com',
            'phone' => '+30 210 123 4571',
            'bio' => 'Personal trainer specializing in functional movement and injury prevention.',
            'specializations' => ['Personal Training', 'Functional Movement', 'Rehabilitation'],
            'experience_years' => 7,
            'certifications' => ['NASM-CPT', 'FMS Level 2', 'Corrective Exercise Specialist'],
            'is_active' => true,
        ]);
    }
}