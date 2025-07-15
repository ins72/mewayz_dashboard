import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/Input';
import InstagramService from '../../services/instagramService';
import { Hash, Search, TrendingUp, Target, Filter, Copy } from 'lucide-react';

const HashtagResearch = ({ workspaceId }) => {
  const [hashtags, setHashtags] = useState([]);
  const [trending, setTrending] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    trending: ''
  });
  const [stats, setStats] = useState({});

  useEffect(() => {
    if (workspaceId) {
      fetchHashtagData();
    }
  }, [workspaceId, filters]);

  const fetchHashtagData = async () => {
    try {
      setLoading(true);
      const response = await InstagramService.getHashtagResearch(workspaceId, {
        search: searchQuery,
        ...filters
      });
      
      if (response.success) {
        setHashtags(response.hashtags?.data || response.data || []);
        setTrending(response.trending || []);
        setCategories(response.categories || []);
        setStats(response.stats || {});
      }
    } catch (error) {
      console.error('Error fetching hashtag data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHashtagData();
  };

  const getDifficultyColor = (score) => {
    if (score <= 30) return 'success';
    if (score <= 60) return 'warning';
    if (score <= 80) return 'destructive';
    return 'destructive';
  };

  const getDifficultyLabel = (score) => {
    if (score <= 30) return 'Easy';
    if (score <= 60) return 'Medium';
    if (score <= 80) return 'Hard';
    return 'Very Hard';
  };

  const getPopularityLabel = (count) => {
    if (count < 10000) return 'Low';
    if (count < 100000) return 'Medium';
    if (count < 1000000) return 'High';
    return 'Very High';
  };

  const copyHashtag = (hashtag) => {
    navigator.clipboard.writeText(`#${hashtag}`);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading hashtag research...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Hash className="h-5 w-5" />
            <span>Hashtag Research</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search hashtags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="very_hard">Very Hard</option>
              </select>
              
              <select
                value={filters.trending}
                onChange={(e) => setFilters({...filters, trending: e.target.value})}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Hashtags</option>
                <option value="true">Trending Only</option>
                <option value="false">Non-Trending</option>
              </select>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Research Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total_hashtags || 0}</div>
              <div className="text-sm text-gray-600">Total Hashtags</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.trending_count || 0}</div>
              <div className="text-sm text-gray-600">Trending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.avg_engagement?.toFixed(1) || 0}%</div>
              <div className="text-sm text-gray-600">Avg Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Hashtags */}
      {trending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Trending Hashtags</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {trending.map((hashtag, index) => (
                <div key={index} className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <span className="font-medium text-green-800">#{hashtag.hashtag}</span>
                  <Badge variant="success" className="text-xs">
                    {hashtag.trending_score}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyHashtag(hashtag.hashtag)}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hashtag Results */}
      <Card>
        <CardHeader>
          <CardTitle>Hashtag Results</CardTitle>
        </CardHeader>
        <CardContent>
          {hashtags.length > 0 ? (
            <div className="space-y-4">
              {hashtags.map((hashtag) => (
                <div key={hashtag.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Hash className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-lg text-blue-600">
                          {hashtag.hashtag}
                        </span>
                      </div>
                      {hashtag.is_trending && (
                        <Badge variant="success" className="text-xs">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyHashtag(hashtag.hashtag)}
                      className="flex items-center space-x-1"
                    >
                      <Copy className="h-3 w-3" />
                      <span className="text-xs">Copy</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-gray-600">Posts</div>
                      <div className="font-medium">{formatNumber(hashtag.post_count)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Engagement</div>
                      <div className="font-medium">{hashtag.engagement_rate?.toFixed(1) || 0}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Difficulty</div>
                      <Badge variant={getDifficultyColor(hashtag.difficulty_score)}>
                        {getDifficultyLabel(hashtag.difficulty_score)}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Popularity</div>
                      <div className="font-medium">{getPopularityLabel(hashtag.post_count)}</div>
                    </div>
                  </div>

                  {hashtag.category && (
                    <div className="mb-3">
                      <Badge variant="outline">{hashtag.category}</Badge>
                    </div>
                  )}

                  {hashtag.related_hashtags && hashtag.related_hashtags.length > 0 && (
                    <div>
                      <div className="text-sm text-gray-600 mb-2">Related Hashtags:</div>
                      <div className="flex flex-wrap gap-1">
                        {hashtag.related_hashtags.map((related, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            #{related}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Hashtags Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? `No hashtags found for "${searchQuery}".`
                  : 'Search for hashtags to see results and analytics.'
                }
              </p>
              <Button onClick={() => {
                setSearchQuery('marketing');
                fetchHashtagData();
              }} className="bg-blue-600 hover:bg-blue-700">
                <Search className="h-4 w-4 mr-2" />
                Try Example Search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HashtagResearch;