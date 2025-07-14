<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class CourseLesson extends Model
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
        'course_id',
        'module_id',
        'title',
        'description',
        'type',
        'content',
        'video_url',
        'duration',
        'order_index',
        'is_free',
        'is_active',
        'resources',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'course_id' => 'string',
            'module_id' => 'string',
            'duration' => 'integer',
            'order_index' => 'integer',
            'is_free' => 'boolean',
            'is_active' => 'boolean',
            'resources' => 'array',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($lesson) {
            if (empty($lesson->id)) {
                $lesson->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the course that owns the lesson.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the module that owns the lesson.
     */
    public function module(): BelongsTo
    {
        return $this->belongsTo(CourseModule::class);
    }

    /**
     * Check if the lesson is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if the lesson is free.
     */
    public function isFree(): bool
    {
        return $this->is_free;
    }

    /**
     * Get the lesson type display name.
     */
    public function getTypeDisplayName(): string
    {
        return match($this->type) {
            'video' => 'Video',
            'text' => 'Text',
            'quiz' => 'Quiz',
            'assignment' => 'Assignment',
            default => ucfirst($this->type),
        };
    }

    /**
     * Get the lesson type icon.
     */
    public function getTypeIcon(): string
    {
        return match($this->type) {
            'video' => 'play-circle',
            'text' => 'file-text',
            'quiz' => 'help-circle',
            'assignment' => 'clipboard',
            default => 'file',
        };
    }

    /**
     * Get formatted duration.
     */
    public function getFormattedDuration(): string
    {
        if (!$this->duration) {
            return 'Duration not set';
        }

        $hours = floor($this->duration / 3600);
        $minutes = floor(($this->duration % 3600) / 60);
        $seconds = $this->duration % 60;

        if ($hours > 0) {
            return "{$hours}h {$minutes}m {$seconds}s";
        }

        if ($minutes > 0) {
            return "{$minutes}m {$seconds}s";
        }

        return "{$seconds}s";
    }

    /**
     * Get the lesson resources.
     */
    public function getFormattedResources(): array
    {
        return $this->resources ?? [];
    }

    /**
     * Add a resource to the lesson.
     */
    public function addResource(array $resource): void
    {
        $resources = $this->getFormattedResources();
        $resources[] = $resource;
        $this->update(['resources' => $resources]);
    }

    /**
     * Remove a resource from the lesson.
     */
    public function removeResource(int $index): void
    {
        $resources = $this->getFormattedResources();
        if (isset($resources[$index])) {
            unset($resources[$index]);
            $this->update(['resources' => array_values($resources)]);
        }
    }

    /**
     * Check if user can access this lesson.
     */
    public function canUserAccess(string $userId): bool
    {
        // If lesson is free, anyone can access
        if ($this->is_free) {
            return true;
        }

        // Check if user is enrolled in the course
        return $this->course->enrollments()
                          ->where('user_id', $userId)
                          ->exists();
    }

    /**
     * Check if user has completed this lesson.
     */
    public function isCompletedByUser(string $userId): bool
    {
        $enrollment = $this->course->enrollments()
                                  ->where('user_id', $userId)
                                  ->first();

        if (!$enrollment) {
            return false;
        }

        $completedLessons = $enrollment->completed_lessons_data ?? [];
        return in_array($this->id, $completedLessons);
    }
}