<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Membership;
use App\Models\Reward;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create demo user
        $user = User::create([
            'first_name' => 'Γιάννης',
            'last_name' => 'Παπαδόπουλος',
            'email' => 'demo@sweat24.com',
            'password' => Hash::make('password123'),
            'phone' => '+30 6944 123456',
            'date_of_birth' => '1990-05-15',
            'referral_source' => 'friend',
            'fitness_goals' => ['Απώλεια Βάρους', 'Αύξηση Μυϊκής Μάζας', 'Καρδιοαναπνευστική Φυσική Κατάσταση'],
        ]);

        // Create membership for demo user
        Membership::create([
            'user_id' => $user->id,
            'name' => 'Premium Συνδρομή',
            'type' => '10 Συνεδρίες',
            'remaining_sessions' => 7,
            'total_sessions' => 10,
            'expires_at' => now()->addMonths(3),
            'status' => 'active',
        ]);

        // Create some rewards for demo user
        Reward::create([
            'user_id' => $user->id,
            'type' => 'birthday',
            'name' => 'Δωρεάν Προσωπική Προπόνηση',
            'code' => 'BDAYPT2023',
            'description' => 'Complimentary personal training session for your birthday',
            'value' => 45.00,
            'status' => 'available',
            'expires_at' => now()->addDays(14),
        ]);

        Reward::create([
            'user_id' => $user->id,
            'type' => 'referral',
            'name' => 'Δωρεάν Προπόνηση',
            'code' => 'REF123456',
            'description' => 'Free workout session for referring a friend',
            'value' => 25.00,
            'status' => 'available',
            'expires_at' => now()->addDays(30),
        ]);

        // Create additional test users
        $users = [
            [
                'first_name' => 'Maria',
                'last_name' => 'Komninou',
                'email' => 'maria@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+30 6944 987654',
                'date_of_birth' => '1985-08-22',
                'fitness_goals' => ['Flexibility', 'Stress Relief'],
            ],
            [
                'first_name' => 'Dimitris',
                'last_name' => 'Stavrou',
                'email' => 'dimitris@example.com',
                'password' => Hash::make('password123'),
                'phone' => '+30 6944 555666',
                'date_of_birth' => '1992-12-10',
                'fitness_goals' => ['Strength', 'Muscle Building'],
            ],
        ];

        foreach ($users as $userData) {
            $newUser = User::create($userData);
            
            // Create basic membership for each user
            Membership::create([
                'user_id' => $newUser->id,
                'name' => 'Basic Συνδρομή',
                'type' => '5 Συνεδρίες',
                'remaining_sessions' => 3,
                'total_sessions' => 5,
                'expires_at' => now()->addMonths(2),
                'status' => 'active',
            ]);
        }
    }
}