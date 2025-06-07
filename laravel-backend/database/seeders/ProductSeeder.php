<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Whey Protein Powder',
                'description' => 'High-quality whey protein powder for muscle building and recovery.',
                'price' => 29.99,
                'category' => 'Supplements',
                'sku' => 'WHEY-001',
                'stock_quantity' => 50,
                'specifications' => [
                    'Weight' => '1kg',
                    'Protein per serving' => '25g',
                    'Flavors' => ['Vanilla', 'Chocolate', 'Strawberry'],
                ],
                'is_active' => true,
                'weight' => 1.0,
                'dimensions' => ['length' => 20, 'width' => 15, 'height' => 25],
            ],
            [
                'name' => 'Resistance Bands Set',
                'description' => 'Set of 5 resistance bands with different resistance levels.',
                'price' => 19.99,
                'category' => 'Equipment',
                'sku' => 'BAND-001',
                'stock_quantity' => 30,
                'specifications' => [
                    'Bands included' => '5',
                    'Resistance levels' => 'Light, Medium, Heavy, X-Heavy, XX-Heavy',
                    'Material' => 'Natural latex',
                ],
                'is_active' => true,
                'weight' => 0.5,
                'dimensions' => ['length' => 30, 'width' => 20, 'height' => 5],
            ],
            [
                'name' => 'Yoga Mat Premium',
                'description' => 'Non-slip premium yoga mat for comfortable practice.',
                'price' => 39.99,
                'category' => 'Equipment',
                'sku' => 'YOGA-001',
                'stock_quantity' => 25,
                'specifications' => [
                    'Dimensions' => '183cm x 61cm',
                    'Thickness' => '6mm',
                    'Material' => 'TPE eco-friendly',
                    'Colors' => ['Purple', 'Blue', 'Pink', 'Green'],
                ],
                'is_active' => true,
                'weight' => 1.2,
                'dimensions' => ['length' => 183, 'width' => 61, 'height' => 1],
            ],
            [
                'name' => 'Gym Water Bottle',
                'description' => 'Insulated stainless steel water bottle with Sweat24 logo.',
                'price' => 14.99,
                'category' => 'Accessories',
                'sku' => 'BOTTLE-001',
                'stock_quantity' => 100,
                'specifications' => [
                    'Capacity' => '750ml',
                    'Material' => 'Stainless steel',
                    'Insulation' => 'Double-wall vacuum',
                    'Colors' => ['Black', 'White', 'Blue'],
                ],
                'is_active' => true,
                'weight' => 0.4,
                'dimensions' => ['length' => 7, 'width' => 7, 'height' => 26],
            ],
            [
                'name' => 'Sweat24 T-Shirt',
                'description' => 'Comfortable cotton t-shirt with Sweat24 branding.',
                'price' => 24.99,
                'category' => 'Apparel',
                'sku' => 'SHIRT-001',
                'stock_quantity' => 75,
                'specifications' => [
                    'Material' => '100% Cotton',
                    'Sizes' => ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                    'Colors' => ['Black', 'White', 'Gray'],
                    'Care' => 'Machine washable',
                ],
                'is_active' => true,
                'weight' => 0.2,
                'dimensions' => ['length' => 30, 'width' => 25, 'height' => 2],
            ],
            [
                'name' => 'Pre-Workout Energy',
                'description' => 'Energy supplement for enhanced workout performance.',
                'price' => 34.99,
                'category' => 'Supplements',
                'sku' => 'PREWORK-001',
                'stock_quantity' => 40,
                'specifications' => [
                    'Servings' => '30',
                    'Caffeine per serving' => '200mg',
                    'Flavors' => ['Blue Raspberry', 'Fruit Punch', 'Green Apple'],
                ],
                'is_active' => true,
                'weight' => 0.3,
                'dimensions' => ['length' => 15, 'width' => 10, 'height' => 12],
            ],
        ];

        foreach ($products as $product) {
            Product::create($product);
        }
    }
}