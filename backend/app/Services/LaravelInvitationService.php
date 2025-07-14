<?php

namespace App\Services;

use App\Models\WorkspaceInvitation;
use App\Models\Workspace;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LaravelInvitationService
{
    protected ElasticMailService $emailService;

    public function __construct(ElasticMailService $emailService)
    {
        $this->emailService = $emailService;
    }

    /**
     * Create a single invitation
     */
    public function createInvitation($workspaceId, $invitationData)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return ['success' => false, 'error' => 'User not authenticated'];
            }

            $workspace = Workspace::findOrFail($workspaceId);
            
            // Check if there's already a pending invitation
            $existingInvitation = WorkspaceInvitation::where('workspace_id', $workspaceId)
                ->where('email', $invitationData['email'])
                ->where('status', 'pending')
                ->first();

            if ($existingInvitation) {
                return ['success' => false, 'error' => 'There is already a pending invitation for this email'];
            }

            // Create invitation
            $invitation = WorkspaceInvitation::create([
                'workspace_id' => $workspaceId,
                'invited_by' => $user->id,
                'email' => $invitationData['email'],
                'role' => $invitationData['role'] ?? 'member',
                'department' => $invitationData['department'] ?? null,
                'position' => $invitationData['position'] ?? null,
                'personal_message' => $invitationData['personalMessage'] ?? null,
                'expires_at' => now()->addDays($invitationData['expiryDays'] ?? 7)
            ]);

            // Send invitation email
            $emailResult = $this->sendInvitationEmail($invitation, $workspace);

            return [
                'success' => true,
                'data' => [
                    'invitationId' => $invitation->id,
                    'emailSent' => $emailResult['success']
                ]
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to create invitation: ' . $e->getMessage()];
        }
    }

    /**
     * Create bulk invitations
     */
    public function createBulkInvitations($workspaceId, $invitations, $batchName = 'Bulk Import')
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return ['success' => false, 'error' => 'User not authenticated'];
            }

            $workspace = Workspace::findOrFail($workspaceId);
            
            $results = [];
            $successful = 0;
            $failed = 0;

            foreach ($invitations as $invitationData) {
                $result = $this->createInvitation($workspaceId, $invitationData);
                $results[] = array_merge($invitationData, $result);
                
                if ($result['success']) {
                    $successful++;
                } else {
                    $failed++;
                }
            }

            return [
                'success' => true,
                'data' => [
                    'results' => $results,
                    'summary' => [
                        'total' => count($invitations),
                        'successful' => $successful,
                        'failed' => $failed
                    ]
                ]
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to create bulk invitations: ' . $e->getMessage()];
        }
    }

    /**
     * Get workspace invitations
     */
    public function getWorkspaceInvitations($workspaceId, $filters = [])
    {
        try {
            $query = WorkspaceInvitation::with(['inviter:id,name,email,avatar', 'workspace:id,name'])
                ->where('workspace_id', $workspaceId)
                ->orderBy('created_at', 'desc');

            // Apply filters
            if (!empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }
            
            if (!empty($filters['role'])) {
                $query->where('role', $filters['role']);
            }
            
            if (!empty($filters['department'])) {
                $query->where('department', $filters['department']);
            }

            $invitations = $query->get();

            return ['success' => true, 'data' => $invitations];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to load invitations: ' . $e->getMessage()];
        }
    }

    /**
     * Get invitation by token
     */
    public function getInvitationByToken($token)
    {
        try {
            $invitation = WorkspaceInvitation::with(['workspace', 'inviter:id,name,email,avatar'])
                ->where('token', $token)
                ->where('status', 'pending')
                ->first();

            if (!$invitation) {
                return ['success' => false, 'error' => 'Invitation not found'];
            }

            // Check if invitation is expired
            if ($invitation->isExpired()) {
                $invitation->markAsExpired();
                return ['success' => false, 'error' => 'Invitation has expired'];
            }

            return ['success' => true, 'data' => $invitation];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to load invitation details: ' . $e->getMessage()];
        }
    }

    /**
     * Accept invitation
     */
    public function acceptInvitation($token)
    {
        try {
            $user = Auth::user();
            
            if (!$user) {
                return ['success' => false, 'error' => 'User must be authenticated to accept invitation'];
            }

            $invitation = WorkspaceInvitation::where('token', $token)
                ->where('status', 'pending')
                ->first();

            if (!$invitation) {
                return ['success' => false, 'error' => 'Invalid or expired invitation'];
            }

            if ($invitation->isExpired()) {
                $invitation->markAsExpired();
                return ['success' => false, 'error' => 'Invitation has expired'];
            }

            // Check if user email matches invitation email
            if ($user->email !== $invitation->email) {
                return ['success' => false, 'error' => 'This invitation is for a different email address'];
            }

            DB::beginTransaction();

            try {
                // Create workspace membership
                $member = \App\Models\WorkspaceMember::create([
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

                return [
                    'success' => true,
                    'data' => [
                        'member' => $member->load(['user:id,name,email,avatar', 'workspace:id,name']),
                        'workspace' => $invitation->workspace
                    ]
                ];
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to accept invitation: ' . $e->getMessage()];
        }
    }

    /**
     * Decline invitation
     */
    public function declineInvitation($token, $reason = '')
    {
        try {
            $invitation = WorkspaceInvitation::where('token', $token)
                ->where('status', 'pending')
                ->first();

            if (!$invitation) {
                return ['success' => false, 'error' => 'Invalid or expired invitation'];
            }

            $invitation->markAsDeclined($reason);

            return ['success' => true, 'data' => $invitation];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to decline invitation: ' . $e->getMessage()];
        }
    }

    /**
     * Resend invitation
     */
    public function resendInvitation($invitationId)
    {
        try {
            $invitation = WorkspaceInvitation::with(['workspace'])->findOrFail($invitationId);

            if ($invitation->status !== 'pending') {
                return ['success' => false, 'error' => 'Can only resend pending invitations'];
            }

            // Regenerate token and extend expiry
            $invitation->regenerateToken();
            $invitation->incrementReminders();

            // Send invitation email
            $emailResult = $this->sendInvitationEmail($invitation, $invitation->workspace);

            return [
                'success' => true,
                'data' => [
                    'invitation' => $invitation->load('inviter:id,name,email,avatar'),
                    'emailSent' => $emailResult['success']
                ]
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to resend invitation: ' . $e->getMessage()];
        }
    }

    /**
     * Cancel invitation
     */
    public function cancelInvitation($invitationId)
    {
        try {
            $invitation = WorkspaceInvitation::findOrFail($invitationId);

            if ($invitation->status !== 'pending') {
                return ['success' => false, 'error' => 'Can only cancel pending invitations'];
            }

            $invitation->update(['status' => 'cancelled']);

            return ['success' => true, 'data' => $invitation];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to cancel invitation: ' . $e->getMessage()];
        }
    }

    /**
     * Get invitation analytics
     */
    public function getInvitationAnalytics($workspaceId, $filters = [])
    {
        try {
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
                    'roles' => $invitations->groupBy('role')->map->count()->toArray(),
                    'departments' => $invitations->whereNotNull('department')->groupBy('department')->map->count()->toArray()
                ],
                'acceptance_rate' => $invitations->count() > 0 
                    ? round(($invitations->where('status', 'accepted')->count() / $invitations->count()) * 100, 1)
                    : 0
            ];

            return ['success' => true, 'data' => $analytics];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'Failed to load invitation analytics: ' . $e->getMessage()];
        }
    }

    /**
     * Send invitation email
     */
    private function sendInvitationEmail(WorkspaceInvitation $invitation, Workspace $workspace)
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

            return ['success' => true];
        } catch (\Exception $e) {
            \Log::error('Failed to send invitation email: ' . $e->getMessage());
            return ['success' => false, 'error' => 'Failed to send invitation email'];
        }
    }

    /**
     * Parse CSV data for bulk import
     */
    public function parseCsvData($csvText)
    {
        try {
            $lines = array_filter(explode("\n", trim($csvText)));
            
            if (count($lines) < 2) {
                return ['success' => false, 'error' => 'CSV must contain at least a header and one data row'];
            }

            $headers = array_map('trim', explode(',', $lines[0]));
            $headers = array_map('strtolower', $headers);
            
            $requiredHeaders = ['email'];
            $optionalHeaders = ['role', 'department', 'position', 'personal_message'];

            // Validate required headers
            $missingHeaders = array_diff($requiredHeaders, $headers);
            if (!empty($missingHeaders)) {
                return [
                    'success' => false,
                    'error' => 'Missing required headers: ' . implode(', ', $missingHeaders)
                ];
            }

            // Parse data rows
            $invitations = [];
            $errors = [];

            for ($i = 1; $i < count($lines); $i++) {
                $values = array_map('trim', explode(',', $lines[$i]));
                $invitation = [];

                foreach ($headers as $index => $header) {
                    if (isset($values[$index]) && $values[$index] !== '') {
                        $invitation[$header] = $values[$index];
                    }
                }

                // Validate email
                if (!filter_var($invitation['email'], FILTER_VALIDATE_EMAIL)) {
                    $errors[] = "Row " . ($i + 1) . ": Invalid email format";
                    continue;
                }

                // Set defaults
                $invitation['role'] = $invitation['role'] ?? 'member';
                
                $invitations[] = $invitation;
            }

            return [
                'success' => true,
                'data' => [
                    'invitations' => $invitations,
                    'errors' => $errors,
                    'summary' => [
                        'total' => count($lines) - 1,
                        'valid' => count($invitations),
                        'invalid' => count($errors)
                    ]
                ]
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Failed to parse CSV data. Please check the format.'
            ];
        }
    }
}