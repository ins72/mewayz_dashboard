import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import InstagramService from '../../services/instagramService';
import { Video, Plus, Edit, Trash2, Play, Pause, Clock, Star } from 'lucide-react';

const StoryManager = ({ workspaceId }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (workspaceId) {
      fetchStories();
    }
  }, [workspaceId, filter]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const filterStatus = filter === 'all' ? null : filter;
      const response = await InstagramService.getStories(workspaceId, null, filterStatus);
      
      if (response.success) {
        setStories(response.stories?.data || response.data || []);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (storyData) => {
    try {
      const response = await InstagramService.createStory(storyData);
      if (response.success) {
        fetchStories();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating story:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'draft':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'expired':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStoryTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return Play;
      case 'carousel':
        return Video;
      default:
        return Video;
    }
  };

  const filterButtons = [
    { key: 'all', label: 'All Stories', count: stories.length },
    { key: 'scheduled', label: 'Scheduled', count: stories.filter(s => s.status === 'scheduled').length },
    { key: 'draft', label: 'Drafts', count: stories.filter(s => s.status === 'draft').length },
    { key: 'published', label: 'Published', count: stories.filter(s => s.status === 'published').length },
    { key: 'expired', label: 'Expired', count: stories.filter(s => s.status === 'expired').length }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading stories...</span>
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
              <Video className="h-5 w-5" />
              <span>Story Manager</span>
            </CardTitle>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Story
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterButtons.map(({ key, label, count }) => (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key)}
                className="flex items-center space-x-1"
              >
                <span>{label}</span>
                <Badge variant="secondary" className="ml-1">
                  {count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Stories Grid */}
          {stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stories.map((story) => {
                const StoryIcon = getStoryTypeIcon(story.story_type);
                return (
                  <Card key={story.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <StoryIcon className="h-4 w-4 text-purple-600" />
                          <Badge variant={getStatusColor(story.status)}>
                            {story.status}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          {story.is_highlight && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                          <Button variant="ghost" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {story.title || 'Untitled Story'}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {story.content}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {story.scheduled_at && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(story.scheduled_at).toLocaleString()}
                          </div>
                        )}

                        {story.highlight_category && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="h-3 w-3 mr-1" />
                            Highlight: {story.highlight_category}
                          </div>
                        )}

                        {story.stickers && story.stickers.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {story.stickers.map((sticker, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {sticker.type}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Stories Found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' 
                  ? 'You haven\'t created any stories yet.'
                  : `No stories found with status "${filter}".`
                }
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Story
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Story Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create New Story</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const storyData = {
                  workspace_id: workspaceId,
                  social_media_account_id: 'sample-account-id', // This would come from account selector
                  title: formData.get('title'),
                  content: formData.get('content'),
                  story_type: formData.get('story_type'),
                  status: formData.get('status'),
                  scheduled_at: formData.get('scheduled_at') || null,
                  is_highlight: formData.get('is_highlight') === 'on',
                  highlight_category: formData.get('highlight_category') || null,
                };
                handleCreateStory(storyData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Story Type
                    </label>
                    <select 
                      name="story_type"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="photo">Photo</option>
                      <option value="video">Video</option>
                      <option value="carousel">Carousel</option>
                      <option value="text">Text</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Story title..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      name="content"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows="3"
                      placeholder="Story content..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select 
                      name="status"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Schedule Date (optional)
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduled_at"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_highlight"
                      name="is_highlight"
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="is_highlight" className="text-sm font-medium text-gray-700">
                      Add to Highlights
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Highlight Category (optional)
                    </label>
                    <input
                      type="text"
                      name="highlight_category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Behind the Scenes, Tips, etc."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Create Story
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

export default StoryManager;