<?php

namespace Database\Seeders;

use App\Models\FitnessClass;
use App\Models\Trainer;
use Illuminate\Database\Seeder;

class FitnessClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trainers = Trainer::all();

        FitnessClass::create([
            'name' => 'Power Yoga',
            'description' => 'Dynamic yoga flow combining strength, flexibility, and mindfulness.',
            'instructor_id' => $trainers->where('first_name', 'Emma')->first()->id,
            'duration' => 60,
            'max_capacity' => 15,
            'location' => 'Yoga Studio',
            'class_type' => 'Yoga',
            'difficulty_level' => 'intermediate',
            'start_time' => now()->setTime(7, 30),
            'end_time' => now()->setTime(8, 30),
            'recurring_pattern' => 'weekly',
            'is_active' => true,
        ]);

        FitnessClass::create([
            'name' => 'HIIT Blast',
            'description' => 'High-intensity interval training for maximum calorie burn.',
            'instructor_id' => $trainers->where('first_name', 'Mike')->first()->id,
            'duration' => 45,
            'max_capacity' => 20,
            'location' => 'Main Floor',
            'class_type' => 'HIIT',
            'difficulty_level' => 'advanced',
            'start_time' => now()->setTime(12, 0),
            'end_time' => now()->setTime(12, 45),
            'recurring_pattern' => 'daily',
            'is_active' => true,
        ]);

        FitnessClass::create([
            'name' => 'Spin Class',
            'description' => 'High-energy indoor cycling with motivating music.',
            'instructor_id' => $trainers->where('first_name', 'Sarah')->first()->id,
            'duration' => 60,
            'max_capacity' => 25,
            'location' => 'Cycling Studio',
            'class_type' => 'Cycling',
            'difficulty_level' => 'intermediate',
            'start_time' => now()->setTime(18, 0),
            'end_time' => now()->setTime(19, 0),
            'recurring_pattern' => 'weekly',
            'is_active' => true,
        ]);

        FitnessClass::create([
            'name' => 'Strength Training',
            'description' => 'Build muscle and strength with guided weight training.',
            'instructor_id' => $trainers->where('first_name', 'Chris')->first()->id,
            'duration' => 60,
            'max_capacity' => 12,
            'location' => 'Weight Room',
            'class_type' => 'Strength',
            'difficulty_level' => 'intermediate',
            'start_time' => now()->setTime(8, 0),
            'end_time' => now()->setTime(9, 0),
            'recurring_pattern' => 'weekly',
            'is_active' => true,
        ]);

        FitnessClass::create([
            'name' => 'Boxing Fundamentals',
            'description' => 'Learn basic boxing techniques while getting a great workout.',
            'instructor_id' => $trainers->where('first_name', 'Mike')->first()->id,
            'duration' => 60,
            'max_capacity' => 16,
            'location' => 'Boxing Area',
            'class_type' => 'Combat',
            'difficulty_level' => 'beginner',
            'start_time' => now()->setTime(19, 0),
            'end_time' => now()->setTime(20, 0),
            'recurring_pattern' => 'weekly',
            'is_active' => true,
        ]);
    }
}