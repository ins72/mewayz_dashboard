import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/Input';
import InstagramService from '../../services/instagramService';
import { Users, Plus, TrendingUp, Hash, Calendar, Target, Search, UserPlus } from 'lucide-react';

const CompetitorAnalysis = ({ workspaceId }) => {
  const [competitors, setCompetitors] = useState([]);
  const [insights, setInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [platform, setPlatform] = useState('instagram');

  useEffect(() => {
    if (workspaceId) {
      fetchCompetitorAnalysis();
    }
  }, [workspaceId, platform]);

  const fetchCompetitorAnalysis = async () => {
    try {
      setLoading(true);
      const response = await InstagramService.getCompetitorAnalysis(workspaceId, platform);
      
      if (response.success) {
        setCompetitors(response.competitors || response.data || []);
        setInsights(response.insights || {});
      }
    } catch (error) {
      console.error('Error fetching competitor analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = async (competitorData) => {
    try {
      const response = await InstagramService.addCompetitor({
        workspace_id: workspaceId,
        platform,
        ...competitorData
      });
      
      if (response.success) {
        fetchCompetitorAnalysis();
        setShowAddModal(false);
      }
    } catch (error) {
      console.error('Error adding competitor:', error);
    }
  };

  const getEngagementColor = (rate) => {
    if (rate >= 5) return 'success';
    if (rate >= 3) return 'warning';
    if (rate >= 1) return 'info';
    return 'destructive';
  };

  const getTrackingStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'inactive':
        return 'secondary';
      default:
        return 'secondary';
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

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading competitor analysis...</span>
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
              <Users className="h-5 w-5" />
              <span>Competitor Analysis</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
              </select>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Competitor
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Insights */}
      {Object.keys(insights).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Market Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{insights.total_competitors || 0}</div>
                <div className="text-sm text-gray-600">Total Competitors</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{insights.avg_engagement_rate?.toFixed(1) || 0}%</div>
                <div className="text-sm text-gray-600">Avg Engagement</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{formatNumber(insights.avg_followers)}</div>
                <div className="text-sm text-gray-600">Avg Followers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Competitors List */}
      <Card>
        <CardHeader>
          <CardTitle>Competitors</CardTitle>
        </CardHeader>
        <CardContent>
          {competitors.length > 0 ? (
            <div className="space-y-4">
              {competitors.map((competitor) => (
                <div key={competitor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {competitor.competitor_name || competitor.competitor_username}
                        </h3>
                        <p className="text-sm text-gray-600">{competitor.competitor_username}</p>
                      </div>
                    </div>
                    <Badge variant={getTrackingStatusColor(competitor.tracking_status)}>
                      {competitor.tracking_status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Followers</div>
                      <div className="font-medium">{formatNumber(competitor.follower_count)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Following</div>
                      <div className="font-medium">{formatNumber(competitor.following_count)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Posts</div>
                      <div className="font-medium">{formatNumber(competitor.posts_count)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Engagement</div>
                      <Badge variant={getEngagementColor(competitor.engagement_rate)}>
                        {competitor.engagement_rate?.toFixed(1) || 0}%
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Content Themes</div>
                      <div className="flex flex-wrap gap-1">
                        {competitor.content_themes?.map((theme, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {theme}
                          </Badge>
                        )) || <span className="text-xs text-gray-500">No themes data</span>}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Top Hashtags</div>
                      <div className="flex flex-wrap gap-1">
                        {competitor.hashtag_usage ? 
                          Object.entries(competitor.hashtag_usage).slice(0, 3).map(([hashtag, count]) => (
                            <Badge key={hashtag} variant="outline" className="text-xs">
                              {hashtag} ({count})
                            </Badge>
                          )) : <span className="text-xs text-gray-500">No hashtag data</span>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Posts {competitor.posting_frequency?.toFixed(1) || 0}/day</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4" />
                        <span>Growth {competitor.growth_rate?.toFixed(1) || 0}%</span>
                      </div>
                    </div>
                    <div className="text-xs">
                      Last analyzed: {new Date(competitor.last_analyzed).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Competitors Added</h3>
              <p className="text-gray-600 mb-4">
                Start tracking your competitors to get insights into their performance and strategy.
              </p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Competitor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Competitor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Competitor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const competitorData = {
                  competitor_username: formData.get('competitor_username'),
                  competitor_name: formData.get('competitor_name'),
                  follower_count: parseInt(formData.get('follower_count')) || 0,
                  following_count: parseInt(formData.get('following_count')) || 0,
                  posts_count: parseInt(formData.get('posts_count')) || 0,
                  engagement_rate: parseFloat(formData.get('engagement_rate')) || 0,
                  tracking_status: 'active'
                };
                handleAddCompetitor(competitorData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username *
                    </label>
                    <Input
                      name="competitor_username"
                      type="text"
                      placeholder="@competitor_username"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name
                    </label>
                    <Input
                      name="competitor_name"
                      type="text"
                      placeholder="Competitor Name"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Followers
                      </label>
                      <Input
                        name="follower_count"
                        type="number"
                        placeholder="10000"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Following
                      </label>
                      <Input
                        name="following_count"
                        type="number"
                        placeholder="1000"
                        min="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Posts
                      </label>
                      <Input
                        name="posts_count"
                        type="number"
                        placeholder="500"
                        min="0"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Engagement Rate (%)
                      </label>
                      <Input
                        name="engagement_rate"
                        type="number"
                        step="0.1"
                        placeholder="3.5"
                        min="0"
                        max="100"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Competitor
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CompetitorAnalysis;