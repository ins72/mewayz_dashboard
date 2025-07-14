<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;

class CreateInvitationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->can('create', [WorkspaceInvitation::class, $this->workspace]);
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'email:rfc,dns',
                'max:255',
                'not_regex:/[<>"\']/',
                Rule::unique('workspace_invitations')
                    ->where('workspace_id', $this->route('workspace'))
                    ->where('status', 'pending')
            ],
            'role' => [
                'required',
                'string',
                Rule::in(['owner', 'admin', 'editor', 'contributor', 'viewer', 'guest'])
            ],
            'department' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[a-zA-Z0-9\s\-_]+$/'
            ],
            'position' => [
                'nullable',
                'string',
                'max:100',
                'regex:/^[a-zA-Z0-9\s\-_]+$/'
            ],
            'personal_message' => [
                'nullable',
                'string',
                'max:1000',
                'not_regex:/[<>]/'
            ],
            'expires_in_days' => [
                'nullable',
                'integer',
                'min:1',
                'max:30'
            ]
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email address is required.',
            'email.email' => 'Please enter a valid email address.',
            'email.not_regex' => 'Email contains invalid characters.',
            'email.unique' => 'This email already has a pending invitation.',
            'role.required' => 'Role is required.',
            'role.in' => 'Invalid role selected.',
            'department.regex' => 'Department contains invalid characters.',
            'position.regex' => 'Position contains invalid characters.',
            'personal_message.not_regex' => 'Personal message contains invalid characters.',
            'personal_message.max' => 'Personal message is too long.',
            'expires_in_days.min' => 'Expiration must be at least 1 day.',
            'expires_in_days.max' => 'Expiration cannot exceed 30 days.'
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'expires_in_days' => 'expiration period'
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        Log::warning('Invitation validation failed', [
            'user_id' => $this->user()?->id,
            'workspace_id' => $this->route('workspace'),
            'errors' => $validator->errors()->toArray(),
            'input' => $this->except(['personal_message']),
            'ip' => $this->ip()
        ]);

        parent::failedValidation($validator);
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Additional business logic validation
            $this->validateBusinessRules($validator);
        });
    }

    /**
     * Validate business rules
     */
    private function validateBusinessRules($validator): void
    {
        // Check if workspace exists and user has access
        $workspace = \App\Models\Workspace::find($this->route('workspace'));
        if (!$workspace) {
            $validator->errors()->add('workspace', 'Workspace not found.');
            return;
        }

        // Check if user is already a member
        $existingMember = \App\Models\WorkspaceMember::where('workspace_id', $workspace->id)
            ->whereHas('user', function ($query) {
                $query->where('email', $this->input('email'));
            })
            ->first();

        if ($existingMember) {
            $validator->errors()->add('email', 'This user is already a member of the workspace.');
        }

        // Check workspace member limits (business rule)
        $memberCount = \App\Models\WorkspaceMember::where('workspace_id', $workspace->id)->count();
        $invitationCount = \App\Models\WorkspaceInvitation::where('workspace_id', $workspace->id)
            ->where('status', 'pending')
            ->count();

        if (($memberCount + $invitationCount) >= 100) { // Example limit
            $validator->errors()->add('workspace', 'Workspace has reached the maximum member limit.');
        }

        // Role-based validation
        $userRole = \App\Models\WorkspaceMember::where('workspace_id', $workspace->id)
            ->where('user_id', $this->user()->id)
            ->first()?->role;

        if (!$this->canInviteWithRole($userRole, $this->input('role'))) {
            $validator->errors()->add('role', 'You do not have permission to invite users with this role.');
        }
    }

    /**
     * Check if user can invite with specific role
     */
    private function canInviteWithRole(?string $userRole, string $inviteRole): bool
    {
        $roleHierarchy = [
            'owner' => ['owner', 'admin', 'editor', 'contributor', 'viewer', 'guest'],
            'admin' => ['editor', 'contributor', 'viewer', 'guest'],
            'editor' => ['contributor', 'viewer', 'guest'],
            'contributor' => ['viewer', 'guest'],
            'viewer' => [],
            'guest' => []
        ];

        return in_array($inviteRole, $roleHierarchy[$userRole] ?? []);
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        $this->merge([
            'email' => strtolower(trim($this->input('email'))),
            'role' => strtolower(trim($this->input('role'))),
            'department' => $this->input('department') ? trim($this->input('department')) : null,
            'position' => $this->input('position') ? trim($this->input('position')) : null,
            'personal_message' => $this->input('personal_message') ? trim($this->input('personal_message')) : null,
        ]);
    }
}