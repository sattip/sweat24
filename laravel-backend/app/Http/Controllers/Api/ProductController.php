<?php

namespace App\Http\Controllers\Api;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ProductController extends BaseController
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Product::where('is_active', true);
        
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
        
        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        $products = $query->orderBy('name')->get();
        return $this->sendResponse($products, 'Products retrieved successfully.');
    }

    /**
     * Display the specified product.
     */
    public function show($id): JsonResponse
    {
        $product = Product::where('is_active', true)->find($id);

        if (!$product) {
            return $this->sendError('Product not found.');
        }

        return $this->sendResponse($product, 'Product retrieved successfully.');
    }

    /**
     * Get product categories.
     */
    public function categories(): JsonResponse
    {
        $categories = Product::where('is_active', true)
                            ->select('category')
                            ->distinct()
                            ->pluck('category');

        return $this->sendResponse($categories, 'Product categories retrieved successfully.');
    }
}