<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'first_name' => 'Admin',
            'last_name' => 'User',
            'email' => 'admin@sweat24.com',
            'password' => Hash::make('password'),
            'membership_type' => 'admin',
            'membership_status' => 'active',
        ]);

        // Create sample users
        User::create([
            'first_name' => 'Γιάννης',
            'last_name' => 'Παπαδόπουλος',
            'email' => 'giannis.papadopoulos@example.com',
            'password' => Hash::make('password'),
            'phone' => '+30 6944 123456',
            'date_of_birth' => '1990-05-15',
            'referral_source' => 'friend',
            'membership_type' => 'premium',
            'membership_status' => 'active',
            'membership_expires_at' => now()->addYear(),
        ]);

        User::create([
            'first_name' => 'Maria',
            'last_name' => 'Georgiou',
            'email' => 'maria.georgiou@example.com',
            'password' => Hash::make('password'),
            'phone' => '+30 6955 987654',
            'date_of_birth' => '1985-08-22',
            'referral_source' => 'social',
            'membership_type' => 'basic',
            'membership_status' => 'active',
            'membership_expires_at' => now()->addMonths(6),
        ]);

        User::create([
            'first_name' => 'Dimitris',
            'last_name' => 'Kostas',
            'email' => 'dimitris.kostas@example.com',
            'password' => Hash::make('password'),
            'phone' => '+30 6977 456789',
            'date_of_birth' => '1992-12-10',
            'referral_source' => 'search',
            'membership_type' => 'basic',
            'membership_status' => 'active',
            'membership_expires_at' => now()->addYear(),
        ]);
    }
}