<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
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

        $query = Product::with(['workspace', 'creator']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            // Get products from all workspaces user has access to
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by type if provided
        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        // Filter by categories if provided
        if ($request->has('categories')) {
            $categories = is_array($request->input('categories')) ? $request->input('categories') : [$request->input('categories')];
            $query->where(function ($q) use ($categories) {
                foreach ($categories as $category) {
                    $q->orWhereJsonContains('categories', $category);
                }
            });
        }

        // Filter by tags if provided
        if ($request->has('tags')) {
            $tags = is_array($request->input('tags')) ? $request->input('tags') : [$request->input('tags')];
            $query->where(function ($q) use ($tags) {
                foreach ($tags as $tag) {
                    $q->orWhereJsonContains('tags', $tag);
                }
            });
        }

        // Search by name, description, or SKU
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Filter by stock status
        if ($request->has('in_stock')) {
            if ($request->boolean('in_stock')) {
                $query->where(function ($q) {
                    $q->where('track_inventory', false)
                      ->orWhere('stock_quantity', '>', 0);
                });
            } else {
                $query->where('track_inventory', true)
                      ->where('stock_quantity', '<=', 0);
            }
        }

        // Filter by low stock (less than 10)
        if ($request->has('low_stock') && $request->boolean('low_stock')) {
            $query->where('track_inventory', true)
                  ->where('stock_quantity', '>', 0)
                  ->where('stock_quantity', '<=', 10);
        }

        // Order by
        $orderBy = $request->input('order_by', 'created_at');
        $orderDirection = $request->input('order_direction', 'desc');
        $query->orderBy($orderBy, $orderDirection);

        $products = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'products' => $products
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:products,slug',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'sku' => 'nullable|string|max:255',
            'stock_quantity' => 'nullable|integer|min:0',
            'track_inventory' => 'nullable|boolean',
            'status' => ['nullable', Rule::in(['draft', 'active', 'archived'])],
            'type' => ['nullable', Rule::in(['physical', 'digital', 'service'])],
            'categories' => 'nullable|array',
            'categories.*' => 'string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|array',
            'dimensions.length' => 'nullable|numeric|min:0',
            'dimensions.width' => 'nullable|numeric|min:0',
            'dimensions.height' => 'nullable|numeric|min:0',
            'dimensions.unit' => 'nullable|string|in:cm,in,m,ft',
            'requires_shipping' => 'nullable|boolean',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        // Generate slug if not provided
        $slug = $request->slug ?: Str::slug($request->name);
        
        // Ensure slug is unique
        $baseSlug = $slug;
        $counter = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $product = Product::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'name' => $request->name,
            'slug' => $slug,
            'description' => $request->description,
            'images' => $request->images,
            'price' => $request->price,
            'compare_price' => $request->compare_price,
            'currency' => $request->input('currency', 'USD'),
            'sku' => $request->sku,
            'stock_quantity' => $request->input('stock_quantity', 0),
            'track_inventory' => $request->input('track_inventory', true),
            'status' => $request->input('status', 'draft'),
            'type' => $request->input('type', 'physical'),
            'categories' => $request->categories,
            'tags' => $request->tags,
            'weight' => $request->weight,
            'dimensions' => $request->dimensions,
            'requires_shipping' => $request->input('requires_shipping', true),
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'product' => $product->load(['workspace', 'creator']),
            'message' => 'Product created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        // Check if user has access to this product's workspace
        if (!$product->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to product'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'product' => $product->load(['workspace', 'creator'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        // Check if user has access to this product's workspace
        $workspace = $product->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update product'
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product->id)],
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'price' => 'sometimes|required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'sku' => 'nullable|string|max:255',
            'stock_quantity' => 'nullable|integer|min:0',
            'track_inventory' => 'nullable|boolean',
            'status' => ['nullable', Rule::in(['draft', 'active', 'archived'])],
            'type' => ['nullable', Rule::in(['physical', 'digital', 'service'])],
            'categories' => 'nullable|array',
            'categories.*' => 'string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'weight' => 'nullable|numeric|min:0',
            'dimensions' => 'nullable|array',
            'dimensions.length' => 'nullable|numeric|min:0',
            'dimensions.width' => 'nullable|numeric|min:0',
            'dimensions.height' => 'nullable|numeric|min:0',
            'dimensions.unit' => 'nullable|string|in:cm,in,m,ft',
            'requires_shipping' => 'nullable|boolean',
        ]);

        $product->update($request->only([
            'name', 'slug', 'description', 'images', 'price', 'compare_price', 'currency',
            'sku', 'stock_quantity', 'track_inventory', 'status', 'type', 'categories', 
            'tags', 'weight', 'dimensions', 'requires_shipping'
        ]));

        return response()->json([
            'success' => true,
            'product' => $product->load(['workspace', 'creator']),
            'message' => 'Product updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Check if user has access to this product's workspace
        $workspace = $product->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete product'
            ], 403);
        }

        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }

    /**
     * Update product stock.
     */
    public function updateStock(Request $request, Product $product)
    {
        // Check if user has access to this product's workspace
        $workspace = $product->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update stock'
            ], 403);
        }

        $request->validate([
            'stock_quantity' => 'required|integer|min:0',
        ]);

        $product->update(['stock_quantity' => $request->stock_quantity]);

        return response()->json([
            'success' => true,
            'product' => $product->load(['workspace', 'creator']),
            'message' => 'Stock updated successfully'
        ]);
    }

    /**
     * Duplicate a product.
     */
    public function duplicate(Product $product)
    {
        // Check if user has access to this product's workspace
        $workspace = $product->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to duplicate product'
            ], 403);
        }

        // Generate unique slug
        $baseSlug = $product->slug . '-copy';
        $slug = $baseSlug;
        $counter = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $duplicatedProduct = Product::create([
            'id' => Str::uuid(),
            'workspace_id' => $product->workspace_id,
            'name' => $product->name . ' (Copy)',
            'slug' => $slug,
            'description' => $product->description,
            'images' => $product->images,
            'price' => $product->price,
            'compare_price' => $product->compare_price,
            'currency' => $product->currency,
            'sku' => $product->sku . '-copy',
            'stock_quantity' => $product->stock_quantity,
            'track_inventory' => $product->track_inventory,
            'status' => 'draft', // Start as draft
            'type' => $product->type,
            'categories' => $product->categories,
            'tags' => $product->tags,
            'weight' => $product->weight,
            'dimensions' => $product->dimensions,
            'requires_shipping' => $product->requires_shipping,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'product' => $duplicatedProduct->load(['workspace', 'creator']),
            'message' => 'Product duplicated successfully'
        ]);
    }

    /**
     * Get product analytics.
     */
    public function analytics(Request $request)
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

        $query = Product::query();
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            // Get products from all workspaces user has access to
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        $totalProducts = $query->count();
        $activeProducts = $query->where('status', 'active')->count();
        $draftProducts = $query->where('status', 'draft')->count();
        $archivedProducts = $query->where('status', 'archived')->count();

        $physicalProducts = $query->where('type', 'physical')->count();
        $digitalProducts = $query->where('type', 'digital')->count();
        $serviceProducts = $query->where('type', 'service')->count();

        $inStockProducts = $query->where(function ($q) {
            $q->where('track_inventory', false)
              ->orWhere('stock_quantity', '>', 0);
        })->count();

        $outOfStockProducts = $query->where('track_inventory', true)
                                   ->where('stock_quantity', '<=', 0)
                                   ->count();

        $lowStockProducts = $query->where('track_inventory', true)
                                  ->where('stock_quantity', '>', 0)
                                  ->where('stock_quantity', '<=', 10)
                                  ->count();

        $totalInventoryValue = $query->sum(\DB::raw('price * stock_quantity'));

        return response()->json([
            'success' => true,
            'analytics' => [
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'draft_products' => $draftProducts,
                'archived_products' => $archivedProducts,
                'physical_products' => $physicalProducts,
                'digital_products' => $digitalProducts,
                'service_products' => $serviceProducts,
                'in_stock_products' => $inStockProducts,
                'out_of_stock_products' => $outOfStockProducts,
                'low_stock_products' => $lowStockProducts,
                'total_inventory_value' => $totalInventoryValue,
            ]
        ]);
    }
}