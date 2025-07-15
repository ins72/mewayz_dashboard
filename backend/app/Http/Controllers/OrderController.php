<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        
        // Validate workspace access
        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if (!$workspace || !$workspace->members()->where('user_id', auth()->id())->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }
        }

        // Return mock data for now
        $mockOrders = [
            [
                'id' => 'order-1',
                'order_number' => 'ORD-2024-001',
                'customer' => [
                    'name' => 'John Smith',
                    'email' => 'john@example.com',
                    'phone' => '+1-555-0123'
                ],
                'items' => [
                    [
                        'product_id' => 'product-1',
                        'name' => 'Premium Digital Course Bundle',
                        'quantity' => 1,
                        'price' => 299.99,
                        'total' => 299.99
                    ]
                ],
                'subtotal' => 299.99,
                'tax' => 24.00,
                'shipping' => 0.00,
                'total' => 323.99,
                'status' => 'processing',
                'payment_status' => 'paid',
                'shipping_address' => [
                    'street' => '123 Main St',
                    'city' => 'New York',
                    'state' => 'NY',
                    'postal_code' => '10001',
                    'country' => 'US'
                ],
                'created_at' => now()->subDays(1)->toISOString(),
                'updated_at' => now()->subDays(1)->toISOString()
            ],
            [
                'id' => 'order-2',
                'order_number' => 'ORD-2024-002',
                'customer' => [
                    'name' => 'Sarah Johnson',
                    'email' => 'sarah@example.com',
                    'phone' => '+1-555-0456'
                ],
                'items' => [
                    [
                        'product_id' => 'product-2',
                        'name' => 'Professional Business Planner',
                        'quantity' => 2,
                        'price' => 49.99,
                        'total' => 99.98
                    ]
                ],
                'subtotal' => 99.98,
                'tax' => 8.00,
                'shipping' => 9.99,
                'total' => 117.97,
                'status' => 'fulfilled',
                'payment_status' => 'paid',
                'shipping_address' => [
                    'street' => '456 Oak Ave',
                    'city' => 'Los Angeles',
                    'state' => 'CA',
                    'postal_code' => '90210',
                    'country' => 'US'
                ],
                'created_at' => now()->subDays(2)->toISOString(),
                'updated_at' => now()->subHours(6)->toISOString()
            ]
        ];

        return response()->json([
            'success' => true,
            'orders' => $mockOrders
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Mock order creation
        $order = [
            'id' => 'order-' . Str::random(8),
            'order_number' => 'ORD-' . date('Y') . '-' . str_pad(rand(1, 9999), 3, '0', STR_PAD_LEFT),
            'customer' => $request->input('customer'),
            'items' => $request->input('items'),
            'subtotal' => $request->input('subtotal'),
            'tax' => $request->input('tax'),
            'shipping' => $request->input('shipping'),
            'total' => $request->input('total'),
            'status' => 'pending',
            'payment_status' => 'pending',
            'shipping_address' => $request->input('shipping_address'),
            'created_at' => now()->toISOString(),
            'updated_at' => now()->toISOString()
        ];

        return response()->json([
            'success' => true,
            'order' => $order,
            'message' => 'Order created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Mock order details
        $order = [
            'id' => $id,
            'order_number' => 'ORD-2024-001',
            'customer' => [
                'name' => 'John Smith',
                'email' => 'john@example.com',
                'phone' => '+1-555-0123'
            ],
            'items' => [
                [
                    'product_id' => 'product-1',
                    'name' => 'Premium Digital Course Bundle',
                    'quantity' => 1,
                    'price' => 299.99,
                    'total' => 299.99
                ]
            ],
            'subtotal' => 299.99,
            'tax' => 24.00,
            'shipping' => 0.00,
            'total' => 323.99,
            'status' => 'processing',
            'payment_status' => 'paid',
            'shipping_address' => [
                'street' => '123 Main St',
                'city' => 'New York',
                'state' => 'NY',
                'postal_code' => '10001',
                'country' => 'US'
            ],
            'created_at' => now()->subDays(1)->toISOString(),
            'updated_at' => now()->subDays(1)->toISOString()
        ];

        return response()->json([
            'success' => true,
            'order' => $order
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        // Mock order update
        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        // Mock order deletion
        return response()->json([
            'success' => true,
            'message' => 'Order deleted successfully'
        ]);
    }

    /**
     * Update order status.
     */
    public function updateStatus(Request $request, string $id)
    {
        $request->validate([
            'status' => 'required|in:pending,processing,fulfilled,cancelled'
        ]);

        // Mock status update
        return response()->json([
            'success' => true,
            'order' => [
                'id' => $id,
                'status' => $request->status,
                'updated_at' => now()->toISOString()
            ],
            'message' => 'Order status updated successfully'
        ]);
    }
}