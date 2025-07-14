<?php

namespace App\Http\Controllers;

use App\Models\LinkInBioPage;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class LinkInBioPageController extends Controller
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

        $query = LinkInBioPage::with(['workspace', 'creator']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            // Get pages from all workspaces user has access to
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        // Filter by active status if provided
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $pages = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'pages' => $pages
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:link_in_bio_pages,slug',
            'description' => 'nullable|string',
            'profile_image' => 'nullable|string',
            'background_image' => 'nullable|string',
            'theme_settings' => 'nullable|array',
            'links' => 'nullable|array',
            'links.*.title' => 'required|string|max:255',
            'links.*.url' => 'required|url',
            'links.*.description' => 'nullable|string',
            'links.*.icon' => 'nullable|string',
            'links.*.is_active' => 'nullable|boolean',
            'links.*.order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'custom_domain' => 'nullable|string|max:255',
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
        $slug = $request->slug ?: Str::slug($request->title);
        
        // Ensure slug is unique
        $baseSlug = $slug;
        $counter = 1;
        while (LinkInBioPage::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        // Process links array
        $links = $request->links ? array_map(function ($link, $index) {
            return [
                'id' => $link['id'] ?? Str::uuid(),
                'title' => $link['title'],
                'url' => $link['url'],
                'description' => $link['description'] ?? '',
                'icon' => $link['icon'] ?? null,
                'is_active' => $link['is_active'] ?? true,
                'click_count' => 0,
                'order' => $link['order'] ?? $index,
            ];
        }, $request->links, array_keys($request->links)) : [];

        $page = LinkInBioPage::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'title' => $request->title,
            'slug' => $slug,
            'description' => $request->description,
            'profile_image' => $request->profile_image,
            'background_image' => $request->background_image,
            'theme_settings' => $request->theme_settings,
            'links' => $links,
            'is_active' => $request->input('is_active', true),
            'custom_domain' => $request->custom_domain,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'page' => $page->load(['workspace', 'creator']),
            'message' => 'Link in bio page created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(LinkInBioPage $linkInBioPage)
    {
        // Check if user has access to this page's workspace
        if (!$linkInBioPage->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to link in bio page'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'page' => $linkInBioPage->load(['workspace', 'creator'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LinkInBioPage $linkInBioPage)
    {
        // Check if user has access to this page's workspace
        $workspace = $linkInBioPage->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update link in bio page'
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('link_in_bio_pages', 'slug')->ignore($linkInBioPage->id)],
            'description' => 'nullable|string',
            'profile_image' => 'nullable|string',
            'background_image' => 'nullable|string',
            'theme_settings' => 'nullable|array',
            'links' => 'nullable|array',
            'links.*.title' => 'required|string|max:255',
            'links.*.url' => 'required|url',
            'links.*.description' => 'nullable|string',
            'links.*.icon' => 'nullable|string',
            'links.*.is_active' => 'nullable|boolean',
            'links.*.order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'custom_domain' => 'nullable|string|max:255',
        ]);

        $updateData = $request->only([
            'title', 'slug', 'description', 'profile_image', 'background_image',
            'theme_settings', 'is_active', 'custom_domain'
        ]);

        // Process links array if provided
        if ($request->has('links')) {
            $links = array_map(function ($link, $index) {
                return [
                    'id' => $link['id'] ?? Str::uuid(),
                    'title' => $link['title'],
                    'url' => $link['url'],
                    'description' => $link['description'] ?? '',
                    'icon' => $link['icon'] ?? null,
                    'is_active' => $link['is_active'] ?? true,
                    'click_count' => $link['click_count'] ?? 0,
                    'order' => $link['order'] ?? $index,
                ];
            }, $request->links, array_keys($request->links));
            
            $updateData['links'] = $links;
        }

        $linkInBioPage->update($updateData);

        return response()->json([
            'success' => true,
            'page' => $linkInBioPage->load(['workspace', 'creator']),
            'message' => 'Link in bio page updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LinkInBioPage $linkInBioPage)
    {
        // Check if user has access to this page's workspace
        $workspace = $linkInBioPage->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete link in bio page'
            ], 403);
        }

        $linkInBioPage->delete();

        return response()->json([
            'success' => true,
            'message' => 'Link in bio page deleted successfully'
        ]);
    }

    /**
     * Display the public view of a link in bio page.
     */
    public function public(string $slug)
    {
        $page = LinkInBioPage::where('slug', $slug)
                             ->where('is_active', true)
                             ->with(['workspace', 'creator'])
                             ->first();

        if (!$page) {
            return response()->json([
                'success' => false,
                'message' => 'Page not found or inactive'
            ], 404);
        }

        // Increment view count
        $page->incrementViews();

        return response()->json([
            'success' => true,
            'page' => [
                'id' => $page->id,
                'title' => $page->title,
                'description' => $page->description,
                'profile_image' => $page->profile_image,
                'background_image' => $page->background_image,
                'theme_settings' => $page->getThemeWithDefaults(),
                'links' => $page->getFormattedLinks(),
                'total_views' => $page->total_views,
                'workspace' => [
                    'name' => $page->workspace->name,
                    'logo' => $page->workspace->logo,
                ],
            ]
        ]);
    }

    /**
     * Track a link click.
     */
    public function trackClick(LinkInBioPage $linkInBioPage, Request $request)
    {
        $request->validate([
            'link_id' => 'required|string',
        ]);

        $linkId = $request->input('link_id');
        $links = $linkInBioPage->links ?? [];

        // Find and update the clicked link
        $updated = false;
        foreach ($links as &$link) {
            if ($link['id'] === $linkId) {
                $link['click_count'] = ($link['click_count'] ?? 0) + 1;
                $updated = true;
                break;
            }
        }

        if ($updated) {
            $linkInBioPage->update(['links' => $links]);
            $linkInBioPage->incrementClicks();
        }

        return response()->json([
            'success' => true,
            'message' => 'Click tracked successfully'
        ]);
    }

    /**
     * Get analytics for a link in bio page.
     */
    public function analytics(LinkInBioPage $linkInBioPage)
    {
        // Check if user has access to this page's workspace
        if (!$linkInBioPage->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to link in bio page'
            ], 403);
        }

        $analytics = [
            'total_views' => $linkInBioPage->total_views,
            'total_clicks' => $linkInBioPage->total_clicks,
            'click_through_rate' => $linkInBioPage->getClickThroughRate(),
            'active_links' => count($linkInBioPage->getActiveLinks()),
            'total_links' => count($linkInBioPage->links ?? []),
            'link_performance' => array_map(function ($link) {
                return [
                    'id' => $link['id'],
                    'title' => $link['title'],
                    'url' => $link['url'],
                    'click_count' => $link['click_count'] ?? 0,
                ];
            }, $linkInBioPage->links ?? []),
        ];

        return response()->json([
            'success' => true,
            'analytics' => $analytics
        ]);
    }

    /**
     * Duplicate a link in bio page.
     */
    public function duplicate(LinkInBioPage $linkInBioPage)
    {
        // Check if user has access to this page's workspace
        $workspace = $linkInBioPage->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to duplicate link in bio page'
            ], 403);
        }

        // Generate unique slug
        $baseSlug = $linkInBioPage->slug . '-copy';
        $slug = $baseSlug;
        $counter = 1;
        while (LinkInBioPage::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        // Reset click counts in links
        $links = $linkInBioPage->links ?? [];
        foreach ($links as &$link) {
            $link['click_count'] = 0;
        }

        $duplicatedPage = LinkInBioPage::create([
            'id' => Str::uuid(),
            'workspace_id' => $linkInBioPage->workspace_id,
            'title' => $linkInBioPage->title . ' (Copy)',
            'slug' => $slug,
            'description' => $linkInBioPage->description,
            'profile_image' => $linkInBioPage->profile_image,
            'background_image' => $linkInBioPage->background_image,
            'theme_settings' => $linkInBioPage->theme_settings,
            'links' => $links,
            'is_active' => false, // Start as inactive
            'custom_domain' => null, // Don't copy custom domain
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'page' => $duplicatedPage->load(['workspace', 'creator']),
            'message' => 'Link in bio page duplicated successfully'
        ]);
    }
}