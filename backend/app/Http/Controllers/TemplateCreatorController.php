<?php

namespace App\Http\Controllers;

use App\Models\Template;
use App\Models\TemplateCategory;
use App\Models\TemplateCollection;
use App\Models\TemplatePurchase;
use App\Models\TemplateUsage;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class TemplateCreatorController extends Controller
{
    /**
     * Get creator's templates
     */
    public function getCreatorTemplates(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $status = $request->input('status');
        $type = $request->input('type');
        $sortBy = $request->input('sort_by', 'newest');
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

        $query = Template::with(['category', 'reviews'])
            ->where('creator_id', auth()->id());

        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($type) {
            $query->where('template_type', $type);
        }

        // Apply sorting
        switch ($sortBy) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'popular':
                $query->orderBy('download_count', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating_average', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $templates = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'templates' => $templates
        ]);
    }

    /**
     * Create new template
     */
    public function createTemplate(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'template_category_id' => 'required|uuid|exists:template_categories,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'template_type' => ['required', Rule::in(['email', 'link_in_bio', 'course', 'social_media', 'marketing', 'landing_page', 'newsletter', 'blog_post'])],
            'template_data' => 'required|array',
            'price' => 'required|numeric|min:0',
            'is_free' => 'boolean',
            'is_premium' => 'boolean',
            'license_type' => ['required', Rule::in(['standard', 'extended', 'commercial', 'unlimited'])],
            'tags' => 'nullable|array',
            'features' => 'nullable|array',
            'requirements' => 'nullable|array',
            'preview_image' => 'nullable|string',
            'preview_url' => 'nullable|url',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        $template = Template::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'creator_id' => auth()->id(),
            'template_category_id' => $request->template_category_id,
            'title' => $request->title,
            'description' => $request->description,
            'template_type' => $request->template_type,
            'template_data' => $request->template_data,
            'price' => $request->price,
            'is_free' => $request->input('is_free', false),
            'is_premium' => $request->input('is_premium', false),
            'license_type' => $request->license_type,
            'tags' => $request->tags,
            'features' => $request->features,
            'requirements' => $request->requirements,
            'preview_image' => $request->preview_image,
            'preview_url' => $request->preview_url,
            'status' => 'draft',
            'approval_status' => 'pending',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'template' => $template->load(['category', 'creator']),
            'message' => 'Template created successfully'
        ], 201);
    }

    /**
     * Update template
     */
    public function updateTemplate(Request $request, $templateId)
    {
        $template = Template::where('id', $templateId)
            ->where('creator_id', auth()->id())
            ->first();

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found or unauthorized'
            ], 404);
        }

        $request->validate([
            'template_category_id' => 'nullable|uuid|exists:template_categories,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'template_type' => ['nullable', Rule::in(['email', 'link_in_bio', 'course', 'social_media', 'marketing', 'landing_page', 'newsletter', 'blog_post'])],
            'template_data' => 'nullable|array',
            'price' => 'nullable|numeric|min:0',
            'is_free' => 'boolean',
            'is_premium' => 'boolean',
            'license_type' => ['nullable', Rule::in(['standard', 'extended', 'commercial', 'unlimited'])],
            'tags' => 'nullable|array',
            'features' => 'nullable|array',
            'requirements' => 'nullable|array',
            'preview_image' => 'nullable|string',
            'preview_url' => 'nullable|url',
        ]);

        $template->update($request->only([
            'template_category_id',
            'title',
            'description',
            'template_type',
            'template_data',
            'price',
            'is_free',
            'is_premium',
            'license_type',
            'tags',
            'features',
            'requirements',
            'preview_image',
            'preview_url',
        ]));

        return response()->json([
            'success' => true,
            'template' => $template->load(['category', 'creator']),
            'message' => 'Template updated successfully'
        ]);
    }

    /**
     * Delete template
     */
    public function deleteTemplate($templateId)
    {
        $template = Template::where('id', $templateId)
            ->where('creator_id', auth()->id())
            ->first();

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found or unauthorized'
            ], 404);
        }

        $template->delete();

        return response()->json([
            'success' => true,
            'message' => 'Template deleted successfully'
        ]);
    }

    /**
     * Publish template
     */
    public function publishTemplate($templateId)
    {
        $template = Template::where('id', $templateId)
            ->where('creator_id', auth()->id())
            ->first();

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found or unauthorized'
            ], 404);
        }

        $template->update([
            'status' => 'active',
            'approval_status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'template' => $template,
            'message' => 'Template submitted for approval'
        ]);
    }

    /**
     * Get creator's collections
     */
    public function getCreatorCollections(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $sortBy = $request->input('sort_by', 'newest');
        $perPage = $request->input('per_page', 20);

        $query = TemplateCollection::with(['templates'])
            ->where('creator_id', auth()->id());

        // Apply sorting
        switch ($sortBy) {
            case 'oldest':
                $query->orderBy('created_at', 'asc');
                break;
            case 'popular':
                $query->orderBy('purchase_count', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating_average', 'desc');
                break;
            case 'newest':
            default:
                $query->orderBy('created_at', 'desc');
                break;
        }

        $collections = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'collections' => $collections
        ]);
    }

    /**
     * Create new collection
     */
    public function createCollection(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string|max:1000',
            'price' => 'required|numeric|min:0',
            'discount_percentage' => 'nullable|numeric|min:0|max:100',
            'tags' => 'nullable|array',
            'template_ids' => 'required|array|min:1',
            'template_ids.*' => 'uuid|exists:templates,id',
            'cover_image' => 'nullable|string',
        ]);

        // Validate that user owns all templates
        $templates = Template::whereIn('id', $request->template_ids)
            ->where('creator_id', auth()->id())
            ->get();

        if ($templates->count() !== count($request->template_ids)) {
            return response()->json([
                'success' => false,
                'message' => 'You can only add templates that you own'
            ], 422);
        }

        $collection = TemplateCollection::create([
            'id' => Str::uuid(),
            'creator_id' => auth()->id(),
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'discount_percentage' => $request->input('discount_percentage', 0),
            'tags' => $request->tags,
            'cover_image' => $request->cover_image,
            'template_count' => count($request->template_ids),
            'created_by' => auth()->id(),
        ]);

        // Attach templates to collection
        foreach ($request->template_ids as $index => $templateId) {
            $collection->templates()->attach($templateId, ['sort_order' => $index + 1]);
        }

        return response()->json([
            'success' => true,
            'collection' => $collection->load(['templates', 'creator']),
            'message' => 'Collection created successfully'
        ], 201);
    }

    /**
     * Get template analytics
     */
    public function getTemplateAnalytics(Request $request, $templateId)
    {
        $template = Template::where('id', $templateId)
            ->where('creator_id', auth()->id())
            ->first();

        if (!$template) {
            return response()->json([
                'success' => false,
                'message' => 'Template not found or unauthorized'
            ], 404);
        }

        $period = $request->input('period', '30d');
        $days = match($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '1y' => 365,
            default => 30
        };

        $startDate = now()->subDays($days);

        // Get usage analytics
        $usageAnalytics = TemplateUsage::where('template_id', $templateId)
            ->where('used_at', '>=', $startDate)
            ->get();

        // Get purchase analytics
        $purchaseAnalytics = TemplatePurchase::where('template_id', $templateId)
            ->where('purchased_at', '>=', $startDate)
            ->get();

        // Calculate metrics
        $metrics = [
            'total_downloads' => $template->download_count,
            'total_purchases' => $template->purchase_count,
            'total_revenue' => $purchaseAnalytics->sum('total_amount'),
            'period_usage' => $usageAnalytics->count(),
            'period_purchases' => $purchaseAnalytics->count(),
            'period_revenue' => $purchaseAnalytics->sum('total_amount'),
            'rating_average' => $template->rating_average,
            'rating_count' => $template->rating_count,
            'success_rate' => $usageAnalytics->where('success_rate', '>=', 80)->count() / max($usageAnalytics->count(), 1) * 100,
        ];

        // Usage by context
        $usageByContext = $usageAnalytics->groupBy('usage_context')
            ->map(function ($items) {
                return $items->count();
            });

        // Usage by type
        $usageByType = $usageAnalytics->groupBy('usage_type')
            ->map(function ($items) {
                return $items->count();
            });

        // Daily usage trends
        $dailyUsage = $usageAnalytics->groupBy(function ($item) {
            return $item->used_at->format('Y-m-d');
        })->map(function ($items) {
            return $items->count();
        });

        return response()->json([
            'success' => true,
            'analytics' => [
                'metrics' => $metrics,
                'usage_by_context' => $usageByContext,
                'usage_by_type' => $usageByType,
                'daily_usage' => $dailyUsage,
                'period' => $period,
            ]
        ]);
    }

    /**
     * Get creator dashboard stats
     */
    public function getCreatorDashboard(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $period = $request->input('period', '30d');
        
        $days = match($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            '1y' => 365,
            default => 30
        };

        $startDate = now()->subDays($days);

        // Get creator's templates
        $templatesQuery = Template::where('creator_id', auth()->id());
        if ($workspaceId) {
            $templatesQuery->where('workspace_id', $workspaceId);
        }
        $templates = $templatesQuery->get();

        // Get analytics
        $totalTemplates = $templates->count();
        $activeTemplates = $templates->where('status', 'active')->count();
        $totalDownloads = $templates->sum('download_count');
        $totalPurchases = $templates->sum('purchase_count');
        $totalRevenue = TemplatePurchase::whereIn('template_id', $templates->pluck('id'))
            ->where('status', 'completed')
            ->sum('total_amount');

        // Period analytics
        $periodPurchases = TemplatePurchase::whereIn('template_id', $templates->pluck('id'))
            ->where('purchased_at', '>=', $startDate)
            ->count();

        $periodRevenue = TemplatePurchase::whereIn('template_id', $templates->pluck('id'))
            ->where('purchased_at', '>=', $startDate)
            ->sum('total_amount');

        // Top performing templates
        $topTemplates = $templates->sortByDesc('download_count')->take(5);

        return response()->json([
            'success' => true,
            'dashboard' => [
                'overview' => [
                    'total_templates' => $totalTemplates,
                    'active_templates' => $activeTemplates,
                    'total_downloads' => $totalDownloads,
                    'total_purchases' => $totalPurchases,
                    'total_revenue' => $totalRevenue,
                    'period_purchases' => $periodPurchases,
                    'period_revenue' => $periodRevenue,
                ],
                'top_templates' => $topTemplates,
                'period' => $period,
            ]
        ]);
    }
}