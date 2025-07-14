import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Link, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy, 
  BarChart3, 
  ExternalLink,
  Image,
  Palette,
  Settings,
  Share2,
  TrendingUp,
  Clock,
  MousePointer
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card } from '../ui/Card';

const LinkInBioBuilder = () => {
  const [activeTab, setActiveTab] = useState('links');
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({
    title: '',
    url: '',
    description: '',
    icon: 'link'
  });

  const bioPage = {
    title: 'John Doe',
    description: 'Digital Marketing Expert & Content Creator',
    profileImage: '/api/placeholder/150/150',
    theme: 'dark',
    primaryColor: '#3b82f6',
    backgroundImage: null
  };

  const links = [
    {
      id: 1,
      title: 'Latest Blog Post',
      url: 'https://example.com/blog',
      description: 'Check out my latest article on digital marketing',
      icon: 'link',
      clicks: 245,
      isActive: true
    },
    {
      id: 2,
      title: 'My Course',
      url: 'https://example.com/course',
      description: 'Learn digital marketing from scratch',
      icon: 'course',
      clicks: 189,
      isActive: true
    },
    {
      id: 3,
      title: 'Contact Me',
      url: 'mailto:john@example.com',
      description: 'Get in touch for collaborations',
      icon: 'email',
      clicks: 67,
      isActive: true
    },
    {
      id: 4,
      title: 'YouTube Channel',
      url: 'https://youtube.com/channel',
      description: 'Subscribe to my YouTube channel',
      icon: 'youtube',
      clicks: 123,
      isActive: false
    }
  ];

  const analytics = {
    totalClicks: 624,
    totalLinks: 4,
    activeLinks: 3,
    topPerformer: 'Latest Blog Post',
    clicksThisWeek: 89,
    conversionRate: 12.5
  };

  const handleAddLink = () => {
    console.log('Adding link:', newLink);
    setShowAddLink(false);
    setNewLink({ title: '', url: '', description: '', icon: 'link' });
  };

  const handleDeleteLink = (linkId) => {
    console.log('Deleting link:', linkId);
  };

  const handleCopyBioLink = () => {
    navigator.clipboard.writeText('https://mewayz.com/bio/johndoe');
    console.log('Bio link copied to clipboard');
  };

  const tabs = [
    { id: 'links', label: 'Links', icon: Link },
    { id: 'customize', label: 'Customize', icon: Palette },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderLinks = () => (
    <div className="space-y-6">
      {/* Add Link Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Your Links</h3>
          <p className="text-gray-400">Manage your bio page links</p>
        </div>
        <Button
          onClick={() => setShowAddLink(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Link
        </Button>
      </div>

      {/* Add Link Modal */}
      {showAddLink && (
        <Card className="p-6 border-blue-500/30">
          <h4 className="text-lg font-semibold text-white mb-4">Add New Link</h4>
          <div className="space-y-4">
            <Input
              label="Title"
              value={newLink.title}
              onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              placeholder="Link title"
              required
            />
            <Input
              label="URL"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://example.com"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Description
              </label>
              <textarea
                value={newLink.description}
                onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                placeholder="Brief description of the link"
                rows={3}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleAddLink} className="bg-blue-600 hover:bg-blue-700">
                Add Link
              </Button>
              <Button variant="outline" onClick={() => setShowAddLink(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Links List */}
      <div className="space-y-4">
        {links.map((link) => (
          <Card key={link.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Link className="h-6 w-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-white">{link.title}</h4>
                    {!link.isActive && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{link.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <MousePointer className="h-4 w-4" />
                      <span>{link.clicks} clicks</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ExternalLink className="h-4 w-4" />
                      <span className="truncate max-w-xs">{link.url}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteLink(link.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCustomize = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Customize Your Bio Page</h3>
        <p className="text-gray-400 mb-6">Personalize your bio page to match your brand</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customization Form */}
        <div className="space-y-6">
          <Input
            label="Page Title"
            value={bioPage.title}
            placeholder="Your Name"
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Description
            </label>
            <textarea
              value={bioPage.description}
              placeholder="Tell visitors about yourself"
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Profile Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <Image className="h-6 w-6 text-gray-400" />
              </div>
              <Button variant="outline" size="sm">
                Upload Image
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Primary Color
            </label>
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg border border-gray-600"
                style={{ backgroundColor: bioPage.primaryColor }}
              />
              <Input
                value={bioPage.primaryColor}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-4">Preview</h4>
          <div className="bg-gray-900 rounded-lg p-6 max-w-sm mx-auto">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Image className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{bioPage.title}</h3>
              <p className="text-gray-400 text-sm">{bioPage.description}</p>
            </div>
            
            <div className="space-y-3">
              {links.slice(0, 3).map((link) => (
                <div
                  key={link.id}
                  className="p-3 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
                  style={{ borderColor: bioPage.primaryColor + '40' }}
                >
                  <div className="text-white font-medium text-sm">{link.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{analytics.totalClicks}</div>
            <div className="text-sm text-gray-400">Total Clicks</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{analytics.clicksThisWeek}</div>
            <div className="text-sm text-gray-400">This Week</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{analytics.conversionRate}%</div>
            <div className="text-sm text-gray-400">Conversion Rate</div>
          </div>
        </Card>
      </div>

      {/* Top Performing Links */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Link Performance</h3>
        <div className="space-y-3">
          {links.map((link) => (
            <Card key={link.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Link className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{link.title}</div>
                    <div className="text-sm text-gray-400 truncate max-w-xs">{link.url}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-white">{link.clicks}</div>
                  <div className="text-sm text-gray-400">clicks</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Bio Page Settings</h3>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Bio Page URL
            </label>
            <div className="flex items-center space-x-2">
              <Input
                value="https://mewayz.com/bio/johndoe"
                readOnly
                className="flex-1"
              />
              <Button
                onClick={handleCopyBioLink}
                variant="outline"
                className="px-4"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Page Visibility</div>
              <div className="text-sm text-gray-400">Make your bio page public or private</div>
            </div>
            <Button variant="outline" className="px-6">
              Public
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">Analytics Tracking</div>
              <div className="text-sm text-gray-400">Track clicks and visitor data</div>
            </div>
            <Button variant="outline" className="px-6">
              Enabled
            </Button>
          </div>
        </div>
      </Card>
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
          <Link className="h-8 w-8 mr-3 text-blue-400" />
          Link in Bio Builder
        </h1>
        <p className="text-gray-400">
          Create a beautiful bio page with all your important links
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
          {activeTab === 'links' && renderLinks()}
          {activeTab === 'customize' && renderCustomize()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'settings' && renderSettings()}
        </Card>
      </motion.div>
    </div>
  );
};

export default LinkInBioBuilder;