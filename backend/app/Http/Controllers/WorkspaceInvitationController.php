<?php

namespace App\Http\Controllers;

use App\Models\WorkspaceInvitation;
use App\Models\InvitationBatch;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use App\Models\User;
use App\Services\ElasticMailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class WorkspaceInvitationController extends Controller
{
    protected ElasticMailService $emailService;

    public function __construct(ElasticMailService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Get all invitations for a workspace
     */
    public function index(Request $request, $workspaceId)
    {
        try {
            $user = Auth::user();
            
            // Verify user has access to this workspace
            $workspace = Workspace::findOrFail($workspaceId);
            $member = WorkspaceMember::where('workspace_id', $workspaceId)
                ->where('user_id', $user->id)
                ->whereIn('role', ['owner', 'admin'])
                ->first();
            
            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }

            $query = WorkspaceInvitation::with(['inviter:id,name,email,avatar'])
                ->where('workspace_id', $workspaceId)
                ->orderBy('created_at', 'desc');

            // Apply filters
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
            
            if ($request->has('role')) {
                $query->where('role', $request->role);
            }
            
            if ($request->has('department')) {
                $query->where('department', $request->department);
            }

            $invitations = $query->paginate(20);

            return response()->json([
                'success' => true,
                'data' => $invitations
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch invitations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a single invitation
     */
    public function store(Request $request, $workspaceId)
    {
        try {
            $user = Auth::user();
            
            // Verify user has access to this workspace
            $workspace = Workspace::findOrFail($workspaceId);
            $member = WorkspaceMember::where('workspace_id', $workspaceId)
                ->where('user_id', $user->id)
                ->whereIn('role', ['owner', 'admin'])
                ->first();
            
            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'role' => 'required|in:owner,admin,editor,contributor,viewer,guest',
                'department' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
                'personal_message' => 'nullable|string|max:1000',
                'expires_in_days' => 'nullable|integer|min:1|max:30'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if user is already a member
            $existingMember = WorkspaceMember::where('workspace_id', $workspaceId)
                ->whereHas('user', function ($query) use ($request) {
                    $query->where('email', $request->email);
                })
                ->first();

            if ($existingMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'User is already a member of this workspace'
                ], 409);
            }

            // Check if there's already a pending invitation
            $existingInvitation = WorkspaceInvitation::where('workspace_id', $workspaceId)
                ->where('email', $request->email)
                ->where('status', 'pending')
                ->first();

            if ($existingInvitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'There is already a pending invitation for this email'
                ], 409);
            }

            // Create invitation
            $invitation = WorkspaceInvitation::create([
                'workspace_id' => $workspaceId,
                'invited_by' => $user->id,
                'email' => $request->email,
                'role' => $request->role,
                'department' => $request->department,
                'position' => $request->position,
                'personal_message' => $request->personal_message,
                'expires_at' => now()->addDays($request->expires_in_days ?? 7)
            ]);

            // Send invitation email
            $emailSent = $this->sendInvitationEmail($invitation, $workspace);

            return response()->json([
                'success' => true,
                'data' => [
                    'invitation' => $invitation->load('inviter:id,name,email,avatar'),
                    'email_sent' => $emailSent
                ],
                'message' => 'Invitation sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create invitation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create bulk invitations
     */
    public function bulkStore(Request $request, $workspaceId)
    {
        try {
            $user = Auth::user();
            
            // Verify user has access to this workspace
            $workspace = Workspace::findOrFail($workspaceId);
            $member = WorkspaceMember::where('workspace_id', $workspaceId)
                ->where('user_id', $user->id)
                ->whereIn('role', ['owner', 'admin'])
                ->first();
            
            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'batch_name' => 'required|string|max:255',
                'invitations' => 'required|array|min:1|max:100',
                'invitations.*.email' => 'required|email',
                'invitations.*.role' => 'required|in:owner,admin,editor,contributor,viewer,guest',
                'invitations.*.department' => 'nullable|string|max:255',
                'invitations.*.position' => 'nullable|string|max:255',
                'invitations.*.personal_message' => 'nullable|string|max:1000'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $invitations = $request->invitations;

            // Create batch record
            $batch = InvitationBatch::create([
                'workspace_id' => $workspaceId,
                'created_by' => $user->id,
                'name' => $request->batch_name,
                'total_invitations' => count($invitations),
                'batch_data' => ['invitations' => $invitations]
            ]);

            $results = [];
            $successful = 0;
            $failed = 0;

            foreach ($invitations as $invitationData) {
                try {
                    // Check if user is already a member
                    $existingMember = WorkspaceMember::where('workspace_id', $workspaceId)
                        ->whereHas('user', function ($query) use ($invitationData) {
                            $query->where('email', $invitationData['email']);
                        })
                        ->first();

                    if ($existingMember) {
                        $results[] = [
                            'email' => $invitationData['email'],
                            'success' => false,
                            'error' => 'User is already a member'
                        ];
                        $failed++;
                        continue;
                    }

                    // Check for existing pending invitation
                    $existingInvitation = WorkspaceInvitation::where('workspace_id', $workspaceId)
                        ->where('email', $invitationData['email'])
                        ->where('status', 'pending')
                        ->first();

                    if ($existingInvitation) {
                        $results[] = [
                            'email' => $invitationData['email'],
                            'success' => false,
                            'error' => 'Pending invitation already exists'
                        ];
                        $failed++;
                        continue;
                    }

                    // Create invitation
                    $invitation = WorkspaceInvitation::create([
                        'workspace_id' => $workspaceId,
                        'invited_by' => $user->id,
                        'email' => $invitationData['email'],
                        'role' => $invitationData['role'],
                        'department' => $invitationData['department'] ?? null,
                        'position' => $invitationData['position'] ?? null,
                        'personal_message' => $invitationData['personal_message'] ?? null,
                        'expires_at' => now()->addDays(7)
                    ]);

                    // Send invitation email
                    $emailSent = $this->sendInvitationEmail($invitation, $workspace);

                    $results[] = [
                        'email' => $invitationData['email'],
                        'success' => true,
                        'invitation_id' => $invitation->id,
                        'email_sent' => $emailSent
                    ];
                    $successful++;
                } catch (\Exception $e) {
                    $results[] = [
                        'email' => $invitationData['email'],
                        'success' => false,
                        'error' => $e->getMessage()
                    ];
                    $failed++;
                }
            }

            // Update batch with results
            $batch->update([
                'successful_invitations' => $successful,
                'failed_invitations' => $failed,
                'status' => $failed === 0 ? 'completed' : 'completed_with_errors',
                'completed_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'batch_id' => $batch->id,
                    'results' => $results,
                    'summary' => [
                        'total' => count($invitations),
                        'successful' => $successful,
                        'failed' => $failed
                    ]
                ],
                'message' => 'Bulk invitations processed successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to process bulk invitations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get invitation by token
     */
    public function getByToken($token)
    {
        try {
            $invitation = WorkspaceInvitation::with(['workspace', 'inviter:id,name,email,avatar'])
                ->where('token', $token)
                ->first();

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation not found'
                ], 404);
            }

            if ($invitation->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation is no longer valid'
                ], 410);
            }

            if ($invitation->isExpired()) {
                $invitation->markAsExpired();
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation has expired'
                ], 410);
            }

            return response()->json([
                'success' => true,
                'data' => $invitation
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch invitation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Accept invitation
     */
    public function accept($token)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be authenticated to accept invitation'
                ], 401);
            }

            $invitation = WorkspaceInvitation::where('token', $token)
                ->where('status', 'pending')
                ->first();

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired invitation'
                ], 404);
            }

            if ($invitation->isExpired()) {
                $invitation->markAsExpired();
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation has expired'
                ], 410);
            }

            // Check if user email matches invitation email
            if ($user->email !== $invitation->email) {
                return response()->json([
                    'success' => false,
                    'message' => 'This invitation is for a different email address'
                ], 403);
            }

            // Check if user is already a member
            $existingMember = WorkspaceMember::where('workspace_id', $invitation->workspace_id)
                ->where('user_id', $user->id)
                ->first();

            if ($existingMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are already a member of this workspace'
                ], 409);
            }

            DB::beginTransaction();

            try {
                // Create workspace membership
                $member = WorkspaceMember::create([
                    'workspace_id' => $invitation->workspace_id,
                    'user_id' => $user->id,
                    'role' => $invitation->role,
                    'department' => $invitation->department,
                    'position' => $invitation->position,
                    'joined_at' => now()
                ]);

                // Mark invitation as accepted
                $invitation->markAsAccepted();

                DB::commit();

                return response()->json([
                    'success' => true,
                    'data' => [
                        'member' => $member->load(['user:id,name,email,avatar', 'workspace:id,name']),
                        'workspace' => $invitation->workspace
                    ],
                    'message' => 'Invitation accepted successfully'
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to accept invitation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Decline invitation
     */
    public function decline(Request $request, $token)
    {
        try {
            $invitation = WorkspaceInvitation::where('token', $token)
                ->where('status', 'pending')
                ->first();

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid or expired invitation'
                ], 404);
            }

            $invitation->markAsDeclined($request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Invitation declined successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to decline invitation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resend invitation
     */
    public function resend($invitationId)
    {
        try {
            $user = Auth::user();
            
            $invitation = WorkspaceInvitation::with(['workspace'])
                ->where('id', $invitationId)
                ->first();

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation not found'
                ], 404);
            }

            // Verify user has access to this workspace
            $member = WorkspaceMember::where('workspace_id', $invitation->workspace_id)
                ->where('user_id', $user->id)
                ->whereIn('role', ['owner', 'admin'])
                ->first();
            
            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }

            if ($invitation->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only resend pending invitations'
                ], 400);
            }

            // Regenerate token and extend expiry
            $invitation->regenerateToken();
            $invitation->incrementReminders();

            // Send invitation email
            $emailSent = $this->sendInvitationEmail($invitation, $invitation->workspace);

            return response()->json([
                'success' => true,
                'data' => [
                    'invitation' => $invitation->load('inviter:id,name,email,avatar'),
                    'email_sent' => $emailSent
                ],
                'message' => 'Invitation resent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to resend invitation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel invitation
     */
    public function cancel($invitationId)
    {
        try {
            $user = Auth::user();
            
            $invitation = WorkspaceInvitation::where('id', $invitationId)->first();

            if (!$invitation) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invitation not found'
                ], 404);
            }

            // Verify user has access to this workspace
            $member = WorkspaceMember::where('workspace_id', $invitation->workspace_id)
                ->where('user_id', $user->id)
                ->whereIn('role', ['owner', 'admin'])
                ->first();
            
            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }

            if ($invitation->status !== 'pending') {
                return response()->json([
                    'success' => false,
                    'message' => 'Can only cancel pending invitations'
                ], 400);
            }

            $invitation->update(['status' => 'cancelled']);

            return response()->json([
                'success' => true,
                'message' => 'Invitation cancelled successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel invitation: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get invitation analytics
     */
    public function analytics($workspaceId)
    {
        try {
            $user = Auth::user();
            
            // Verify user has access to this workspace
            $member = WorkspaceMember::where('workspace_id', $workspaceId)
                ->where('user_id', $user->id)
                ->whereIn('role', ['owner', 'admin'])
                ->first();
            
            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }

            $invitations = WorkspaceInvitation::where('workspace_id', $workspaceId)->get();

            $analytics = [
                'overview' => [
                    'total' => $invitations->count(),
                    'pending' => $invitations->where('status', 'pending')->count(),
                    'accepted' => $invitations->where('status', 'accepted')->count(),
                    'declined' => $invitations->where('status', 'declined')->count(),
                    'expired' => $invitations->where('status', 'expired')->count(),
                    'cancelled' => $invitations->where('status', 'cancelled')->count()
                ],
                'distribution' => [
                    'roles' => $invitations->groupBy('role')->map->count(),
                    'departments' => $invitations->whereNotNull('department')->groupBy('department')->map->count()
                ],
                'acceptance_rate' => $invitations->count() > 0 
                    ? round(($invitations->where('status', 'accepted')->count() / $invitations->count()) * 100, 1)
                    : 0
            ];

            return response()->json([
                'success' => true,
                'data' => $analytics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send invitation email
     */
    private function sendInvitationEmail(WorkspaceInvitation $invitation, Workspace $workspace): bool
    {
        try {
            $inviteUrl = config('app.frontend_url') . '/accept-invitation/' . $invitation->token;
            
            $subject = "You've been invited to join {$workspace->name}";
            
            $htmlContent = view('emails.workspace_invitation', [
                'invitation' => $invitation,
                'workspace' => $workspace,
                'inviteUrl' => $inviteUrl
            ])->render();

            $this->emailService->sendEmail(
                $invitation->email,
                $subject,
                $htmlContent
            );

            return true;
        } catch (\Exception $e) {
            \Log::error('Failed to send invitation email: ' . $e->getMessage());
            return false;
        }
    }
}