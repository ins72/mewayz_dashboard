<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\CourseModule;
use App\Models\CourseLesson;
use App\Models\Workspace;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CourseController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $workspaceId = $request->input('workspace_id');
        
        // Validate workspace access
        if ($workspaceId) {
            $workspace = Workspace::find($workspaceId);
            if (!$workspace || !$workspace->members()->where('user_id', auth()->id())->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to workspace'
                ], 403);
            }
        }

        $query = Course::with(['workspace', 'creator', 'modules', 'lessons']);
        
        if ($workspaceId) {
            $query->where('workspace_id', $workspaceId);
        } else {
            // Get courses from all workspaces user has access to
            $userWorkspaceIds = auth()->user()->workspaces()->pluck('workspaces.id');
            $query->whereIn('workspace_id', $userWorkspaceIds);
        }

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by difficulty if provided
        if ($request->has('difficulty')) {
            $query->where('difficulty', $request->input('difficulty'));
        }

        // Filter by categories if provided
        if ($request->has('categories')) {
            $categories = is_array($request->input('categories')) ? $request->input('categories') : [$request->input('categories')];
            $query->where(function ($q) use ($categories) {
                foreach ($categories as $category) {
                    $q->orWhereJsonContains('categories', $category);
                }
            });
        }

        // Filter by tags if provided
        if ($request->has('tags')) {
            $tags = is_array($request->input('tags')) ? $request->input('tags') : [$request->input('tags')];
            $query->where(function ($q) use ($tags) {
                foreach ($tags as $tag) {
                    $q->orWhereJsonContains('tags', $tag);
                }
            });
        }

        // Search by title or description
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        // Filter by free courses
        if ($request->has('is_free')) {
            $query->where('is_free', $request->boolean('is_free'));
        }

        // Order by
        $orderBy = $request->input('order_by', 'created_at');
        $orderDirection = $request->input('order_direction', 'desc');
        $query->orderBy($orderBy, $orderDirection);

        $courses = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'courses' => $courses
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'workspace_id' => 'required|uuid|exists:workspaces,id',
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:courses,slug',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'status' => ['nullable', Rule::in(['draft', 'published', 'archived'])],
            'difficulty' => ['nullable', Rule::in(['beginner', 'intermediate', 'advanced'])],
            'estimated_duration' => 'nullable|integer|min:0',
            'categories' => 'nullable|array',
            'categories.*' => 'string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_free' => 'nullable|boolean',
        ]);

        // Validate workspace access
        $workspace = Workspace::find($request->workspace_id);
        if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to workspace'
            ], 403);
        }

        // Generate slug if not provided
        $slug = $request->slug ?: Str::slug($request->title);
        
        // Ensure slug is unique
        $baseSlug = $slug;
        $counter = 1;
        while (Course::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $course = Course::create([
            'id' => Str::uuid(),
            'workspace_id' => $request->workspace_id,
            'title' => $request->title,
            'slug' => $slug,
            'description' => $request->description,
            'thumbnail' => $request->thumbnail,
            'price' => $request->input('price', 0),
            'currency' => $request->input('currency', 'USD'),
            'status' => $request->input('status', 'draft'),
            'difficulty' => $request->input('difficulty', 'beginner'),
            'estimated_duration' => $request->estimated_duration,
            'categories' => $request->categories,
            'tags' => $request->tags,
            'is_free' => $request->input('is_free', false),
            'created_by' => auth()->id(),
        ]);

        return response()->json([
            'success' => true,
            'course' => $course->load(['workspace', 'creator', 'modules', 'lessons']),
            'message' => 'Course created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Course $course)
    {
        // Check if user has access to this course's workspace
        if (!$course->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to course'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'course' => $course->load(['workspace', 'creator', 'modules.lessons', 'lessons', 'enrollments'])
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Course $course)
    {
        // Check if user has access to this course's workspace
        $workspace = $course->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to update course'
            ], 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('courses', 'slug')->ignore($course->id)],
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'status' => ['nullable', Rule::in(['draft', 'published', 'archived'])],
            'difficulty' => ['nullable', Rule::in(['beginner', 'intermediate', 'advanced'])],
            'estimated_duration' => 'nullable|integer|min:0',
            'categories' => 'nullable|array',
            'categories.*' => 'string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'is_free' => 'nullable|boolean',
        ]);

        $course->update($request->only([
            'title', 'slug', 'description', 'thumbnail', 'price', 'currency', 
            'status', 'difficulty', 'estimated_duration', 'categories', 'tags', 'is_free'
        ]));

        return response()->json([
            'success' => true,
            'course' => $course->load(['workspace', 'creator', 'modules.lessons', 'lessons']),
            'message' => 'Course updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Course $course)
    {
        // Check if user has access to this course's workspace
        $workspace = $course->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to delete course'
            ], 403);
        }

        $course->delete();

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully'
        ]);
    }

    /**
     * Create a new module for the course.
     */
    public function createModule(Request $request, Course $course)
    {
        // Check if user has access to this course's workspace
        $workspace = $course->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to create module'
            ], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'order_index' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $module = CourseModule::create([
            'id' => Str::uuid(),
            'course_id' => $course->id,
            'title' => $request->title,
            'description' => $request->description,
            'order_index' => $request->input('order_index', 0),
            'is_active' => $request->input('is_active', true),
        ]);

        return response()->json([
            'success' => true,
            'module' => $module->load(['course', 'lessons']),
            'message' => 'Module created successfully'
        ], 201);
    }

    /**
     * Create a new lesson for the course.
     */
    public function createLesson(Request $request, Course $course)
    {
        // Check if user has access to this course's workspace
        $workspace = $course->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to create lesson'
            ], 403);
        }

        $request->validate([
            'module_id' => 'required|uuid|exists:course_modules,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => ['required', Rule::in(['video', 'text', 'quiz', 'assignment'])],
            'content' => 'nullable|string',
            'video_url' => 'nullable|url',
            'duration' => 'nullable|integer|min:0',
            'order_index' => 'nullable|integer|min:0',
            'is_free' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
            'resources' => 'nullable|array',
        ]);

        // Validate module belongs to course
        $module = CourseModule::find($request->module_id);
        if (!$module || $module->course_id !== $course->id) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid module for this course'
            ], 422);
        }

        $lesson = CourseLesson::create([
            'id' => Str::uuid(),
            'course_id' => $course->id,
            'module_id' => $request->module_id,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'content' => $request->content,
            'video_url' => $request->video_url,
            'duration' => $request->duration,
            'order_index' => $request->input('order_index', 0),
            'is_free' => $request->input('is_free', false),
            'is_active' => $request->input('is_active', true),
            'resources' => $request->resources,
        ]);

        return response()->json([
            'success' => true,
            'lesson' => $lesson->load(['course', 'module']),
            'message' => 'Lesson created successfully'
        ], 201);
    }

    /**
     * Get course analytics.
     */
    public function analytics(Course $course)
    {
        // Check if user has access to this course's workspace
        if (!$course->workspace->members()->where('user_id', auth()->id())->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access to course'
            ], 403);
        }

        $analytics = [
            'total_enrollments' => $course->total_enrollments,
            'average_rating' => $course->average_rating,
            'total_reviews' => $course->total_reviews,
            'total_modules' => $course->modules()->count(),
            'total_lessons' => $course->lessons()->count(),
            'total_duration' => $course->lessons()->sum('duration'),
            'completion_rate' => $course->enrollments()->whereNotNull('completed_at')->count() / ($course->total_enrollments ?: 1) * 100,
            'revenue' => $course->enrollments()->sum('amount_paid') ?? 0,
            'recent_enrollments' => $course->enrollments()
                                         ->with('user')
                                         ->latest()
                                         ->take(10)
                                         ->get(),
        ];

        return response()->json([
            'success' => true,
            'analytics' => $analytics
        ]);
    }

    /**
     * Duplicate a course.
     */
    public function duplicate(Course $course)
    {
        // Check if user has access to this course's workspace
        $workspace = $course->workspace;
        $member = $workspace->members()->where('user_id', auth()->id())->first();
        
        if (!$member || !in_array($member->role, ['owner', 'admin', 'editor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions to duplicate course'
            ], 403);
        }

        // Generate unique slug
        $baseSlug = $course->slug . '-copy';
        $slug = $baseSlug;
        $counter = 1;
        while (Course::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $duplicatedCourse = Course::create([
            'id' => Str::uuid(),
            'workspace_id' => $course->workspace_id,
            'title' => $course->title . ' (Copy)',
            'slug' => $slug,
            'description' => $course->description,
            'thumbnail' => $course->thumbnail,
            'price' => $course->price,
            'currency' => $course->currency,
            'status' => 'draft', // Start as draft
            'difficulty' => $course->difficulty,
            'estimated_duration' => $course->estimated_duration,
            'categories' => $course->categories,
            'tags' => $course->tags,
            'is_free' => $course->is_free,
            'created_by' => auth()->id(),
        ]);

        // Duplicate modules and lessons
        foreach ($course->modules as $module) {
            $duplicatedModule = CourseModule::create([
                'id' => Str::uuid(),
                'course_id' => $duplicatedCourse->id,
                'title' => $module->title,
                'description' => $module->description,
                'order_index' => $module->order_index,
                'is_active' => $module->is_active,
            ]);

            foreach ($module->lessons as $lesson) {
                CourseLesson::create([
                    'id' => Str::uuid(),
                    'course_id' => $duplicatedCourse->id,
                    'module_id' => $duplicatedModule->id,
                    'title' => $lesson->title,
                    'description' => $lesson->description,
                    'type' => $lesson->type,
                    'content' => $lesson->content,
                    'video_url' => $lesson->video_url,
                    'duration' => $lesson->duration,
                    'order_index' => $lesson->order_index,
                    'is_free' => $lesson->is_free,
                    'is_active' => $lesson->is_active,
                    'resources' => $lesson->resources,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'course' => $duplicatedCourse->load(['workspace', 'creator', 'modules.lessons']),
            'message' => 'Course duplicated successfully'
        ]);
    }
}
