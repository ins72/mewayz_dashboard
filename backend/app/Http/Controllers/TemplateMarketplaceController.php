<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\TemplateCategory;
use App\Models\TemplateCollection;
use App\Models\TemplatePurchase;
use App\Models\TemplateReview;
use App\Models\TemplateUsage;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class TemplateMarketplaceController extends Controller
{
    /**
     * Get marketplace templates with filtering and search
     */
    public function getMarketplaceTemplates(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $category = $request->input('category');
        $type = $request->input('type');
        $search = $request->input('search');
        $priceRange = $request->input('price_range');
        $sortBy = $request->input('sort_by', 'popular');
        $isFree = $request->input('is_free');
        $isPremium = $request->input('is_premium');
        $perPage = $request->input('per_page', 20);

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

        $query = Template::with(['category', 'creator', 'reviews'])
            ->active()
            ->approved();

        // Apply filters
        if ($category) {
            $query->inCategory($category);
        }

        if ($type) {
            $query->ofType($type);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhereJsonContains('tags', $search);
            });
        }

        if ($priceRange) {
            $ranges = explode('-', $priceRange);
            if (count($ranges) == 2) {
                $query->whereBetween('price', [(float)$ranges[0], (float)$ranges[1]]);
            }
        }

        if ($isFree !== null) {
            $query->where('is_free', $isFree);
        }

        if ($isPremium !== null) {
            $query->where('is_premium', $isPremium);
        }

        // Apply sorting
        switch ($sortBy) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating_average', 'desc');
                break;
            case 'popular':
            default:
                $query->popular();
                break;
        }

        $templates = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'templates' => $templates,
            'filters' => [
                'categories' => TemplateCategory::active()->ordered()->get(),
                'types' => $this->getTemplateTypes(),
                'price_ranges' => $this->getPriceRanges(),
            ]
        ]);
    }

    /**
     * Get template categories
     */
    public function getTemplateCategories()
    {
        $categories = TemplateCategory::with(['children', 'featuredTemplate'])
            ->active()
            ->parent()
            ->ordered()
            ->get();

        return response()->json([
            'success' => true,
            'categories' => $categories
        ]);
    }

    /**
     * Get template collections
     */
    public function getTemplateCollections(Request $request)
    {
        $featured = $request->input('featured');
        $sortBy = $request->input('sort_by', 'popular');
        $perPage = $request->input('per_page', 12);

        $query = TemplateCollection::with(['creator', 'templates'])
            ->active();

        if ($featured) {
            $query->featured();
        }

        // Apply sorting
        switch ($sortBy) {
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating_average', 'desc');
                break;
            case 'popular':
            default:
                $query->popular();
                break;
        }

        $collections = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'collections' => $collections
        ]);
    }

    /**
     * Get template details
     */
    public function getTemplateDetails($templateId)
    {
        $template = Template::with([
            'category',
            'creator',
            'reviews' => function ($query) {
                $query->approved()->active()->recent()->limit(10);
            },
            'reviews.user'
        ])->find($templateId);

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found'
            ], 404);
        }

        // Check if user has purchased this template
        $isPurchased = false;
        if (auth()->check()) {
            $isPurchased = $template->isPurchasedBy(auth()->id());
        }

        // Get related templates
        $relatedTemplates = Template::where('template_category_id', $template->template_category_id)
            ->where('id', '!=', $template->id)
            ->active()
            ->approved()
            ->limit(6)
            ->get();

        return response()->json([
            'success' => true,
            'template' => $template,
            'is_purchased' => $isPurchased,
            'related_templates' => $relatedTemplates
        ]);
    }

    /**
     * Get collection details
     */
    public function getCollectionDetails($collectionId)
    {
        $collection = TemplateCollection::with([
            'creator',
            'templates' => function ($query) {
                $query->active()->approved();
            },
            'templates.category'
        ])->find($collectionId);

        if (!$collection) {
            return response()->json([
                'success' => false,
                'message' => 'Collection not found'
            ], 404);
        }

        // Check if user has purchased this collection
        $isPurchased = false;
        if (auth()->check()) {
            $isPurchased = TemplatePurchase::where('user_id', auth()->id())
                ->where('template_collection_id', $collection->id)
                ->where('status', 'completed')
                ->exists();
        }

        return response()->json([
            'success' => true,
            'collection' => $collection,
            'is_purchased' => $isPurchased
        ]);
    }

    /**
     * Purchase template
     */
    public function purchaseTemplate(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'template_id' => 'required|uuid|exists:templates,id',
            'license_type' => ['required', Rule::in(['standard', 'extended', 'commercial', 'unlimited'])],
            'payment_method' => 'required|string',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $template = Template::find($request->template_id);
        if (!$template->isActive() || !$template->isApproved()) {
            return response()->json([
                'success' => false,
                'message' => 'Template is not available for purchase'
            ], 422);
        }

        // Check if already purchased
        if ($template->isPurchasedBy(auth()->id())) {
            return response()->json([
                'success' => false,
                'message' => 'You have already purchased this template'
            ], 422);
        }

        // For free templates, create a free purchase record
        if ($template->isFree()) {
            $purchase = TemplatePurchase::create([
                'id' => Str::uuid(),
                'template_id' => $template->id,
                'user_id' => auth()->id(),
                'workspace_id' => $request->workspace_id,
                'purchase_type' => 'template',
                'price' => 0,
                'total_amount' => 0,
                'status' => 'completed',
                'license_type' => $request->license_type,
                'purchased_at' => now(),
            ]);

            $template->incrementDownloadCount();
            $template->incrementPurchaseCount();

            return response()->json([
                'success' => true,
                'purchase' => $purchase,
                'message' => 'Template acquired successfully'
            ]);
        }

        // For paid templates, create a purchase record
        $purchase = TemplatePurchase::create([
            'id' => Str::uuid(),
            'template_id' => $template->id,
            'user_id' => auth()->id(),
            'workspace_id' => $request->workspace_id,
            'purchase_type' => 'template',
            'price' => $template->price,
            'total_amount' => $template->price,
            'payment_method' => $request->payment_method,
            'status' => 'completed', // In real app, this would be 'pending' until payment confirmation
            'license_type' => $request->license_type,
            'purchased_at' => now(),
        ]);

        $template->incrementDownloadCount();
        $template->incrementPurchaseCount();

        return response()->json([
            'success' => true,
            'purchase' => $purchase,
            'message' => 'Template purchased successfully'
        ]);
    }

    /**
     * Purchase template collection
     */
    public function purchaseCollection(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'collection_id' => 'required|uuid|exists:template_collections,id',
            'license_type' => ['required', Rule::in(['standard', 'extended', 'commercial', 'unlimited'])],
            'payment_method' => 'required|string',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $collection = TemplateCollection::find($request->collection_id);
        if (!$collection->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Collection is not available for purchase'
            ], 422);
        }

        // Check if already purchased
        $existingPurchase = TemplatePurchase::where('user_id', auth()->id())
            ->where('template_collection_id', $collection->id)
            ->where('status', 'completed')
            ->exists();

        if ($existingPurchase) {
            return response()->json([
                'success' => false,
                'message' => 'You have already purchased this collection'
            ], 422);
        }

        $purchase = TemplatePurchase::create([
            'id' => Str::uuid(),
            'template_collection_id' => $collection->id,
            'user_id' => auth()->id(),
            'workspace_id' => $request->workspace_id,
            'purchase_type' => 'collection',
            'price' => $collection->price,
            'total_amount' => $collection->getDiscountedPrice(),
            'discount_amount' => $collection->price - $collection->getDiscountedPrice(),
            'payment_method' => $request->payment_method,
            'status' => 'completed',
            'license_type' => $request->license_type,
            'purchased_at' => now(),
        ]);

        $collection->increment('purchase_count');

        return response()->json([
            'success' => true,
            'purchase' => $purchase,
            'message' => 'Collection purchased successfully'
        ]);
    }

    /**
     * Get user's purchased templates
     */
    public function getUserPurchases(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $type = $request->input('type', 'all'); // all, templates, collections

        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if (!$workspace || !$workspace->members()->where('user_id', auth()->id())->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }
        }

        $query = TemplatePurchase::with(['template', 'templateCollection'])
            ->where('user_id', auth()->id())
            ->completed();

        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        }

        if ($type !== 'all') {
            $purchaseType = $type === 'templates' ? 'template' : 'collection';
            $query->where('purchase_type', $purchaseType);
        }

        $purchases = $query->orderBy('purchased_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'purchases' => $purchases
        ]);
    }

    /**
     * Get template reviews
     */
    public function getTemplateReviews(Request $request, $templateId)
    {
        $rating = $request->input('rating');
        $sortBy = $request->input('sort_by', 'helpful');
        $perPage = $request->input('per_page', 10);

        $query = TemplateReview::with(['user'])
            ->where('template_id', $templateId)
            ->approved()
            ->active();

        if ($rating) {
            $query->withRating($rating);
        }

        // Apply sorting
        switch ($sortBy) {
            case 'newest':
                $query->recent();
                break;
            case 'oldest':
                $query->orderBy('reviewed_at', 'asc');
                break;
            case 'rating_high':
                $query->orderBy('rating', 'desc');
                break;
            case 'rating_low':
                $query->orderBy('rating', 'asc');
                break;
            case 'helpful':
            default:
                $query->helpful();
                break;
        }

        $reviews = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'reviews' => $reviews
        ]);
    }

    /**
     * Submit template review
     */
    public function submitTemplateReview(Request $request)
    {
        $request->validate([
            'template_id' => 'required|uuid|exists:templates,id',
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'review' => 'required|string|max:1000',
            'pros' => 'nullable|array',
            'cons' => 'nullable|array',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $template = Template::find($request->template_id);
        
        // Check if user has already reviewed this template
        $existingReview = TemplateReview::where('template_id', $request->template_id)
            ->where('user_id', auth()->id())
            ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this template'
            ], 422);
        }

        // Check if user has purchased this template
        $isPurchased = $template->isPurchasedBy(auth()->id());

        $review = TemplateReview::create([
            'id' => Str::uuid(),
            'template_id' => $request->template_id,
            'user_id' => auth()->id(),
            'workspace_id' => $request->workspace_id,
            'rating' => $request->rating,
            'title' => $request->title,
            'review' => $request->review,
            'pros' => $request->pros,
            'cons' => $request->cons,
            'is_verified_purchase' => $isPurchased,
            'is_approved' => true, // Auto-approve for now
            'status' => 'active',
            'reviewed_at' => now(),
        ]);

        // Update template rating
        $template->updateRatingAverage();

        return response()->json([
            'success' => true,
            'review' => $review->load('user'),
            'message' => 'Review submitted successfully'
        ]);
    }

    /**
     * Get template types
     */
    private function getTemplateTypes()
    {
        return [
            ['value' => 'email', 'label' => 'Email Templates'],
            ['value' => 'link_in_bio', 'label' => 'Link in Bio Templates'],
            ['value' => 'course', 'label' => 'Course Templates'],
            ['value' => 'social_media', 'label' => 'Social Media Templates'],
            ['value' => 'marketing', 'label' => 'Marketing Templates'],
            ['value' => 'landing_page', 'label' => 'Landing Page Templates'],
            ['value' => 'newsletter', 'label' => 'Newsletter Templates'],
            ['value' => 'blog_post', 'label' => 'Blog Post Templates'],
        ];
    }

    /**
     * Get price ranges
     */
    private function getPriceRanges()
    {
        return [
            ['value' => '0-0', 'label' => 'Free'],
            ['value' => '0-10', 'label' => 'Under $10'],
            ['value' => '10-25', 'label' => '$10 - $25'],
            ['value' => '25-50', 'label' => '$25 - $50'],
            ['value' => '50-100', 'label' => '$50 - $100'],
            ['value' => '100-999', 'label' => '$100+'],
        ];
    }
}