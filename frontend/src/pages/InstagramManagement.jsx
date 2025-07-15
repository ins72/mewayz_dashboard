import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import InstagramService from '../services/instagramService';
import ContentCalendar from '../components/instagram/ContentCalendar';
import StoryManager from '../components/instagram/StoryManager';
import HashtagResearch from '../components/instagram/HashtagResearch';
import AnalyticsDashboard from '../components/instagram/AnalyticsDashboard';
import CompetitorAnalysis from '../components/instagram/CompetitorAnalysis';
import OptimalPostingTimes from '../components/instagram/OptimalPostingTimes';
import { Calendar, Video, Hash, BarChart3, Users, Clock } from 'lucide-react';

const InstagramManagement = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('calendar');
  const [loading, setLoading] = useState(true);
  const [accountInfo, setAccountInfo] = useState(null);
  const [quickStats, setQuickStats] = useState({
    totalPosts: 0,
    totalStories: 0,
    engagement: 0,
    followers: 0
  });

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchAccountInfo();
      fetchQuickStats();
    }
  }, [currentWorkspace]);

  const fetchAccountInfo = async () => {
    try {
      const response = await InstagramService.getAccountInfo(currentWorkspace.id);
      if (response.success) {
        setAccountInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching account info:', error);
    }
  };

  const fetchQuickStats = async () => {
    try {
      const [analyticsResponse, calendarResponse] = await Promise.all([
        InstagramService.getAnalyticsDashboard(currentWorkspace.id),
        InstagramService.getContentCalendar(currentWorkspace.id)
      ]);

      if (analyticsResponse.success) {
        const analytics = analyticsResponse.analytics || analyticsResponse.data;
        setQuickStats({
          totalPosts: analytics.overview?.posts || 0,
          totalStories: calendarResponse.calendar?.stories?.length || 0,
          engagement: analytics.overview?.engagement_rate || 0,
          followers: analytics.overview?.followers || 0
        });
      }
    } catch (error) {
      console.error('Error fetching quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      id: 'calendar',
      label: 'Content Calendar',
      icon: Calendar,
      component: ContentCalendar,
      description: 'Plan and schedule your Instagram content'
    },
    {
      id: 'stories',
      label: 'Stories',
      icon: Video,
      component: StoryManager,
      description: 'Manage Instagram Stories and highlights'
    },
    {
      id: 'hashtags',
      label: 'Hashtag Research',
      icon: Hash,
      component: HashtagResearch,
      description: 'Research and analyze hashtags'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: AnalyticsDashboard,
      description: 'Track your Instagram performance'
    },
    {
      id: 'competitors',
      label: 'Competitors',
      icon: Users,
      component: CompetitorAnalysis,
      description: 'Analyze competitor performance'
    },
    {
      id: 'timing',
      label: 'Optimal Times',
      icon: Clock,
      component: OptimalPostingTimes,
      description: 'Find the best times to post'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Instagram Management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Instagram Management</h1>
              <p className="text-gray-600">Manage your Instagram content, analytics, and growth strategy</p>
            </div>
            {accountInfo && (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">@{accountInfo.username}</p>
                  <p className="text-sm text-gray-500">{accountInfo.displayName}</p>
                </div>
                <img 
                  src={accountInfo.profilePicture} 
                  alt="Profile" 
                  className="w-12 h-12 rounded-full"
                />
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Posts</p>
                  <p className="text-2xl font-bold text-gray-900">{quickStats.totalPosts}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Stories</p>
                  <p className="text-2xl font-bold text-gray-900">{quickStats.totalStories}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Video className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Engagement</p>
                  <p className="text-2xl font-bold text-gray-900">{quickStats.engagement.toFixed(1)}%</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Followers</p>
                  <p className="text-2xl font-bold text-gray-900">{quickStats.followers.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Instagram Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                {tabItems.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {tabItems.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{tab.label}</h3>
                    <p className="text-sm text-gray-600">{tab.description}</p>
                  </div>
                  <tab.component workspaceId={currentWorkspace?.id} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InstagramManagement;