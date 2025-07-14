<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class CourseModule extends Model
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
        'title',
        'description',
        'order_index',
        'is_active',
    ];

    /**
     * Get the attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'id' => 'string',
            'course_id' => 'string',
            'is_active' => 'boolean',
            'order_index' => 'integer',
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function ($module) {
            if (empty($module->id)) {
                $module->id = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the course that owns the module.
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * Get the module lessons.
     */
    public function lessons(): HasMany
    {
        return $this->hasMany(CourseLesson::class, 'module_id')->orderBy('order_index');
    }

    /**
     * Check if the module is active.
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get the module duration (sum of all lessons).
     */
    public function getDuration(): int
    {
        return $this->lessons()->sum('duration') ?? 0;
    }

    /**
     * Get formatted duration.
     */
    public function getFormattedDuration(): string
    {
        $totalSeconds = $this->getDuration();
        
        if ($totalSeconds === 0) {
            return '0m';
        }

        $hours = floor($totalSeconds / 3600);
        $minutes = floor(($totalSeconds % 3600) / 60);

        if ($hours > 0) {
            return "{$hours}h {$minutes}m";
        }

        return "{$minutes}m";
    }

    /**
     * Get the lesson count.
     */
    public function getLessonCount(): int
    {
        return $this->lessons()->count();
    }
}