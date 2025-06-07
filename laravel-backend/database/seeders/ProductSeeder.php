<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Supplements
        Product::create([
            'name' => 'Premium Protein Powder',
            'description' => 'High-quality whey protein for optimal muscle recovery.',
            'price' => 59.99,
            'category' => 'supplements',
            'image_url' => 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop',
            'stock_quantity' => 50,
            'sku' => 'SUP-PROT-001',
        ]);

        Product::create([
            'name' => 'Pre-Workout Energy',
            'description' => 'Boost your energy and focus before workouts.',
            'price' => 39.99,
            'category' => 'supplements',
            'image_url' => 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=400&fit=crop',
            'stock_quantity' => 30,
            'sku' => 'SUP-PREWORK-001',
        ]);

        // Apparel
        Product::create([
            'name' => 'Performance T-Shirt',
            'description' => 'Moisture-wicking athletic t-shirt for intense workouts.',
            'price' => 34.99,
            'category' => 'apparel',
            'image_url' => 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
            'stock_quantity' => 75,
            'sku' => 'APP-TSHIRT-001',
        ]);

        Product::create([
            'name' => 'Compression Shorts',
            'description' => 'Supportive compression shorts for high-intensity training.',
            'price' => 29.99,
            'category' => 'apparel',
            'image_url' => 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop',
            'stock_quantity' => 40,
            'sku' => 'APP-SHORTS-001',
        ]);

        // Accessories
        Product::create([
            'name' => 'Wireless Headphones',
            'description' => 'Sweat-resistant wireless headphones perfect for workouts.',
            'price' => 79.99,
            'category' => 'accessories',
            'image_url' => 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
            'stock_quantity' => 25,
            'sku' => 'ACC-HEADPHONES-001',
        ]);

        Product::create([
            'name' => 'Fitness Tracker',
            'description' => 'Track your heart rate, steps, and calories burned.',
            'price' => 129.99,
            'category' => 'accessories',
            'image_url' => 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&h=400&fit=crop',
            'stock_quantity' => 15,
            'sku' => 'ACC-TRACKER-001',
        ]);

        // Equipment
        Product::create([
            'name' => 'Resistance Bands Set',
            'description' => 'Complete set of resistance bands for strength training.',
            'price' => 24.99,
            'category' => 'equipment',
            'image_url' => 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop',
            'stock_quantity' => 60,
            'sku' => 'EQP-BANDS-001',
        ]);

        Product::create([
            'name' => 'Yoga Mat',
            'description' => 'Non-slip yoga mat for comfortable practice.',
            'price' => 49.99,
            'category' => 'equipment',
            'image_url' => 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
            'stock_quantity' => 35,
            'sku' => 'EQP-YOGAMAT-001',
        ]);
    }
}