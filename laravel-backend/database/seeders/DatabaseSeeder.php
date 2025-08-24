<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Trainer;
use App\Models\FitnessClass;
use App\Models\Product;
use App\Models\Service;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            TrainerSeeder::class,
            FitnessClassSeeder::class,
            ProductSeeder::class,
            ServiceSeeder::class,
        ]);
    }
}