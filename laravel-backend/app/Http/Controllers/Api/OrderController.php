<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = $request->user()->orders()->with('orderItems.product');

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate($request->get('per_page', 15));

        return response()->json($orders);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.options' => 'nullable|array',
            'pickup_option' => 'required|in:gym,delivery',
            'contact_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'required|string|max:255',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request) {
            $totalAmount = 0;
            $orderItems = [];

            // Calculate total and prepare order items
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                
                // Check stock availability
                if ($product->stock_quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }

                $unitPrice = $product->price;
                $totalPrice = $unitPrice * $item['quantity'];
                $totalAmount += $totalPrice;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $totalPrice,
                    'options' => $item['options'] ?? null,
                ];

                // Update stock
                $product->decrement('stock_quantity', $item['quantity']);
            }

            // Create order
            $order = Order::create([
                'user_id' => $request->user()->id,
                'total_amount' => $totalAmount,
                'pickup_option' => $request->pickup_option,
                'contact_name' => $request->contact_name,
                'contact_email' => $request->contact_email,
                'contact_phone' => $request->contact_phone,
                'notes' => $request->notes,
                'status' => 'pending',
            ]);

            // Create order items
            foreach ($orderItems as $orderItem) {
                $order->orderItems()->create($orderItem);
            }

            return response()->json($order->load('orderItems.product'), Response::HTTP_CREATED);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        $this->authorize('view', $order);

        return response()->json($order->load('orderItems.product'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        $this->authorize('update', $order);

        $request->validate([
            'status' => 'sometimes|in:pending,processing,completed,cancelled',
            'processed_at' => 'nullable|date',
        ]);

        $order->update($request->only(['status', 'processed_at']));

        return response()->json($order->load('orderItems.product'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Order $order)
    {
        $this->authorize('delete', $order);

        // Return items to stock if order is cancelled
        if ($order->status !== 'completed') {
            foreach ($order->orderItems as $item) {
                $item->product->increment('stock_quantity', $item->quantity);
            }
        }

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully'], Response::HTTP_NO_CONTENT);
    }
}