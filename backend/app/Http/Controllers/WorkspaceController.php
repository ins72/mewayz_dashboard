<?php

namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class WorkspaceController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $workspaces = auth()->user()->workspaces()->with('members')->get();
        
        return response()->json([
            'success' => true,
            'workspaces' => $workspaces
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'branding' => 'nullable|array',
            'settings' => 'nullable|array',
        ]);

        $workspace = Workspace::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . Str::random(6),
            'description' => $request->description,
            'logo' => $request->logo,
            'branding' => $request->branding,
            'owner_id' => auth()->id(),
            'settings' => $request->settings,
        ]);

        // Add creator as workspace member with owner role
        $workspace->members()->create([
            'id' => Str::uuid(),
            'workspace_id' => $workspace->id,
            'user_id' => auth()->id(),
            'role' => 'owner',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'workspace' => $workspace->load('members'),
            'message' => 'Workspace created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Workspace $workspace)
    {
        // Check if user has access to this workspace
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'workspace' => $workspace->load('members.user')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Workspace $workspace)
    {
        // Check if user is workspace owner or admin
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update workspace'
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'logo' => 'nullable|string',
            'branding' => 'nullable|array',
            'settings' => 'nullable|array',
            'status' => ['sometimes', Rule::in(['active', 'inactive', 'suspended'])],
        ]);

        $workspace->update($request->only([
            'name', 'description', 'logo', 'branding', 'settings', 'status'
        ]));

        return response()->json([
            'success' => true,
            'workspace' => $workspace->load('members.user'),
            'message' => 'Workspace updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Workspace $workspace)
    {
        // Only workspace owner can delete workspace
        if ($workspace->owner_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Only workspace owner can delete the workspace'
            ], 403);
        }

        $workspace->delete();

        return response()->json([
            'success' => true,
            'message' => 'Workspace deleted successfully'
        ]);
    }
}
