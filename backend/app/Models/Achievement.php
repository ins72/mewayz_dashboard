<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class Achievement extends Model
{
    use HasFactory;

    protected $fillable = [
        'id',
        'name',
        'description',
        'icon',
        'category',
        'type',
        'criteria',
        'points',
        'badge_image',
        'is_active',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'criteria' => 'array',
        'points' => 'integer',
        'is_active' => 'boolean'
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
    public function userAchievements()
    {
        return $this->hasMany(UserAchievement::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeForCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function scopeForType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Helper methods
    public static function getDefaultAchievements()
    {
        return [
            [
                'name' => 'First Steps',
                'description' => 'Complete your first workspace setup',
                'icon' => '🎯',
                'category' => 'general',
                'type' => 'milestone',
                'criteria' => ['action' => 'workspace_setup', 'count' => 1],
                'points' => 10,
                'is_active' => true
            ],
            [
                'name' => 'Social Media Pro',
                'description' => 'Schedule 100 Instagram posts',
                'icon' => '📱',
                'category' => 'instagram',
                'type' => 'milestone',
                'criteria' => ['action' => 'post_scheduled', 'count' => 100],
                'points' => 50,
                'is_active' => true
            ],
            [
                'name' => 'Template Creator',
                'description' => 'Create your first template',
                'icon' => '🎨',
                'category' => 'templates',
                'type' => 'milestone',
                'criteria' => ['action' => 'template_created', 'count' => 1],
                'points' => 25,
                'is_active' => true
            ],
            [
                'name' => 'Sales Champion',
                'description' => 'Generate $1,000 in revenue',
                'icon' => '💰',
                'category' => 'ecommerce',
                'type' => 'milestone',
                'criteria' => ['action' => 'revenue_generated', 'value' => 1000],
                'points' => 100,
                'is_active' => true
            ],
            [
                'name' => 'Team Builder',
                'description' => 'Invite 5 team members',
                'icon' => '👥',
                'category' => 'team',
                'type' => 'milestone',
                'criteria' => ['action' => 'team_member_invited', 'count' => 5],
                'points' => 30,
                'is_active' => true
            ],
            [
                'name' => 'Course Master',
                'description' => 'Create 10 courses',
                'icon' => '📚',
                'category' => 'courses',
                'type' => 'milestone',
                'criteria' => ['action' => 'course_created', 'count' => 10],
                'points' => 75,
                'is_active' => true
            ],
            [
                'name' => 'Marketing Guru',
                'description' => 'Launch 50 email campaigns',
                'icon' => '📧',
                'category' => 'marketing',
                'type' => 'milestone',
                'criteria' => ['action' => 'email_campaign_sent', 'count' => 50],
                'points' => 60,
                'is_active' => true
            ],
            [
                'name' => 'Daily Grind',
                'description' => 'Use the platform for 30 consecutive days',
                'icon' => '🔥',
                'category' => 'general',
                'type' => 'streak',
                'criteria' => ['action' => 'daily_login', 'streak' => 30],
                'points' => 40,
                'is_active' => true
            ]
        ];
    }

    public function checkEligibility($userStats)
    {
        $criteria = $this->criteria;
        $action = $criteria['action'];
        
        if (!isset($userStats[$action])) {
            return false;
        }
        
        $userValue = $userStats[$action];
        
        // Check different criteria types
        if (isset($criteria['count'])) {
            return $userValue['count'] >= $criteria['count'];
        }
        
        if (isset($criteria['value'])) {
            return $userValue['value'] >= $criteria['value'];
        }
        
        if (isset($criteria['streak'])) {
            return $userValue['streak'] >= $criteria['streak'];
        }
        
        return false;
    }
}