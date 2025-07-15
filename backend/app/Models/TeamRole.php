<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class TeamRole extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'workspace_id',
        'name',
        'description',
        'permissions',
        'is_default',
        'is_system',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_default' => 'boolean',
        'is_system' => 'boolean'
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($model) {
            if (!$model->id) {
                $model->id = (string) Str::uuid();
            }
        });
    }

    // Relationships
    public function workspace()
    {
        return $this->belongsTo(Workspace::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function workspaceUsers()
    {
        return $this->hasMany(WorkspaceUser::class, 'role_id');
    }

    // Scopes
    public function scopeForWorkspace($query, $workspaceId)
    {
        return $query->where('workspace_id', $workspaceId);
    }

    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    public function scopeCustom($query)
    {
        return $query->where('is_system', false);
    }

    // Helper methods
    public static function getDefaultRoles()
    {
        return [
            [
                'name' => 'Owner',
                'description' => 'Full access to all features and settings',
                'permissions' => [
                    'workspace' => ['read', 'write', 'delete', 'manage_users', 'manage_billing'],
                    'instagram' => ['read', 'write', 'delete', 'manage'],
                    'link_in_bio' => ['read', 'write', 'delete', 'manage'],
                    'courses' => ['read', 'write', 'delete', 'manage'],
                    'ecommerce' => ['read', 'write', 'delete', 'manage'],
                    'crm' => ['read', 'write', 'delete', 'manage'],
                    'marketing' => ['read', 'write', 'delete', 'manage'],
                    'templates' => ['read', 'write', 'delete', 'manage'],
                    'analytics' => ['read', 'write', 'export'],
                    'team' => ['read', 'write', 'delete', 'manage']
                ],
                'is_default' => true,
                'is_system' => true
            ],
            [
                'name' => 'Administrator',
                'description' => 'Administrative access with user management',
                'permissions' => [
                    'workspace' => ['read', 'write', 'manage_users'],
                    'instagram' => ['read', 'write', 'delete', 'manage'],
                    'link_in_bio' => ['read', 'write', 'delete', 'manage'],
                    'courses' => ['read', 'write', 'delete', 'manage'],
                    'ecommerce' => ['read', 'write', 'delete', 'manage'],
                    'crm' => ['read', 'write', 'delete', 'manage'],
                    'marketing' => ['read', 'write', 'delete', 'manage'],
                    'templates' => ['read', 'write', 'delete'],
                    'analytics' => ['read', 'write', 'export'],
                    'team' => ['read', 'write', 'manage']
                ],
                'is_default' => false,
                'is_system' => true
            ],
            [
                'name' => 'Manager',
                'description' => 'Content management and team coordination',
                'permissions' => [
                    'workspace' => ['read'],
                    'instagram' => ['read', 'write', 'delete'],
                    'link_in_bio' => ['read', 'write', 'delete'],
                    'courses' => ['read', 'write', 'delete'],
                    'ecommerce' => ['read', 'write'],
                    'crm' => ['read', 'write', 'delete'],
                    'marketing' => ['read', 'write', 'delete'],
                    'templates' => ['read', 'write'],
                    'analytics' => ['read'],
                    'team' => ['read']
                ],
                'is_default' => false,
                'is_system' => true
            ],
            [
                'name' => 'Editor',
                'description' => 'Content creation and editing',
                'permissions' => [
                    'workspace' => ['read'],
                    'instagram' => ['read', 'write'],
                    'link_in_bio' => ['read', 'write'],
                    'courses' => ['read', 'write'],
                    'ecommerce' => ['read'],
                    'crm' => ['read', 'write'],
                    'marketing' => ['read', 'write'],
                    'templates' => ['read', 'write'],
                    'analytics' => ['read'],
                    'team' => ['read']
                ],
                'is_default' => false,
                'is_system' => true
            ],
            [
                'name' => 'Viewer',
                'description' => 'Read-only access to most features',
                'permissions' => [
                    'workspace' => ['read'],
                    'instagram' => ['read'],
                    'link_in_bio' => ['read'],
                    'courses' => ['read'],
                    'ecommerce' => ['read'],
                    'crm' => ['read'],
                    'marketing' => ['read'],
                    'templates' => ['read'],
                    'analytics' => ['read'],
                    'team' => ['read']
                ],
                'is_default' => false,
                'is_system' => true
            ]
        ];
    }

    public function hasPermission($module, $action)
    {
        return isset($this->permissions[$module]) && in_array($action, $this->permissions[$module]);
    }

    public function grantPermission($module, $action)
    {
        $permissions = $this->permissions;
        
        if (!isset($permissions[$module])) {
            $permissions[$module] = [];
        }
        
        if (!in_array($action, $permissions[$module])) {
            $permissions[$module][] = $action;
        }
        
        $this->permissions = $permissions;
        $this->save();
    }

    public function revokePermission($module, $action)
    {
        $permissions = $this->permissions;
        
        if (isset($permissions[$module])) {
            $permissions[$module] = array_diff($permissions[$module], [$action]);
            
            if (empty($permissions[$module])) {
                unset($permissions[$module]);
            }
        }
        
        $this->permissions = $permissions;
        $this->save();
    }
}