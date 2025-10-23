<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Trainer;

class TrainerSeeder extends Seeder
{
    public function run(): void
    {
        Trainer::create([
            'name' => 'Alex Rodriguez',
            'title' => 'Head Trainer',
        ]);
    }
}
