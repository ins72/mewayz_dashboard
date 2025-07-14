<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Course extends Model
{
    /**
     * Indicates if the IDs are auto-incrementing.
     */
    public $incrementing = false;

    /**
     * The "type" of the auto-incrementing ID.
     */
    protected $keyType = 'string';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'id',
        'workspace_id',
        'title',
        'slug',
        'description',
        'thumbnail',
        'price',
        'currency',
        'status',
        'difficulty',
        'estimated_duration',
        'categories',
        'tags',
        'is_free',
        'total_enrollments',
        'average_rating',
        'total_reviews',
        'created_by',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'workspace_id' => 'string',
            'created_by' => 'string',
            'price' => 'decimal:2',
            'average_rating' => 'decimal:2',
            'categories' => 'array',
            'tags' => 'array',
            'is_free' => 'boolean',
            'total_enrollments' => 'integer',
            'total_reviews' => 'integer',
            'estimated_duration' => 'integer',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($course) {
            if (empty($course->id)) {
                $course->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the workspace that owns the course.
     */
    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    /**
     * Get the user who created this course.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the course modules.
     */
    public function modules(): HasMany
    {
        return $this->hasMany(CourseModule::class)->orderBy('order_index');
    }

    /**
     * Get the course lessons.
     */
    public function lessons(): HasMany
    {
        return $this->hasMany(CourseLesson::class)->orderBy('order_index');
    }

    /**
     * Get the course enrollments.
     */
    public function enrollments(): HasMany
    {
        return $this->hasMany(CourseEnrollment::class);
    }

    /**
     * Check if the course is published.
     */
    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    /**
     * Check if the course is draft.
     */
    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    /**
     * Check if the course is archived.
     */
    public function isArchived(): bool
    {
        return $this->status === 'archived';
    }

    /**
     * Get the course difficulty display name.
     */
    public function getDifficultyDisplayName(): string
    {
        return match($this->difficulty) {
            'beginner' => 'Beginner',
            'intermediate' => 'Intermediate',
            'advanced' => 'Advanced',
            default => ucfirst($this->difficulty),
        };
    }

    /**
     * Get the course difficulty color.
     */
    public function getDifficultyColor(): string
    {
        return match($this->difficulty) {
            'beginner' => 'green',
            'intermediate' => 'orange',
            'advanced' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get formatted duration (hours and minutes).
     */
    public function getFormattedDuration(): string
    {
        if (!$this->estimated_duration) {
            return 'Duration not set';
        }

        $hours = floor($this->estimated_duration / 60);
        $minutes = $this->estimated_duration % 60;

        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        }

        return "{$minutes}m";
    }

    /**
     * Get the course price display.
     */
    public function getPriceDisplay(): string
    {
        if ($this->is_free) {
            return 'Free';
        }

        return "{$this->currency} {$this->price}";
    }

    /**
     * Get the course rating display.
     */
    public function getRatingDisplay(): string
    {
        if ($this->total_reviews === 0) {
            return 'No ratings yet';
        }

        return "{$this->average_rating}/5 ({$this->total_reviews} reviews)";
    }

    /**
     * Get the course progress for a user.
     */
    public function getProgressForUser(string $userId): array
    {
        $enrollment = $this->enrollments()->where('user_id', $userId)->first();
        
        if (!$enrollment) {
            return [
                'enrolled' => false,
                'progress_percentage' => 0,
                'completed_lessons' => 0,
                'total_lessons' => $this->lessons()->count(),
            ];
        }

        $totalLessons = $this->lessons()->count();
        $completedLessons = $enrollment->completed_lessons ?? 0;
        $progressPercentage = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100, 2) : 0;

        return [
            'enrolled' => true,
            'progress_percentage' => $progressPercentage,
            'completed_lessons' => $completedLessons,
            'total_lessons' => $totalLessons,
            'enrollment_date' => $enrollment->created_at,
            'completion_date' => $enrollment->completed_at,
        ];
    }

    /**
     * Get formatted categories.
     */
    public function getFormattedCategories(): array
    {
        return $this->categories ?? [];
    }

    /**
     * Get formatted tags.
     */
    public function getFormattedTags(): array
    {
        return $this->tags ?? [];
    }

    /**
     * Update enrollment count.
     */
    public function updateEnrollmentCount(): void
    {
        $this->update(['total_enrollments' => $this->enrollments()->count()]);
    }

    /**
     * Calculate and update average rating.
     */
    public function updateAverageRating(): void
    {
        $enrollments = $this->enrollments()->whereNotNull('rating');
        $averageRating = $enrollments->avg('rating') ?? 0;
        $totalReviews = $enrollments->count();

        $this->update([
            'average_rating' => round($averageRating, 2),
            'total_reviews' => $totalReviews,
        ]);
    }

    /**
     * Get the course URL.
     */
    public function getUrl(): string
    {
        return url("/courses/{$this->slug}");
    }

    /**
     * Get the course public URL.
     */
    public function getPublicUrl(): string
    {
        return $this->getUrl();
    }
}