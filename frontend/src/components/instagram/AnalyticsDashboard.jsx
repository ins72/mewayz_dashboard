import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import InstagramService from '../../services/instagramService';
import { BarChart3, TrendingUp, Users, Eye, Heart, MessageCircle, Calendar } from 'lucide-react';

const AnalyticsDashboard = ({ workspaceId }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  useEffect(() => {
    if (workspaceId) {
      fetchAnalytics();
    }
  }, [workspaceId, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await InstagramService.getAnalyticsDashboard(workspaceId, null, period);
      
      if (response.success) {
        setAnalytics(response.analytics || response.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      case '1y': return 'Last Year';
      default: return 'Last 30 Days';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Analytics Dashboard</span>
            </CardTitle>
            <div className="flex space-x-2">
              {['7d', '30d', '90d', '1y'].map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  onClick={() => setPeriod(p)}
                  className="text-sm"
                >
                  {p === '7d' ? '7D' : p === '30d' ? '30D' : p === '90d' ? '90D' : '1Y'}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Analytics for {getPeriodLabel(period)}
          </p>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      {analytics?.overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Followers</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analytics.overview.followers)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Reach</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analytics.overview.total_reach)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Impressions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(analytics.overview.total_impressions)}
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Engagement</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.engagement_rate?.toFixed(1) || 0}%
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Growth Metrics */}
      {analytics?.growth_metrics && analytics.growth_metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Growth Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.growth_metrics.slice(0, 10).map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(metric.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span>{formatNumber(metric.followers)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-red-600" />
                      <span>{metric.engagement_rate?.toFixed(1) || 0}%</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4 text-green-600" />
                      <span>{formatNumber(metric.reach)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Best Posting Times */}
      {analytics?.best_posting_times && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Best Posting Times</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.best_posting_times).map(([day, times]) => (
                <div key={day} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 capitalize">{day}</h4>
                  <div className="space-y-1">
                    {times.map((time, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Hashtags */}
      {analytics?.top_hashtags && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Top Performing Hashtags</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.top_hashtags).map(([hashtag, count], index) => (
                <div key={hashtag} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </div>
                    <div className="font-medium text-blue-600">
                      {hashtag}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {count} posts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {!analytics && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
              <p className="text-gray-600 mb-4">
                Analytics data will appear here once you start posting and engaging with your audience.
              </p>
              <Button onClick={fetchAnalytics} className="bg-blue-600 hover:bg-blue-700">
                Refresh Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsDashboard;