<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class OrderController extends BaseController
{
    /**
     * Display user's orders.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
                         ->orders()
                         ->with('orderItems.product')
                         ->orderBy('created_at', 'desc')
                         ->get();

        return $this->sendResponse($orders, 'Orders retrieved successfully.');
    }

    /**
     * Create a new order.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.product_options' => 'nullable|array',
            'shipping_address' => 'required|array',
            'shipping_address.name' => 'required|string|max:255',
            'shipping_address.address' => 'required|string|max:255',
            'shipping_address.city' => 'required|string|max:255',
            'shipping_address.postal_code' => 'required|string|max:20',
            'shipping_address.country' => 'required|string|max:255',
            'billing_address' => 'nullable|array',
            'payment_method' => 'required|string|max:255',
        ]);

        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors(), 422);
        }

        return DB::transaction(function () use ($request) {
            $subtotal = 0;
            $orderItems = [];

            // Validate products and calculate total
            foreach ($request->items as $item) {
                $product = Product::where('is_active', true)->find($item['product_id']);
                
                if (!$product) {
                    throw new \Exception('Product not found: ' . $item['product_id']);
                }

                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception('Insufficient stock for product: ' . $product->name);
                }

                $itemTotal = $product->price * $item['quantity'];
                $subtotal += $itemTotal;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'total' => $itemTotal,
                    'product_options' => $item['product_options'] ?? null,
                ];

                // Update stock
                $product->decrement('stock_quantity', $item['quantity']);
            }

            // Calculate tax and shipping (simplified)
            $taxAmount = $subtotal * 0.1; // 10% tax
            $shippingAmount = $subtotal > 50 ? 0 : 5; // Free shipping over $50
            $totalAmount = $subtotal + $taxAmount + $shippingAmount;

            // Create order
            $order = Order::create([
                'user_id' => $request->user()->id,
                'order_number' => 'ORD-' . strtoupper(uniqid()),
                'status' => 'pending',
                'subtotal' => $subtotal,
                'tax_amount' => $taxAmount,
                'shipping_amount' => $shippingAmount,
                'total_amount' => $totalAmount,
                'shipping_address' => $request->shipping_address,
                'billing_address' => $request->billing_address ?? $request->shipping_address,
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
            ]);

            // Create order items
            foreach ($orderItems as $item) {
                $order->orderItems()->create($item);
            }

            $order->load('orderItems.product');

            return $this->sendResponse($order, 'Order created successfully.');
        });
    }

    /**
     * Display the specified order.
     */
    public function show($id, Request $request): JsonResponse
    {
        $order = Order::where('id', $id)
                     ->where('user_id', $request->user()->id)
                     ->with('orderItems.product')
                     ->first();

        if (!$order) {
            return $this->sendError('Order not found.');
        }

        return $this->sendResponse($order, 'Order retrieved successfully.');
    }

    /**
     * Cancel an order.
     */
    public function cancel($id, Request $request): JsonResponse
    {
        $order = Order::where('id', $id)
                     ->where('user_id', $request->user()->id)
                     ->with('orderItems.product')
                     ->first();

        if (!$order) {
            return $this->sendError('Order not found.');
        }

        if (!in_array($order->status, ['pending', 'processing'])) {
            return $this->sendError('Order cannot be cancelled.', [], 400);
        }

        return DB::transaction(function () use ($order) {
            // Restore stock for all items
            foreach ($order->orderItems as $item) {
                $item->product->increment('stock_quantity', $item->quantity);
            }

            $order->update(['status' => 'cancelled']);

            return $this->sendResponse($order, 'Order cancelled successfully.');
        });
    }
}