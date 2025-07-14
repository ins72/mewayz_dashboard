import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Users, 
  BarChart3, 
  Calendar,
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Settings,
  TrendingUp,
  MousePointer,
  Target,
  Zap,
  Image,
  Type,
  Palette,
  Layout
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Card } from '../ui/Card';

const EmailCampaignBuilder = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    subject: '',
    sender: '',
    template: 'newsletter',
    audience: 'all'
  });

  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [emailStats, setEmailStats] = useState({
    totalSent: 0,
    totalDelivered: 0,
    totalOpened: 0,
    totalClicked: 0,
    openRate: 0,
    clickRate: 0
  });

  // Mock data - in production, this would come from ElasticMail API
  useEffect(() => {
    setEmailStats({
      totalSent: 12845,
      totalDelivered: 12678,
      totalOpened: 8234,
      totalClicked: 1456,
      openRate: 64.9,
      clickRate: 11.5
    });

    setCampaigns([
      {
        id: 1,
        subject: 'Welcome to Mewayz! 🎉',
        sender: 'hello@mewayz.com',
        status: 'sent',
        sent: 1247,
        delivered: 1232,
        opened: 823,
        clicked: 145,
        created: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        subject: 'New Features Release - January 2024',
        sender: 'updates@mewayz.com',
        status: 'sent',
        sent: 2156,
        delivered: 2089,
        opened: 1367,
        clicked: 234,
        created: '2024-01-10T14:20:00Z'
      },
      {
        id: 3,
        subject: 'Monthly Newsletter - Digital Marketing Tips',
        sender: 'newsletter@mewayz.com',
        status: 'draft',
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        created: '2024-01-16T09:00:00Z'
      }
    ]);

    setTemplates([
      {
        id: 1,
        name: 'Newsletter',
        description: 'Monthly newsletter template',
        thumbnail: '/api/placeholder/200/150',
        category: 'newsletter'
      },
      {
        id: 2,
        name: 'Welcome Series',
        description: 'Welcome new subscribers',
        thumbnail: '/api/placeholder/200/150',
        category: 'welcome'
      },
      {
        id: 3,
        name: 'Product Launch',
        description: 'Announce new products',
        thumbnail: '/api/placeholder/200/150',
        category: 'announcement'
      },
      {
        id: 4,
        name: 'Promotional',
        description: 'Sales and promotions',
        thumbnail: '/api/placeholder/200/150',
        category: 'promotion'
      }
    ]);

    setAudiences([
      {
        id: 1,
        name: 'All Subscribers',
        count: 15678,
        description: 'All active subscribers'
      },
      {
        id: 2,
        name: 'Pro Users',
        count: 3456,
        description: 'Users with Pro subscription'
      },
      {
        id: 3,
        name: 'New Signups',
        count: 892,
        description: 'Users who signed up in last 30 days'
      },
      {
        id: 4,
        name: 'Inactive Users',
        count: 1234,
        description: 'Users who haven\'t logged in for 30+ days'
      }
    ]);
  }, []);

  const handleCreateCampaign = () => {
    console.log('Creating campaign:', newCampaign);
    setShowCreateCampaign(false);
    setNewCampaign({
      subject: '',
      sender: '',
      template: 'newsletter',
      audience: 'all'
    });
  };

  const handleDeleteCampaign = (campaignId) => {
    setCampaigns(campaigns.filter(c => c.id !== campaignId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'text-green-400';
      case 'draft':
        return 'text-yellow-400';
      case 'scheduled':
        return 'text-blue-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <Send className="h-4 w-4 text-green-400" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-yellow-400" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-400" />;
      case 'failed':
        return <Zap className="h-4 w-4 text-red-400" />;
      default:
        return <Mail className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateRate = (numerator, denominator) => {
    if (denominator === 0) return 0;
    return ((numerator / denominator) * 100).toFixed(1);
  };

  const tabs = [
    { id: 'campaigns', label: 'Campaigns', icon: Mail },
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'audiences', label: 'Audiences', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderCampaigns = () => (
    <div className="space-y-6">
      {/* Create Campaign Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Email Campaigns</h3>
          <p className="text-gray-400">Create and manage your email marketing campaigns</p>
        </div>
        <Button
          onClick={() => setShowCreateCampaign(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <Card className="p-6 border-blue-500/30">
          <h4 className="text-lg font-semibold text-white mb-4">Create New Campaign</h4>
          <div className="space-y-4">
            <Input
              label="Campaign Subject"
              value={newCampaign.subject}
              onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
              placeholder="Enter email subject"
              required
            />
            <Input
              label="Sender Email"
              value={newCampaign.sender}
              onChange={(e) => setNewCampaign({ ...newCampaign, sender: e.target.value })}
              placeholder="hello@mewayz.com"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Template
                </label>
                <select
                  value={newCampaign.template}
                  onChange={(e) => setNewCampaign({ ...newCampaign, template: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="newsletter">Newsletter</option>
                  <option value="welcome">Welcome Series</option>
                  <option value="announcement">Product Launch</option>
                  <option value="promotion">Promotional</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Audience
                </label>
                <select
                  value={newCampaign.audience}
                  onChange={(e) => setNewCampaign({ ...newCampaign, audience: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="all">All Subscribers</option>
                  <option value="pro">Pro Users</option>
                  <option value="new">New Signups</option>
                  <option value="inactive">Inactive Users</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button onClick={handleCreateCampaign} className="bg-blue-600 hover:bg-blue-700">
                Create Campaign
              </Button>
              <Button variant="outline" onClick={() => setShowCreateCampaign(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Campaigns List */}
      <div className="grid grid-cols-1 gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  {getStatusIcon(campaign.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-white">{campaign.subject}</h4>
                    <span className={`capitalize text-sm ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{campaign.sender}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Sent</div>
                      <div className="font-semibold text-white">{campaign.sent.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Delivered</div>
                      <div className="font-semibold text-white">{campaign.delivered.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Opened</div>
                      <div className="font-semibold text-white">
                        {campaign.opened.toLocaleString()} ({calculateRate(campaign.opened, campaign.delivered)}%)
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400">Clicked</div>
                      <div className="font-semibold text-white">
                        {campaign.clicked.toLocaleString()} ({calculateRate(campaign.clicked, campaign.delivered)}%)
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-3">
                    Created: {formatDate(campaign.created)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteCampaign(campaign.id)}
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

  const renderTemplates = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Email Templates</h3>
          <p className="text-gray-400">Pre-designed templates for your campaigns</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-700 flex items-center justify-center">
              <Layout className="h-12 w-12 text-gray-500" />
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-white mb-2">{template.name}</h4>
              <p className="text-sm text-gray-400 mb-4">{template.description}</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button size="sm" className="flex-1">
                  Use Template
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAudiences = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Audiences</h3>
          <p className="text-gray-400">Manage your subscriber lists and segments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Audience
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {audiences.map((audience) => (
          <Card key={audience.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Users className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{audience.name}</h4>
                  <p className="text-sm text-gray-400 mb-2">{audience.description}</p>
                  <div className="text-lg font-bold text-purple-400">
                    {audience.count.toLocaleString()} subscribers
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Email Analytics</h3>
        <p className="text-gray-400">Track your email campaign performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {emailStats.totalSent.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Sent</div>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Send className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {emailStats.totalDelivered.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Delivered</div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Target className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {emailStats.openRate}%
              </div>
              <div className="text-sm text-gray-400">Open Rate</div>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Eye className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {emailStats.totalOpened.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Opened</div>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Mail className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {emailStats.clickRate}%
              </div>
              <div className="text-sm text-gray-400">Click Rate</div>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <MousePointer className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-indigo-400">
                {emailStats.totalClicked.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Clicked</div>
            </div>
            <div className="p-3 bg-indigo-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Campaign Performance */}
      <Card>
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-2">Recent Campaign Performance</h4>
          <p className="text-gray-400">Performance overview of your latest campaigns</p>
        </div>
        
        <div className="space-y-4">
          {campaigns.filter(c => c.status === 'sent').map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div>
                <div className="font-medium text-white">{campaign.subject}</div>
                <div className="text-sm text-gray-400">{formatDate(campaign.created)}</div>
              </div>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-white">{campaign.sent.toLocaleString()}</div>
                  <div className="text-gray-400">Sent</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-400">
                    {calculateRate(campaign.delivered, campaign.sent)}%
                  </div>
                  <div className="text-gray-400">Delivered</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-400">
                    {calculateRate(campaign.opened, campaign.delivered)}%
                  </div>
                  <div className="text-gray-400">Opened</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-400">
                    {calculateRate(campaign.clicked, campaign.delivered)}%
                  </div>
                  <div className="text-gray-400">Clicked</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <Mail className="h-8 w-8 mr-3 text-blue-400" />
          Email Campaign Builder
        </h1>
        <p className="text-gray-400">
          Create, send, and track email campaigns to grow your business
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
        {activeTab === 'campaigns' && renderCampaigns()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'audiences' && renderAudiences()}
        {activeTab === 'analytics' && renderAnalytics()}
      </motion.div>
    </div>
  );
};

export default EmailCampaignBuilder;