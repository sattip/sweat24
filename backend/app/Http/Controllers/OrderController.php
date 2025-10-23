<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with('items')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|integer',
            'total' => 'required|numeric'
        ]);

        $order = Order::create($data);

        foreach ($request->items as $item) {
            $order->items()->create($item);
        }

        return $order->load('items');
    }

    public function show(Order $order)
    {
        return $order->load('items');
    }

    public function update(Request $request, Order $order)
    {
        $order->update($request->only('total'));
        return $order->load('items');
    }

    public function destroy(Order $order)
    {
        $order->delete();
        return response()->noContent();
    }
}
