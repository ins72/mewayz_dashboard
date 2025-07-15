import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import InstagramService from '../../services/instagramService';
import { Clock, Calendar, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';

const OptimalPostingTimes = ({ workspaceId }) => {
  const [postingTimes, setPostingTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('');
  const [recommendations, setRecommendations] = useState({});

  useEffect(() => {
    if (workspaceId) {
      fetchOptimalPostingTimes();
    }
  }, [workspaceId]);

  const fetchOptimalPostingTimes = async () => {
    try {
      setLoading(true);
      const response = await InstagramService.getOptimalPostingTimes(workspaceId);
      
      if (response.success) {
        setPostingTimes(response.optimal_times || response.data?.optimal_times);
        setSource(response.source || response.data?.source);
        setRecommendations(response.recommendations || response.data?.recommendations || {});
      }
    } catch (error) {
      console.error('Error fetching optimal posting times:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  const getTimeColor = (time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour <= 10) return 'bg-green-100 text-green-800';
    if (hour >= 11 && hour <= 16) return 'bg-blue-100 text-blue-800';
    if (hour >= 17 && hour <= 21) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const getEngagementLevel = (day) => {
    if (recommendations.peak_engagement_day === day) return 'high';
    if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day)) return 'medium';
    return 'low';
  };

  const getEngagementBadge = (level) => {
    switch (level) {
      case 'high':
        return <Badge variant="success" className="text-xs">High Engagement</Badge>;
      case 'medium':
        return <Badge variant="info" className="text-xs">Medium Engagement</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Low Engagement</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading optimal posting times...</span>
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
              <Clock className="h-5 w-5" />
              <span>Optimal Posting Times</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={source === 'analytics' ? 'success' : 'info'}>
                {source === 'analytics' ? 'Analytics-Based' : 'Default Times'}
              </Badge>
              <Button 
                onClick={fetchOptimalPostingTimes}
                variant="outline"
                className="flex items-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            {source === 'analytics' 
              ? 'These times are based on your audience\'s engagement patterns'
              : 'These are industry-standard optimal posting times'
            }
          </p>
        </CardHeader>
      </Card>

      {/* Recommendations */}
      {Object.keys(recommendations).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Key Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Best Day</span>
                </div>
                <div className="text-lg font-bold text-blue-900 capitalize">
                  {recommendations.peak_engagement_day}
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Best Time</span>
                </div>
                <div className="text-lg font-bold text-green-900">
                  {formatTime(recommendations.best_overall_time)}
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Avoid</span>
                </div>
                <div className="text-sm text-red-900">
                  {recommendations.avoid_times?.join(', ') || 'Late night hours'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Posting Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          {postingTimes ? (
            <div className="space-y-4">
              {dayOrder.map((day) => {
                const times = postingTimes[day] || [];
                const engagementLevel = getEngagementLevel(day);
                
                return (
                  <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-20">
                        <div className="font-medium text-gray-900 capitalize">{day}</div>
                        {getEngagementBadge(engagementLevel)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {times.length > 0 ? (
                        times.map((time, index) => (
                          <Badge
                            key={index}
                            className={`${getTimeColor(time)} font-medium`}
                          >
                            {formatTime(time)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No optimal times available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Timing Data Available</h3>
              <p className="text-gray-600 mb-4">
                We need more data to provide personalized optimal posting times.
              </p>
              <Button onClick={fetchOptimalPostingTimes} className="bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Zone Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Time Zone Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Morning (6 AM - 10 AM)</h4>
              <p className="text-sm text-gray-600">
                Good for inspirational content, news, and daily motivation posts.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Afternoon (11 AM - 4 PM)</h4>
              <p className="text-sm text-gray-600">
                Peak hours for engagement, ideal for important announcements and promotions.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Evening (5 PM - 9 PM)</h4>
              <p className="text-sm text-gray-600">
                Great for behind-the-scenes content and casual engagement.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Night (10 PM - 5 AM)</h4>
              <p className="text-sm text-gray-600">
                Generally low engagement, avoid posting during these hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimalPostingTimes;