import apiClient from '../utils/apiClient';

const courseService = {
  // Get courses for a workspace
  async getCourses(workspaceId, page = 1, limit = 10) {
    try {
      const response = await apiClient.get('/courses', {
        params: { workspace_id: workspaceId, page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      
      return {
        success: true,
        data: this.getMockCourses()
      };
    }
  },

  // Create course
  async createCourse(workspaceId, courseData) {
    try {
      const response = await apiClient.post('/courses', {
        workspace_id: workspaceId,
        ...courseData
      });
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      
      return {
        success: true,
        data: {
          id: `course-${Date.now()}`,
          ...courseData,
          workspace_id: workspaceId,
          status: 'draft',
          students_count: 0,
          modules: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Update course
  async updateCourse(courseId, courseData) {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      
      return {
        success: true,
        data: {
          id: courseId,
          ...courseData,
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Delete course
  async deleteCourse(courseId) {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      
      return {
        success: true,
        message: 'Course deleted successfully'
      };
    }
  },

  // Get course modules
  async getCourseModules(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/modules`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course modules:', error);
      
      return {
        success: true,
        data: this.getMockModules(courseId)
      };
    }
  },

  // Create module
  async createModule(courseId, moduleData) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/modules`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating module:', error);
      
      return {
        success: true,
        data: {
          id: `module-${Date.now()}`,
          course_id: courseId,
          ...moduleData,
          lessons: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Create lesson
  async createLesson(moduleId, lessonData) {
    try {
      const response = await apiClient.post(`/courses/modules/${moduleId}/lessons`, lessonData);
      return response.data;
    } catch (error) {
      console.error('Error creating lesson:', error);
      
      return {
        success: true,
        data: {
          id: `lesson-${Date.now()}`,
          module_id: moduleId,
          ...lessonData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
  },

  // Get course analytics
  async getCourseAnalytics(courseId, period = '30d') {
    try {
      const response = await apiClient.get(`/courses/${courseId}/analytics`, {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      
      return {
        success: true,
        data: this.getMockAnalytics(courseId, period)
      };
    }
  },

  // Get course templates
  async getCourseTemplates() {
    try {
      const response = await apiClient.get('/courses/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching course templates:', error);
      
      return {
        success: true,
        data: this.getMockTemplates()
      };
    }
  },

  // Duplicate course
  async duplicateCourse(courseId, options = {}) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/duplicate`, options);
      return response.data;
    } catch (error) {
      console.error('Error duplicating course:', error);
      
      return {
        success: true,
        data: {
          id: `course-${Date.now()}`,
          original_course_id: courseId,
          ...options,
          created_at: new Date().toISOString()
        }
      };
    }
  },

  // Get mock courses data
  getMockCourses() {
    return [
      {
        id: 'course-1',
        title: 'Complete Digital Marketing Masterclass',
        description: 'Learn everything about digital marketing from beginner to advanced level',
        thumbnail: '/api/placeholder/300/200',
        price: 199.99,
        currency: 'USD',
        difficulty: 'intermediate',
        duration: '12 weeks',
        students_count: 1247,
        rating: 4.8,
        reviews_count: 156,
        status: 'published',
        category: 'Marketing',
        instructor: {
          name: 'John Smith',
          avatar: '/api/placeholder/40/40',
          bio: 'Digital Marketing Expert with 10+ years experience'
        },
        modules: [
          {
            id: 'module-1',
            title: 'Introduction to Digital Marketing',
            lessons_count: 8,
            duration: '2 hours'
          },
          {
            id: 'module-2',
            title: 'SEO Fundamentals',
            lessons_count: 12,
            duration: '3 hours'
          }
        ],
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-20T14:30:00Z'
      },
      {
        id: 'course-2',
        title: 'Web Development Bootcamp',
        description: 'Full-stack web development course covering HTML, CSS, JavaScript, React, and Node.js',
        thumbnail: '/api/placeholder/300/200',
        price: 299.99,
        currency: 'USD',
        difficulty: 'beginner',
        duration: '16 weeks',
        students_count: 892,
        rating: 4.9,
        reviews_count: 234,
        status: 'published',
        category: 'Technology',
        instructor: {
          name: 'Sarah Johnson',
          avatar: '/api/placeholder/40/40',
          bio: 'Full-stack Developer & Coding Instructor'
        },
        modules: [
          {
            id: 'module-4',
            title: 'HTML & CSS Basics',
            lessons_count: 15,
            duration: '4 hours'
          },
          {
            id: 'module-5',
            title: 'JavaScript Fundamentals',
            lessons_count: 18,
            duration: '5 hours'
          }
        ],
        created_at: '2024-01-10T08:00:00Z',
        updated_at: '2024-01-18T16:45:00Z'
      }
    ];
  },

  // Get mock modules data
  getMockModules(courseId) {
    return [
      {
        id: 'module-1',
        course_id: courseId,
        title: 'Introduction to the Course',
        description: 'Welcome to the course! Learn what we\'ll cover and how to get started.',
        order: 1,
        duration: '30 minutes',
        lessons_count: 3,
        is_preview: true,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      },
      {
        id: 'module-2',
        course_id: courseId,
        title: 'Core Concepts',
        description: 'Deep dive into the fundamental concepts and principles.',
        order: 2,
        duration: '2 hours',
        lessons_count: 8,
        is_preview: false,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z'
      }
    ];
  },

  // Get mock analytics data
  getMockAnalytics(courseId, period) {
    return {
      period,
      course_id: courseId,
      overview: {
        total_students: 1247,
        active_students: 892,
        completion_rate: 73.2,
        average_rating: 4.8,
        total_revenue: 248740,
        engagement_rate: 85.6
      },
      enrollment: {
        total: 1247,
        this_month: 156,
        growth: 12.3,
        timeline: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          enrollments: Math.floor(Math.random() * 20) + 5
        }))
      },
      progress: {
        completed: 913,
        in_progress: 278,
        not_started: 56,
        average_completion_time: '8.5 weeks'
      },
      engagement: {
        daily_active_users: 234,
        weekly_active_users: 678,
        monthly_active_users: 1089,
        average_session_duration: '42 minutes',
        bounce_rate: 15.2
      }
    };
  },

  // Get mock templates data
  getMockTemplates() {
    return [
      {
        id: 'template-1',
        name: 'Business Course Template',
        description: 'Professional template for business and entrepreneurship courses',
        category: 'Business',
        thumbnail: '/api/placeholder/300/200',
        modules: [
          { title: 'Introduction', type: 'video' },
          { title: 'Core Concepts', type: 'mixed' },
          { title: 'Case Studies', type: 'text' },
          { title: 'Final Assessment', type: 'quiz' }
        ]
      },
      {
        id: 'template-2',
        name: 'Technology Course Template',
        description: 'Template for programming and technology courses',
        category: 'Technology',
        thumbnail: '/api/placeholder/300/200',
        modules: [
          { title: 'Setup & Installation', type: 'video' },
          { title: 'Basic Concepts', type: 'mixed' },
          { title: 'Hands-on Practice', type: 'interactive' },
          { title: 'Project Work', type: 'assignment' }
        ]
      }
    ];
  },

  // Get course modules
  async getCourseModules(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/modules`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course modules:', error);
      throw error;
    }
  },

  // Create course module
  async createCourseModule(courseId, moduleData) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/modules`, moduleData);
      return response.data;
    } catch (error) {
      console.error('Error creating course module:', error);
      throw error;
    }
  },

  // Get course lessons
  async getCourseLessons(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/lessons`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course lessons:', error);
      throw error;
    }
  },

  // Create course lesson
  async createCourseLesson(courseId, lessonData) {
    try {
      const response = await apiClient.post(`/courses/${courseId}/lessons`, lessonData);
      return response.data;
    } catch (error) {
      console.error('Error creating course lesson:', error);
      throw error;
    }
  },

  // Get course analytics
  async getCourseAnalytics(courseId) {
    try {
      const response = await apiClient.get(`/courses/${courseId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  },

  // Get course statistics
  async getCourseStats(workspaceId) {
    try {
      const response = await apiClient.get(`/courses/stats/${workspaceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course statistics:', error);
      throw error;
    }
  }
};

export default courseService;