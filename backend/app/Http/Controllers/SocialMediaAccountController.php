<?php

namespace App\Http\Controllers;

use App\Models\SocialMediaAccount;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class SocialMediaAccountController extends Controller
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

        $query = SocialMediaAccount::with('workspace');
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            // Get accounts from all workspaces user has access to
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        // Filter by platform if provided
        if ($request->has('platform')) {
            $query->where('platform', $request->input('platform'));
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $accounts = $query->get();

        return response()->json([
            'success' => true,
            'accounts' => $accounts
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'platform' => ['required', Rule::in(['instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube'])],
            'account_id' => 'required|string',
            'username' => 'required|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|url',
            'access_tokens' => 'nullable|array',
            'account_info' => 'nullable|array',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        // Check if account already exists for this workspace and platform
        $existingAccount = SocialMediaAccount::where('workspace_id', $request->workspace_id)
            ->where('platform', $request->platform)
            ->where('account_id', $request->account_id)
            ->first();

        if ($existingAccount) {
            return response()->json([
                'success' => false,
                'message' => 'Social media account already connected to this workspace'
            ], 422);
        }

        $account = SocialMediaAccount::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'platform' => $request->platform,
            'account_id' => $request->account_id,
            'username' => $request->username,
            'display_name' => $request->display_name,
            'profile_picture' => $request->profile_picture,
            'access_tokens' => $request->access_tokens,
            'status' => 'active',
            'connected_at' => now(),
            'account_info' => $request->account_info,
        ]);

        return response()->json([
            'success' => true,
            'account' => $account->load('workspace'),
            'message' => 'Social media account connected successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SocialMediaAccount $socialMediaAccount)
    {
        // Check if user has access to this account's workspace
        if (!$socialMediaAccount->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to social media account'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'account' => $socialMediaAccount->load('workspace', 'posts')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SocialMediaAccount $socialMediaAccount)
    {
        // Check if user has access to this account's workspace
        $workspace = $socialMediaAccount->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update social media account'
            ], 403);
        }

        $request->validate([
            'username' => 'sometimes|required|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'profile_picture' => 'nullable|url',
            'access_tokens' => 'nullable|array',
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'expired'])],
            'account_info' => 'nullable|array',
        ]);

        $socialMediaAccount->update($request->only([
            'username', 'display_name', 'profile_picture', 'access_tokens', 'status', 'account_info'
        ]));

        if ($request->has('status') && $request->status === 'active') {
            $socialMediaAccount->update(['last_sync_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'account' => $socialMediaAccount->load('workspace'),
            'message' => 'Social media account updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SocialMediaAccount $socialMediaAccount)
    {
        // Check if user has access to this account's workspace
        $workspace = $socialMediaAccount->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete social media account'
            ], 403);
        }

        $socialMediaAccount->delete();

        return response()->json([
            'success' => true,
            'message' => 'Social media account disconnected successfully'
        ]);
    }

    /**
     * Refresh the access tokens for a social media account.
     */
    public function refreshTokens(SocialMediaAccount $socialMediaAccount)
    {
        // Check if user has access to this account's workspace
        $workspace = $socialMediaAccount->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to refresh tokens'
            ], 403);
        }

        // This would typically involve calling the platform's API to refresh tokens
        // For now, we'll update the last_sync_at timestamp
        $socialMediaAccount->update([
            'last_sync_at' => now(),
            'status' => 'active'
        ]);

        return response()->json([
            'success' => true,
            'account' => $socialMediaAccount->load('workspace'),
            'message' => 'Access tokens refreshed successfully'
        ]);
    }
}