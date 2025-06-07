<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Workout;
use App\Models\Trainer;

class WorkoutSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $johnSmith = Trainer::where('email', 'john.smith@sweat24.com')->first();
        $sarahJohnson = Trainer::where('email', 'sarah.johnson@sweat24.com')->first();
        $mikeThompson = Trainer::where('email', 'mike.thompson@sweat24.com')->first();
        $chrisTaylor = Trainer::where('email', 'chris.taylor@sweat24.com')->first();

        $workouts = [
            [
                'name' => 'Morning Yoga',
                'description' => 'Start your day with energizing yoga flow',
                'type' => 'Yoga',
                'duration_minutes' => 60,
                'instructor_id' => $sarahJohnson->id,
                'capacity' => 15,
                'location' => 'Στούντιο Yoga',
                'difficulty_level' => 'beginner',
            ],
            [
                'name' => 'HIIT Blast',
                'description' => 'High-intensity interval training for maximum burn',
                'type' => 'HIIT',
                'duration_minutes' => 45,
                'instructor_id' => $mikeThompson->id,
                'capacity' => 20,
                'location' => 'Κύρια Αίθουσα',
                'difficulty_level' => 'intermediate',
            ],
            [
                'name' => 'Spin Class',
                'description' => 'Indoor cycling workout with motivating music',
                'type' => 'Cycling',
                'duration_minutes' => 60,
                'instructor_id' => $mikeThompson->id,
                'capacity' => 25,
                'location' => 'Στούντιο Ποδηλασίας',
                'difficulty_level' => 'intermediate',
            ],
            [
                'name' => 'Strength Training',
                'description' => 'Build muscle and strength with guided weight training',
                'type' => 'Strength',
                'duration_minutes' => 60,
                'instructor_id' => $chrisTaylor->id,
                'capacity' => 12,
                'location' => 'Αίθουσα Βαρών',
                'difficulty_level' => 'intermediate',
            ],
            [
                'name' => 'Pilates Reformer',
                'description' => 'Pilates workout using reformer machines',
                'type' => 'Pilates',
                'duration_minutes' => 50,
                'instructor_id' => $sarahJohnson->id,
                'capacity' => 8,
                'location' => 'Στούντιο Pilates',
                'difficulty_level' => 'beginner',
            ],
            [
                'name' => 'CrossFit WOD',
                'description' => 'Constantly varied functional movements',
                'type' => 'CrossFit',
                'duration_minutes' => 60,
                'instructor_id' => $johnSmith->id,
                'capacity' => 15,
                'location' => 'CrossFit Box',
                'difficulty_level' => 'advanced',
            ],
        ];

        foreach ($workouts as $workout) {
            Workout::create($workout);
        }
    }
}