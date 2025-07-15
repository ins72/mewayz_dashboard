import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Instagram, 
  Calendar, 
  BarChart3, 
  Users, 
  MessageCircle,
  Image,
  Video,
  Hash,
  Clock,
  TrendingUp,
  Heart,
  Share2,
  Eye,
  Play,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import socialMediaService from '../../services/socialMediaService';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card } from '../ui/Card';

const InstagramManagement = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('create');
  const [postType, setPostType] = useState('image');
  const [caption, setCaption] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recentPosts, setRecentPosts] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalFollowers: 0,
    totalPosts: 0,
    averageLikes: 0,
    engagementRate: 0,
    reachThisWeek: 0,
    profileVisits: 0
  });

  // Load Instagram data from API
  useEffect(() => {
    if (currentWorkspace?.id) {
      loadInstagramData();
    }
  }, [currentWorkspace]);

  const loadInstagramData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load recent posts
      const postsResponse = await socialMediaService.getPosts(currentWorkspace.id, null, 1, 10);
      if (postsResponse.success) {
        setRecentPosts(postsResponse.posts.data || []);
      }

      // Load analytics
      const analyticsResponse = await socialMediaService.getAnalytics(currentWorkspace.id);
      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.analytics);
      }

    } catch (error) {
      setError('Failed to load Instagram data');
      console.error('Error loading Instagram data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async () => {
    try {
      const postData = {
        social_media_account_id: null, // This would come from selected account
        title: caption.substring(0, 100),
        content: caption,
        hashtags: hashtags.split(' ').filter(tag => tag.startsWith('#')),
        status: scheduledTime ? 'scheduled' : 'draft',
        scheduled_at: scheduledTime || null,
        media_urls: [] // This would come from uploaded media
      };

      const response = await socialMediaService.createPost(currentWorkspace.id, postData);
      if (response.success) {
        setRecentPosts([response.post, ...recentPosts]);
        setCaption('');
        setScheduledTime('');
        setHashtags('');
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Instagram Data</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={loadInstagramData}>Try Again</Button>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'create', label: 'Create Post', icon: Instagram },
    { id: 'schedule', label: 'Scheduled', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'audience', label: 'Audience', icon: Users }
  ];

  const renderCreatePost = () => (
    <div className="space-y-6">
      {/* Post Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Post Type
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'image', label: 'Image', icon: Image },
            { id: 'video', label: 'Video', icon: Video },
            { id: 'carousel', label: 'Carousel', icon: Hash }
          ].map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setPostType(type.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  postType === type.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                }`}
              >
                <IconComponent className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                <div className="text-sm font-medium text-white">{type.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-3">
          Upload Media
        </label>
        <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
              <Image className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-400">
              Drag and drop your {postType} here, or <span className="text-blue-400 cursor-pointer">browse</span>
            </p>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG, MP4 (Max 10MB)
            </p>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div>
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Caption
        </label>
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write your caption here..."
          rows={4}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <div className="text-xs text-gray-500 mt-1">
          {caption.length}/2200 characters
        </div>
      </div>

      {/* Hashtags */}
      <div>
        <Input
          label="Hashtags"
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="#marketing #business #growth"
          icon={<Hash className="h-4 w-4" />}
        />
      </div>

      {/* Schedule */}
      <div>
        <Input
          label="Schedule for later (optional)"
          type="datetime-local"
          value={scheduledTime}
          onChange={(e) => setScheduledTime(e.target.value)}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      {/* Actions */}
      <div className="flex space-x-4">
        <Button
          onClick={handlePostSubmit}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {scheduledTime ? 'Schedule Post' : 'Post Now'}
        </Button>
        <Button variant="outline" className="px-8">
          Save Draft
        </Button>
      </div>
    </div>
  );

  const renderScheduled = () => (
    <div className="space-y-4">
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Scheduled Posts</h3>
        <p className="text-gray-400">Create a post and schedule it for later</p>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{analytics.totalFollowers.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Followers</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{analytics.averageLikes}</div>
            <div className="text-sm text-gray-400">Avg Likes</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{analytics.engagementRate}%</div>
            <div className="text-sm text-gray-400">Engagement</div>
          </div>
        </Card>
      </div>

      {/* Recent Posts Performance */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Posts Performance</h3>
        <div className="space-y-4">
          {recentPosts.map((post) => (
            <Card key={post.id} className="p-4">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                  {post.type === 'video' ? (
                    <Play className="h-6 w-6 text-white" />
                  ) : (
                    <Image className="h-6 w-6 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <p className="text-white font-medium line-clamp-2">{post.caption}</p>
                  <p className="text-gray-400 text-sm mt-1">{post.posted}</p>
                  
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-red-400" />
                      <span className="text-sm text-gray-300">{post.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-gray-300">{post.comments}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Share2 className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-gray-300">{post.shares}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAudience = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{analytics.reachThisWeek.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Reach This Week</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{analytics.profileVisits.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Profile Visits</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400">{analytics.totalPosts}</div>
            <div className="text-sm text-gray-400">Total Posts</div>
          </div>
        </Card>
      </div>

      <div className="text-center py-8">
        <Users className="h-12 w-12 text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Audience Insights</h3>
        <p className="text-gray-400">Detailed audience analytics coming soon</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <Instagram className="h-8 w-8 mr-3 text-pink-400" />
          Instagram Management
        </h1>
        <p className="text-gray-400">
          Create, schedule, and analyze your Instagram content all in one place
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-6">
          {activeTab === 'create' && renderCreatePost()}
          {activeTab === 'schedule' && renderScheduled()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'audience' && renderAudience()}
        </Card>
      </motion.div>
    </div>
  );
};

export default InstagramManagement;