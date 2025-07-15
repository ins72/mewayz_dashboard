import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import courseService from '../services/courseService';

const CourseManagement = ({ workspaceId }) => {
  const [courses, setCourses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'beginner',
    price: '',
    currency: 'USD',
    thumbnail: '',
    duration: '',
    modules: []
  });

  useEffect(() => {
    loadCourses();
    loadTemplates();
  }, [workspaceId]);

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const response = await courseService.getCourses(workspaceId);
      if (response.success) {
        setCourses(response.data || []);
      }
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await courseService.getCourseTemplates();
      if (response.success) {
        setTemplates(response.data || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleCreateCourse = async () => {
    setIsLoading(true);
    try {
      const response = await courseService.createCourse(workspaceId, newCourse);
      if (response.success) {
        setCourses([...courses, response.data]);
        setShowCourseModal(false);
        setNewCourse({
          title: '',
          description: '',
          category: '',
          difficulty: 'beginner',
          price: '',
          currency: 'USD',
          thumbnail: '',
          duration: '',
          modules: []
        });
      }
    } catch (error) {
      console.error('Error creating course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter(c => c.id !== courseId));
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  const handleDuplicateCourse = async (courseId) => {
    try {
      const response = await courseService.duplicateCourse(courseId);
      if (response.success) {
        setCourses([...courses, response.data]);
      }
    } catch (error) {
      console.error('Error duplicating course:', error);
    }
  };

  const handleViewAnalytics = async (courseId) => {
    setIsLoading(true);
    try {
      const response = await courseService.getCourseAnalytics(courseId);
      if (response.success) {
        setAnalytics(response.data);
        setSelectedCourse(courses.find(c => c.id === courseId));
        setShowAnalytics(true);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = (template) => {
    setNewCourse(prev => ({
      ...prev,
      title: template.name,
      description: template.description,
      category: template.category,
      modules: template.modules
    }));
  };

  const renderCourseCard = (course) => (
    <motion.div
      key={course.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="relative">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            course.status === 'published' 
              ? 'bg-green-100 text-green-800' 
              : course.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {course.status}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{course.title}</h3>
          <span className="text-lg font-bold text-blue-600">${course.price}</span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <i className="fas fa-user-graduate mr-1"></i>
            <span>{course.students_count} students</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-star text-yellow-500 mr-1"></i>
            <span>{course.rating} ({course.reviews_count})</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-clock mr-1"></i>
            <span>{course.duration}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <img 
              src={course.instructor?.avatar} 
              alt={course.instructor?.name}
              className="w-6 h-6 rounded-full mr-2"
            />
            <span className="text-sm text-gray-600">{course.instructor?.name}</span>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {course.category}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedCourse(course);
              setShowCourseModal(true);
            }}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <i className="fas fa-edit mr-2"></i>
            Edit
          </button>
          <button
            onClick={() => handleViewAnalytics(course.id)}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <i className="fas fa-chart-line mr-2"></i>
            Analytics
          </button>
          <div className="relative">
            <button
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle dropdown menu
              }}
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderCourseModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCourse ? 'Edit Course' : 'Create New Course'}
            </h2>
            <button
              onClick={() => setShowCourseModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleCreateCourse(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Complete Digital Marketing Course"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={newCourse.category}
                  onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Business">Business</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Creative">Creative</option>
                  <option value="Health">Health & Fitness</option>
                  <option value="Education">Education</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Describe what students will learn in this course..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  value={newCourse.difficulty}
                  onChange={(e) => setNewCourse({ ...newCourse, difficulty: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={newCourse.duration}
                  onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 8 weeks"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thumbnail URL
              </label>
              <input
                type="url"
                value={newCourse.thumbnail}
                onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCourseModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !newCourse.title}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : selectedCourse ? 'Update Course' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );

  const renderAnalyticsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Course Analytics - {selectedCourse?.title}
            </h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {analytics && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.overview.total_students.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.overview.completion_rate}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.overview.average_rating}
                  </div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    ${analytics.overview.total_revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
              </div>
              
              {/* Enrollment and Progress */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Enrollment Growth</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>This Month:</span>
                      <span className="font-semibold">{analytics.enrollment.this_month}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Growth:</span>
                      <span className="font-semibold text-green-600">+{analytics.enrollment.growth}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Student Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-semibold text-green-600">{analytics.progress.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress:</span>
                      <span className="font-semibold text-blue-600">{analytics.progress.in_progress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Not Started:</span>
                      <span className="font-semibold text-gray-600">{analytics.progress.not_started}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Engagement Metrics */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Engagement Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.engagement.daily_active_users}</div>
                    <div className="text-sm text-gray-600">Daily Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.engagement.weekly_active_users}</div>
                    <div className="text-sm text-gray-600">Weekly Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{analytics.engagement.average_session_duration}</div>
                    <div className="text-sm text-gray-600">Avg Session Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{analytics.engagement.bounce_rate}%</div>
                    <div className="text-sm text-gray-600">Bounce Rate</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">Course Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setShowCourseModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Course
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'courses' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-graduation-cap mr-2"></i>
            Courses
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'templates' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-layer-group mr-2"></i>
            Templates
          </button>
        </div>
        
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'courses' && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : courses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map(renderCourseCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-graduation-cap text-6xl text-gray-400 mb-4"></i>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Courses Yet</h2>
                  <p className="text-gray-600 mb-6">
                    Create your first course to start teaching and sharing your knowledge
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCourse(null);
                      setShowCourseModal(true);
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create Your First Course
                  </button>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'templates' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                  <motion.div
                    key={template.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                    whileHover={{ y: -2 }}
                    onClick={() => applyTemplate(template)}
                  >
                    <img 
                      src={template.thumbnail} 
                      alt={template.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{template.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {template.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {template.modules.length} modules
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showCourseModal && renderCourseModal()}
        {showAnalytics && renderAnalyticsModal()}
      </AnimatePresence>
    </div>
  );
};

export default CourseManagement;