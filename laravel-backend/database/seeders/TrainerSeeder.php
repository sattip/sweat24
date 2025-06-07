<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Trainer;

class TrainerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trainers = [
            [
                'first_name' => 'John',
                'last_name' => 'Smith',
                'email' => 'john.smith@sweat24.com',
                'phone' => '+30 6944 111111',
                'specialties' => ['Strength & Conditioning', 'CrossFit', 'Olympic Lifting'],
                'bio' => 'Certified strength and conditioning specialist with 8 years of experience.',
                'experience_years' => 8,
                'certifications' => ['CSCS', 'CrossFit Level 2', 'Olympic Weightlifting'],
                'hourly_rate' => 45.00,
                'is_active' => true,
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'email' => 'sarah.johnson@sweat24.com',
                'phone' => '+30 6944 222222',
                'specialties' => ['Pilates', 'Flexibility', 'Rehabilitation'],
                'bio' => 'Pilates instructor specialized in injury rehabilitation and flexibility training.',
                'experience_years' => 6,
                'certifications' => ['Pilates Method Alliance', 'Physical Therapy Assistant'],
                'hourly_rate' => 50.00,
                'is_active' => true,
            ],
            [
                'first_name' => 'Mike',
                'last_name' => 'Thompson',
                'email' => 'mike.thompson@sweat24.com',
                'phone' => '+30 6944 333333',
                'specialties' => ['EMS Training', 'Cardio', 'HIIT'],
                'bio' => 'EMS training specialist and cardio expert with focus on high-intensity workouts.',
                'experience_years' => 5,
                'certifications' => ['EMS Certification', 'HIIT Specialist', 'Cardio Instructor'],
                'hourly_rate' => 40.00,
                'is_active' => true,
            ],
            [
                'first_name' => 'Chris',
                'last_name' => 'Taylor',
                'email' => 'chris.taylor@sweat24.com',
                'phone' => '+30 6944 444444',
                'specialties' => ['Strength Training', 'Bodybuilding', 'Nutrition'],
                'bio' => 'Professional bodybuilder and strength coach with nutrition expertise.',
                'experience_years' => 10,
                'certifications' => ['IFBB Pro', 'Nutrition Specialist', 'Personal Training'],
                'hourly_rate' => 55.00,
                'is_active' => true,
            ],
        ];

        foreach ($trainers as $trainer) {
            Trainer::create($trainer);
        }
    }
}