<?php

namespace App\Http\Controllers;

use App\Models\TeamRole;
use App\Models\TeamActivity;
use App\Models\TeamNotification;
use App\Models\TeamTask;
use App\Models\WorkspaceMember;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TeamManagementController extends Controller
{
    /**
     * Helper method to get user's role in workspace
     */
    private function getUserRole($userId, $workspaceId)
    {
        $userMembership = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', $userId)
            ->with('role')
            ->first();
        
        if (!$userMembership) {
            return null;
        }
        
        // If role_id exists, use the relationship
        if ($userMembership->role_id && $userMembership->role) {
            return $userMembership->role;
        }
        
        // Fallback: if role is a string, find the corresponding TeamRole
        if (is_string($userMembership->role)) {
            return TeamRole::where('workspace_id', $workspaceId)
                ->where('name', ucfirst($userMembership->role))
                ->first();
        }
        
        return null;
    }
    
    /**
     * Helper method to check if user has permission
     */
    private function userHasPermission($userId, $workspaceId, $module, $action)
    {
        $role = $this->getUserRole($userId, $workspaceId);
        return $role && $role->hasPermission($module, $action);
    }
    /**
     * Get team dashboard
     */
    public function getDashboard(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        // Get team members
        $teamMembers = WorkspaceMember::where('workspace_id', $workspaceId)
            ->with(['user', 'role'])
            ->get();
        
        // Get team activities
        $recentActivities = TeamActivity::getWorkspaceActivity($workspaceId, 20);
        
        // Get team notifications
        $notifications = TeamNotification::forWorkspace($workspaceId)
            ->with(['user', 'sender'])
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();
        
        // Get team tasks summary
        $taskSummary = TeamTask::getTaskSummary($workspaceId);
        
        // Get team roles
        $roles = TeamRole::forWorkspace($workspaceId)->get();
        
        return response()->json([
            'team_overview' => [
                'total_members' => $teamMembers->count(),
                'active_members' => $teamMembers->where('status', 'active')->count(),
                'pending_invites' => $teamMembers->where('status', 'pending')->count(),
                'roles_count' => $roles->count()
            ],
            'team_members' => $teamMembers->map(function ($member) {
                return [
                    'id' => $member->id,
                    'user' => $member->user->only(['id', 'name', 'email']),
                    'role' => $member->role->only(['id', 'name', 'description']),
                    'status' => $member->status,
                    'joined_at' => $member->created_at,
                    'last_activity' => $member->last_activity_at
                ];
            }),
            'recent_activities' => $recentActivities,
            'notifications' => $notifications,
            'tasks' => $taskSummary,
            'roles' => $roles
        ]);
    }
    
    /**
     * Get team members
     */
    public function getTeamMembers(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $status = $request->input('status');
        $roleId = $request->input('role_id');
        
        $query = WorkspaceMember::where('workspace_id', $workspaceId)
            ->with(['user', 'role']);
        
        if ($status) {
            $query->where('status', $status);
        }
        
        if ($roleId) {
            $query->where('role_id', $roleId);
        }
        
        $members = $query->get()->map(function ($member) {
            return [
                'id' => $member->id,
                'user' => $member->user->only(['id', 'name', 'email']),
                'role' => $member->role->only(['id', 'name', 'description', 'permissions']),
                'status' => $member->status,
                'joined_at' => $member->created_at,
                'last_activity' => $member->last_activity_at,
                'permissions' => $member->role->permissions
            ];
        });
        
        return response()->json([
            'team_members' => $members,
            'total_count' => $members->count()
        ]);
    }
    
    /**
     * Invite team member
     */
    public function inviteTeamMember(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid',
            'email' => 'required|email',
            'role_id' => 'required|uuid',
            'message' => 'nullable|string|max:500'
        ]);
        
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        // Check if user has permission to invite
        if (!$this->userHasPermission($user->id, $workspaceId, 'team', 'manage')) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }
        
        $email = $request->input('email');
        $roleId = $request->input('role_id');
        
        // Check if user already exists
        $existingUser = User::where('email', $email)->first();
        $invitedUser = $existingUser;
        
        if (!$existingUser) {
            // Create placeholder user
            $invitedUser = User::create([
                'name' => explode('@', $email)[0],
                'email' => $email,
                'password' => bcrypt('temp_password_' . time()),
                'email_verified_at' => null
            ]);
        }
        
        // Check if already a member
        $existingMember = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', $invitedUser->id)
            ->first();
        
        if ($existingMember) {
            return response()->json(['error' => 'User is already a member'], 400);
        }
        
        // Create workspace user
        $workspaceUser = WorkspaceMember::create([
            'workspace_id' => $workspaceId,
            'user_id' => $invitedUser->id,
            'role_id' => $roleId,
            'status' => 'pending',
            'invited_by' => $user->id,
            'invited_at' => now()
        ]);
        
        // Create notification
        TeamNotification::createNotification(
            $workspaceId,
            $invitedUser->id,
            $user->id,
            'team_invite',
            'Team Invitation',
            'You have been invited to join a workspace',
            "/workspace/{$workspaceId}/accept-invite",
            ['workspace_id' => $workspaceId, 'role_id' => $roleId],
            'high'
        );
        
        // Log activity
        TeamActivity::logActivity(
            $workspaceId,
            $user->id,
            'team_management',
            'team',
            'invite',
            'user',
            $invitedUser->id,
            "Invited {$email} to join the workspace"
        );
        
        return response()->json([
            'success' => true,
            'invitation' => [
                'user' => $invitedUser->only(['id', 'name', 'email']),
                'role_id' => $roleId,
                'status' => 'pending',
                'invited_at' => now()
            ]
        ]);
    }
    
    /**
     * Update team member role
     */
    public function updateMemberRole(Request $request, $memberId)
    {
        $request->validate([
            'workspace_id' => 'required|uuid',
            'role_id' => 'required|uuid'
        ]);
        
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        // Check permissions
        if (!$this->userHasPermission($user->id, $workspaceId, 'team', 'manage')) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }
        
        $member = WorkspaceMember::where('id', $memberId)
            ->where('workspace_id', $workspaceId)
            ->with(['user', 'role'])
            ->first();
        
        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }
        
        $oldRole = $member->role;
        $newRoleId = $request->input('role_id');
        $newRole = TeamRole::find($newRoleId);
        
        $member->role_id = $newRoleId;
        $member->save();
        
        // Create notification
        TeamNotification::createNotification(
            $workspaceId,
            $member->user_id,
            $user->id,
            'role_change',
            'Role Updated',
            "Your role has been changed from {$oldRole->name} to {$newRole->name}",
            "/workspace/{$workspaceId}/settings",
            ['old_role' => $oldRole->name, 'new_role' => $newRole->name],
            'normal'
        );
        
        // Log activity
        TeamActivity::logActivity(
            $workspaceId,
            $user->id,
            'team_management',
            'team',
            'role_change',
            'user',
            $member->user_id,
            "Changed role from {$oldRole->name} to {$newRole->name}"
        );
        
        return response()->json([
            'success' => true,
            'member' => [
                'id' => $member->id,
                'user' => $member->user->only(['id', 'name', 'email']),
                'role' => $newRole->only(['id', 'name', 'description']),
                'updated_at' => now()
            ]
        ]);
    }
    
    /**
     * Remove team member
     */
    public function removeMember(Request $request, $memberId)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        // Check permissions
        if (!$this->userHasPermission($user->id, $workspaceId, 'team', 'manage')) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }
        
        $member = WorkspaceMember::where('id', $memberId)
            ->where('workspace_id', $workspaceId)
            ->with('user')
            ->first();
        
        if (!$member) {
            return response()->json(['error' => 'Member not found'], 404);
        }
        
        // Don't allow removing workspace owner
        if ($member->role && $member->role->name === 'Owner') {
            return response()->json(['error' => 'Cannot remove workspace owner'], 400);
        }
        
        $removedUser = $member->user;
        $member->delete();
        
        // Create notification
        TeamNotification::createNotification(
            $workspaceId,
            $removedUser->id,
            $user->id,
            'team_removal',
            'Removed from Workspace',
            'You have been removed from the workspace',
            null,
            ['workspace_id' => $workspaceId],
            'normal'
        );
        
        // Log activity
        TeamActivity::logActivity(
            $workspaceId,
            $user->id,
            'team_management',
            'team',
            'remove',
            'user',
            $removedUser->id,
            "Removed {$removedUser->name} from the workspace"
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Member removed successfully'
        ]);
    }
    
    /**
     * Get team roles
     */
    public function getTeamRoles(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $roles = TeamRole::forWorkspace($workspaceId)
            ->with('createdBy:id,name,email')
            ->get();
        
        return response()->json([
            'roles' => $roles,
            'total_count' => $roles->count()
        ]);
    }
    
    /**
     * Create team role
     */
    public function createTeamRole(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'permissions' => 'required|array'
        ]);
        
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        // Check permissions
        if (!$this->userHasPermission($user->id, $workspaceId, 'team', 'manage')) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }
        
        $role = TeamRole::create([
            'workspace_id' => $workspaceId,
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'permissions' => $request->input('permissions'),
            'is_default' => false,
            'is_system' => false,
            'created_by' => $user->id
        ]);
        
        // Log activity
        TeamActivity::logActivity(
            $workspaceId,
            $user->id,
            'team_management',
            'team',
            'create',
            'role',
            $role->id,
            "Created new role: {$role->name}"
        );
        
        return response()->json([
            'success' => true,
            'role' => $role
        ]);
    }
    
    /**
     * Update team role
     */
    public function updateTeamRole(Request $request, $roleId)
    {
        $request->validate([
            'workspace_id' => 'required|uuid',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'permissions' => 'required|array'
        ]);
        
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        // Check permissions
        $userMembership = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', $user->id)
            ->with('role')
            ->first();
        
        if (!$userMembership || !$userMembership->role || !$userMembership->role->hasPermission('team', 'manage')) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }
        
        $role = TeamRole::where('id', $roleId)
            ->where('workspace_id', $workspaceId)
            ->first();
        
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }
        
        // Don't allow editing system roles
        if ($role->is_system) {
            return response()->json(['error' => 'Cannot edit system roles'], 400);
        }
        
        $role->update([
            'name' => $request->input('name'),
            'description' => $request->input('description'),
            'permissions' => $request->input('permissions'),
            'updated_by' => $user->id
        ]);
        
        // Log activity
        TeamActivity::logActivity(
            $workspaceId,
            $user->id,
            'team_management',
            'team',
            'update',
            'role',
            $role->id,
            "Updated role: {$role->name}"
        );
        
        return response()->json([
            'success' => true,
            'role' => $role
        ]);
    }
    
    /**
     * Delete team role
     */
    public function deleteTeamRole(Request $request, $roleId)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        // Check permissions
        $userMembership = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', $user->id)
            ->with('role')
            ->first();
        
        if (!$userMembership || !$userMembership->role || !$userMembership->role->hasPermission('team', 'manage')) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }
        
        $role = TeamRole::where('id', $roleId)
            ->where('workspace_id', $workspaceId)
            ->first();
        
        if (!$role) {
            return response()->json(['error' => 'Role not found'], 404);
        }
        
        // Don't allow deleting system roles or default roles
        if ($role->is_system || $role->is_default) {
            return response()->json(['error' => 'Cannot delete system or default roles'], 400);
        }
        
        // Check if role is in use
        $roleInUse = WorkspaceMember::where('role_id', $roleId)->exists();
        if ($roleInUse) {
            return response()->json(['error' => 'Cannot delete role that is currently assigned to users'], 400);
        }
        
        $roleName = $role->name;
        $role->delete();
        
        // Log activity
        TeamActivity::logActivity(
            $workspaceId,
            $user->id,
            'team_management',
            'team',
            'delete',
            'role',
            $roleId,
            "Deleted role: {$roleName}"
        );
        
        return response()->json([
            'success' => true,
            'message' => 'Role deleted successfully'
        ]);
    }
    
    /**
     * Get team activities
     */
    public function getTeamActivities(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $limit = $request->input('limit', 50);
        $days = $request->input('days', 7);
        $module = $request->input('module');
        $userId = $request->input('user_id');
        
        $query = TeamActivity::forWorkspace($workspaceId)
            ->recent($days)
            ->with('user:id,name,email');
        
        if ($module) {
            $query->forModule($module);
        }
        
        if ($userId) {
            $query->forUser($userId);
        }
        
        $activities = $query->orderByDesc('created_at')
            ->limit($limit)
            ->get();
        
        return response()->json([
            'activities' => $activities,
            'total_count' => $activities->count(),
            'filters' => [
                'days' => $days,
                'module' => $module,
                'user_id' => $userId
            ]
        ]);
    }
    
    /**
     * Get team notifications
     */
    public function getTeamNotifications(Request $request)
    {
        $user = Auth::user();
        $workspaceId = $request->input('workspace_id');
        
        if (!$user->workspaces()->where('workspaces.id', $workspaceId)->exists()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }
        
        $limit = $request->input('limit', 20);
        $unreadOnly = $request->input('unread_only', false);
        $type = $request->input('type');
        
        $query = TeamNotification::forUser($user->id)
            ->active()
            ->with(['sender:id,name,email', 'workspace:id,name']);
        
        if ($workspaceId) {
            $query->forWorkspace($workspaceId);
        }
        
        if ($unreadOnly) {
            $query->unread();
        }
        
        if ($type) {
            $query->byType($type);
        }
        
        $notifications = $query->orderByDesc('created_at')
            ->limit($limit)
            ->get();
        
        $counts = TeamNotification::getNotificationCounts($user->id, $workspaceId);
        
        return response()->json([
            'notifications' => $notifications,
            'counts' => $counts,
            'total_count' => $notifications->count()
        ]);
    }
    
    /**
     * Mark notification as read
     */
    public function markNotificationAsRead(Request $request, $notificationId)
    {
        $user = Auth::user();
        
        $notification = TeamNotification::where('id', $notificationId)
            ->where('user_id', $user->id)
            ->first();
        
        if (!$notification) {
            return response()->json(['error' => 'Notification not found'], 404);
        }
        
        $notification->markAsRead();
        
        return response()->json([
            'success' => true,
            'notification' => $notification
        ]);
    }
    
    /**
     * Initialize default roles for workspace
     */
    public function initializeDefaultRoles(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        $user = Auth::user();
        
        // Check permissions
        $userMembership = WorkspaceMember::where('workspace_id', $workspaceId)
            ->where('user_id', $user->id)
            ->with('role')
            ->first();
        
        if (!$userMembership || !$userMembership->role || !$userMembership->role->hasPermission('workspace', 'manage_users')) {
            return response()->json(['error' => 'Insufficient permissions'], 403);
        }
        
        $defaultRoles = TeamRole::getDefaultRoles();
        $createdRoles = [];
        
        foreach ($defaultRoles as $roleData) {
            $role = TeamRole::firstOrCreate([
                'workspace_id' => $workspaceId,
                'name' => $roleData['name']
            ], array_merge($roleData, [
                'workspace_id' => $workspaceId,
                'created_by' => $user->id
            ]));
            
            $createdRoles[] = $role;
        }
        
        return response()->json([
            'success' => true,
            'roles' => $createdRoles,
            'message' => 'Default roles initialized successfully'
        ]);
    }
}