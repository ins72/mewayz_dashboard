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
      throw error;
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
      throw error;
    }
  },

  // Update course
  async updateCourse(courseId, courseData) {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  // Delete course
  async deleteCourse(courseId) {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
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