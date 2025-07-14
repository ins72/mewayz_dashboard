<?php

namespace App\Http\Controllers;

use App\Models\SocialMediaPost;
use App\Models\SocialMediaAccount;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class SocialMediaPostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $accountId = $request->input('account_id');
        
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

        $query = SocialMediaPost::with(['workspace', 'socialMediaAccount', 'creator']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            // Get posts from all workspaces user has access to
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        if ($accountId) {
            $query->where('social_media_account_id', $accountId);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by date range if provided
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->input('from_date'));
        }

        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->input('to_date'));
        }

        $posts = $query->orderBy('created_at', 'desc')
                      ->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'posts' => $posts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'social_media_account_id' => 'required|uuid|exists:social_media_accounts,id',
            'title' => 'nullable|string|max:255',
            'content' => 'required|string',
            'media_urls' => 'nullable|array',
            'media_urls.*' => 'url',
            'hashtags' => 'nullable|array',
            'hashtags.*' => 'string|max:100',
            'status' => ['nullable', Rule::in(['draft', 'scheduled', 'published'])],
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        // Validate social media account belongs to workspace
        $socialMediaAccount = SocialMediaAccount::find($request->social_media_account_id);
        if (!$socialMediaAccount || $socialMediaAccount->workspace_id !== $request->workspace_id) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid social media account for this workspace'
            ], 422);
        }

        $status = $request->input('status', 'draft');
        
        // If scheduled_at is provided, set status to scheduled
        if ($request->has('scheduled_at') && $request->scheduled_at) {
            $status = 'scheduled';
        }

        $post = SocialMediaPost::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'social_media_account_id' => $request->social_media_account_id,
            'title' => $request->title,
            'content' => $request->content,
            'media_urls' => $request->media_urls,
            'hashtags' => $request->hashtags,
            'status' => $status,
            'scheduled_at' => $request->scheduled_at,
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'post' => $post->load(['workspace', 'socialMediaAccount', 'creator']),
            'message' => 'Social media post created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SocialMediaPost $socialMediaPost)
    {
        // Check if user has access to this post's workspace
        if (!$socialMediaPost->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to social media post'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'post' => $socialMediaPost->load(['workspace', 'socialMediaAccount', 'creator'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SocialMediaPost $socialMediaPost)
    {
        // Check if user has access to this post's workspace
        $workspace = $socialMediaPost->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update social media post'
            ], 403);
        }

        // Only allow updating draft and scheduled posts
        if (!in_array($socialMediaPost->status, ['draft', 'scheduled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot update published or failed posts'
            ], 422);
        }

        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'sometimes|required|string',
            'media_urls' => 'nullable|array',
            'media_urls.*' => 'url',
            'hashtags' => 'nullable|array',
            'hashtags.*' => 'string|max:100',
            'status' => ['nullable', Rule::in(['draft', 'scheduled'])],
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        $updateData = $request->only(['title', 'content', 'media_urls', 'hashtags', 'status', 'scheduled_at']);
        
        // If scheduled_at is provided, set status to scheduled
        if ($request->has('scheduled_at') && $request->scheduled_at) {
            $updateData['status'] = 'scheduled';
        }

        $socialMediaPost->update($updateData);

        return response()->json([
            'success' => true,
            'post' => $socialMediaPost->load(['workspace', 'socialMediaAccount', 'creator']),
            'message' => 'Social media post updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SocialMediaPost $socialMediaPost)
    {
        // Check if user has access to this post's workspace
        $workspace = $socialMediaPost->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete social media post'
            ], 403);
        }

        $socialMediaPost->delete();

        return response()->json([
            'success' => true,
            'message' => 'Social media post deleted successfully'
        ]);
    }

    /**
     * Publish a scheduled post immediately.
     */
    public function publish(SocialMediaPost $socialMediaPost)
    {
        // Check if user has access to this post's workspace
        $workspace = $socialMediaPost->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to publish social media post'
            ], 403);
        }

        if (!in_array($socialMediaPost->status, ['draft', 'scheduled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Post cannot be published in its current state'
            ], 422);
        }

        // This would typically involve calling the social media platform's API
        // For now, we'll just update the status and published_at timestamp
        $socialMediaPost->update([
            'status' => 'published',
            'published_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'post' => $socialMediaPost->load(['workspace', 'socialMediaAccount', 'creator']),
            'message' => 'Social media post published successfully'
        ]);
    }

    /**
     * Duplicate a post.
     */
    public function duplicate(SocialMediaPost $socialMediaPost)
    {
        // Check if user has access to this post's workspace
        $workspace = $socialMediaPost->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to duplicate social media post'
            ], 403);
        }

        $duplicatedPost = SocialMediaPost::create([
            'id' => Str::uuid(),
            'workspace_id' => $socialMediaPost->workspace_id,
            'social_media_account_id' => $socialMediaPost->social_media_account_id,
            'title' => $socialMediaPost->title . ' (Copy)',
            'content' => $socialMediaPost->content,
            'media_urls' => $socialMediaPost->media_urls,
            'hashtags' => $socialMediaPost->hashtags,
            'status' => 'draft',
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'post' => $duplicatedPost->load(['workspace', 'socialMediaAccount', 'creator']),
            'message' => 'Social media post duplicated successfully'
        ]);
    }
}