import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Image, 
  Video, 
  Hash, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Share, 
  Eye,
  Plus,
  Edit,
  Trash2,
  Upload,
  Clock,
  MapPin,
  BarChart3,
  Target
} from 'lucide-react';

import instagramService from '../../services/instagramService';

const InstagramManagement = ({ workspaceId }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [accountInfo, setAccountInfo] = useState(null);
  const [scheduledPosts, setScheduledPosts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);

  useEffect(() => {
    loadInstagramData();
  }, [workspaceId]);

  const loadInstagramData = async () => {
    try {
      setLoading(true);
      
      const [accountResponse, postsResponse, analyticsResponse] = await Promise.all([
        instagramService.getAccountInfo(workspaceId),
        instagramService.getScheduledPosts(workspaceId),
        instagramService.getAnalytics(workspaceId)
      ]);

      setAccountInfo(accountResponse.data);
      setScheduledPosts(postsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error('Error loading Instagram data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Instagram Management</h1>
          <p className="text-gray-400 mt-1">Manage your Instagram presence and grow your audience</p>
        </div>
        <button
          onClick={() => setShowPostModal(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create Post</span>
        </button>
      </div>

      {/* Account Overview */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <Image className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">@{accountInfo?.username}</h2>
            <p className="text-gray-400">{accountInfo?.displayName}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${
            accountInfo?.isConnected 
              ? 'bg-green-900/30 text-green-400' 
              : 'bg-red-900/30 text-red-400'
          }`}>
            {accountInfo?.isConnected ? 'Connected' : 'Disconnected'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{formatNumber(accountInfo?.followers || 0)}</div>
            <div className="text-sm text-gray-400">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{formatNumber(accountInfo?.following || 0)}</div>
            <div className="text-sm text-gray-400">Following</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{formatNumber(accountInfo?.posts || 0)}</div>
            <div className="text-sm text-gray-400">Posts</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-900/50 rounded-lg p-1">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'posts', label: 'Posts', icon: Image },
          { id: 'calendar', label: 'Calendar', icon: Calendar },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'hashtags', label: 'Hashtags', icon: Hash }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Reach</p>
                    <p className="text-2xl font-bold text-white">{formatNumber(analytics?.overview?.reach || 0)}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Eye className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Engagement Rate</p>
                    <p className="text-2xl font-bold text-white">{analytics?.engagement?.engagementRate || 0}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Heart className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">New Followers</p>
                    <p className="text-2xl font-bold text-white">+{analytics?.overview?.followersGain || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Posts</p>
                    <p className="text-2xl font-bold text-white">{analytics?.overview?.totalPosts || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center">
                    <Image className="w-6 h-6 text-pink-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Posts */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Top Performing Posts</h3>
              <div className="space-y-4">
                {analytics?.topPosts?.map((post) => (
                  <div key={post.id} className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                    <img 
                      src={post.media} 
                      alt="Post" 
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-white font-medium">{post.caption}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-gray-400">{formatNumber(post.likes)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-gray-400">{formatNumber(post.comments)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Share className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-400">{formatNumber(post.shares)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">{post.engagement}%</div>
                      <div className="text-sm text-gray-400">Engagement</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Scheduled Posts</h3>
              <div className="text-sm text-gray-400">
                {scheduledPosts?.length || 0} posts scheduled
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledPosts?.map((post) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4"
                >
                  <div className="aspect-square bg-gray-700 rounded-lg mb-4 overflow-hidden">
                    {post.media?.[0] && (
                      <img 
                        src={post.media[0].url} 
                        alt="Post preview" 
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-white text-sm line-clamp-3">{post.caption}</p>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(post.scheduledTime).toLocaleString()}</span>
                    </div>
                    
                    {post.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{post.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className={`px-2 py-1 rounded-full text-xs ${
                        post.status === 'scheduled' 
                          ? 'bg-blue-900/30 text-blue-400'
                          : 'bg-green-900/30 text-green-400'
                      }`}>
                        {post.status}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button className="text-gray-400 hover:text-white">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Metrics */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Engagement Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Likes Growth</span>
                    <span className="text-green-400">+{analytics?.engagement?.likesGrowth || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Comments Growth</span>
                    <span className="text-green-400">+{analytics?.engagement?.commentsGrowth || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Shares Growth</span>
                    <span className="text-green-400">+{analytics?.engagement?.sharesGrowth || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Best Posting Time</span>
                    <span className="text-blue-400">{analytics?.engagement?.bestPostingTime || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Best Posting Day</span>
                    <span className="text-blue-400">{analytics?.engagement?.bestPostingDay || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Demographics */}
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Audience Demographics</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Age Groups</h4>
                    {analytics?.demographics?.ageGroups?.map((group) => (
                      <div key={group.range} className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">{group.range}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${group.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-white">{group.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-300 mb-2">Top Locations</h4>
                    {analytics?.demographics?.topLocations?.slice(0, 3).map((location) => (
                      <div key={location.city} className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">{location.city}</span>
                        <span className="text-sm text-white">{location.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramManagement;