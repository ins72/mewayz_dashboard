import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Mail, 
  Share2, 
  Zap, 
  Users, 
  Target, 
  BarChart3, 
  Calendar,
  Settings,
  Play,
  Pause,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  ExternalLink,
  Filter,
  Search,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import marketingService from '../services/marketingService';
import emailService from '../services/emailService';
import socialMediaService from '../services/socialMediaService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';

const MarketingHub = () => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [marketingAnalytics, setMarketingAnalytics] = useState({});
  const [emailCampaigns, setEmailCampaigns] = useState([]);
  const [automationWorkflows, setAutomationWorkflows] = useState([]);
  const [contentLibrary, setContentLibrary] = useState([]);
  const [leadMagnets, setLeadMagnets] = useState([]);
  const [socialCalendar, setSocialCalendar] = useState({});
  const [conversionFunnels, setConversionFunnels] = useState([]);
  const [leadScoring, setLeadScoring] = useState({});
  
  // UI states
  const [showCreateWorkflow, setShowCreateWorkflow] = useState(false);
  const [showCreateContent, setShowCreateContent] = useState(false);
  const [showCreateMagnet, setShowCreateMagnet] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (workspaceId) {
      loadMarketingData();
    }
  }, [workspaceId, selectedTimeRange]);

  const loadMarketingData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load marketing analytics
      const analyticsResponse = await marketingService.getMarketingAnalytics(workspaceId, selectedTimeRange);
      if (analyticsResponse.success) {
        setMarketingAnalytics(analyticsResponse.data);
      }

      // Load email campaigns
      const campaignsResponse = await marketingService.getEmailCampaigns(workspaceId);
      if (campaignsResponse.success) {
        setEmailCampaigns(campaignsResponse.data);
      }

      // Load automation workflows
      const automationResponse = await marketingService.getMarketingAutomation(workspaceId);
      if (automationResponse.success) {
        setAutomationWorkflows(automationResponse.data.workflows || []);
      }

      // Load content library
      const contentResponse = await marketingService.getContentLibrary(workspaceId);
      if (contentResponse.success) {
        setContentLibrary(contentResponse.data);
      }

      // Load lead magnets
      const magnetsResponse = await marketingService.getLeadMagnets(workspaceId);
      if (magnetsResponse.success) {
        setLeadMagnets(magnetsResponse.data);
      }

      // Load social calendar
      const calendarResponse = await marketingService.getSocialMediaCalendar(workspaceId, new Date().getMonth() + 1, new Date().getFullYear());
      if (calendarResponse.success) {
        setSocialCalendar(calendarResponse.data);
      }

      // Load conversion funnels
      const funnelsResponse = await marketingService.getConversionFunnels(workspaceId);
      if (funnelsResponse.success) {
        setConversionFunnels(funnelsResponse.data);
      }

      // Load lead scoring
      const scoringResponse = await marketingService.getLeadScoring(workspaceId);
      if (scoringResponse.success) {
        setLeadScoring(scoringResponse.data);
      }

    } catch (error) {
      setError('Failed to load marketing data');
      console.error('Error loading marketing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkflow = async (workflowData) => {
    try {
      const response = await marketingService.createAutomationWorkflow(workspaceId, workflowData);
      if (response.success) {
        setAutomationWorkflows([...automationWorkflows, response.data]);
        setShowCreateWorkflow(false);
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const handleCreateContent = async (contentData) => {
    try {
      const response = await marketingService.createContent(workspaceId, contentData);
      if (response.success) {
        setContentLibrary([...contentLibrary, response.data]);
        setShowCreateContent(false);
      }
    } catch (error) {
      console.error('Error creating content:', error);
    }
  };

  const handleCreateMagnet = async (magnetData) => {
    try {
      const response = await marketingService.createLeadMagnet(workspaceId, magnetData);
      if (response.success) {
        setLeadMagnets([...leadMagnets, response.data]);
        setShowCreateMagnet(false);
      }
    } catch (error) {
      console.error('Error creating lead magnet:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'draft': return 'text-blue-400';
      case 'completed': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4 text-green-400" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-400" />;
      case 'draft': return <Edit className="h-4 w-4 text-blue-400" />;
      case 'completed': return <Target className="h-4 w-4 text-purple-400" />;
      default: return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'campaigns', label: 'Campaigns', icon: Mail },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'content', label: 'Content', icon: Share2 },
    { id: 'leads', label: 'Lead Generation', icon: Users },
    { id: 'social', label: 'Social Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {formatNumber(marketingAnalytics.overview?.total_leads || 0)}
              </div>
              <div className="text-sm text-gray-400">Total Leads</div>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Users className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-400">
            +12.5% from last month
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {marketingAnalytics.overview?.conversion_rate || 0}%
              </div>
              <div className="text-sm text-gray-400">Conversion Rate</div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Target className="h-6 w-6 text-green-400" />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-400">
            +3.2% from last month
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-400">
                ${marketingAnalytics.overview?.cost_per_lead || 0}
              </div>
              <div className="text-sm text-gray-400">Cost per Lead</div>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-2 text-xs text-red-400">
            -8.3% from last month
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {marketingAnalytics.overview?.roi || 0}%
              </div>
              <div className="text-sm text-gray-400">ROI</div>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-400" />
            </div>
          </div>
          <div className="mt-2 text-xs text-green-400">
            +15.7% from last month
          </div>
        </Card>
      </div>

      {/* Channel Performance */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Channel Performance</h3>
          <p className="text-gray-400">Marketing channel effectiveness and ROI</p>
        </div>
        
        <div className="space-y-4">
          {marketingAnalytics.channels?.map((channel) => (
            <div key={channel.name} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <div className="font-medium text-white">{channel.name}</div>
                  <div className="text-sm text-gray-400">{channel.leads} leads</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">${channel.cost}</div>
                <div className={`text-sm ${channel.roi > 100 ? 'text-green-400' : 'text-red-400'}`}>
                  {channel.roi}% ROI
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Recent Activity</h3>
          <p className="text-gray-400">Latest marketing activities and results</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Mail className="h-4 w-4 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Email campaign "Welcome Series" completed</div>
              <div className="text-xs text-gray-400">2 hours ago • 1,250 emails sent</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Zap className="h-4 w-4 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">Automation workflow triggered 45 actions</div>
              <div className="text-xs text-gray-400">5 hours ago • Lead nurturing sequence</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-800/30 rounded-lg">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Share2 className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">New content published: "CRM Best Practices"</div>
              <div className="text-xs text-gray-400">1 day ago • 235 views</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderCampaigns = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Email Campaigns</h3>
          <p className="text-gray-400">Manage your email marketing campaigns</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {emailCampaigns.map((campaign) => (
          <Card key={campaign.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  {getStatusIcon(campaign.status)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-white">{campaign.name}</h4>
                    <span className={`capitalize text-sm ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{campaign.subject}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Sent</div>
                      <div className="font-semibold text-white">{campaign.sent.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Opened</div>
                      <div className="font-semibold text-white">{campaign.opened.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Clicked</div>
                      <div className="font-semibold text-white">{campaign.clicked.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Conversion</div>
                      <div className="font-semibold text-white">{campaign.conversion_rate}%</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
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

  const renderAutomation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Marketing Automation</h3>
          <p className="text-gray-400">Automated workflows and sequences</p>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowCreateWorkflow(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {automationWorkflows.map((workflow) => (
          <Card key={workflow.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{workflow.name}</h4>
                  <p className="text-sm text-gray-400">Trigger: {workflow.trigger}</p>
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
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Active Contacts</span>
                <span className="font-medium text-white">{workflow.active_contacts}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Conversion Rate</span>
                <span className="font-medium text-green-400">{workflow.conversion_rate}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Steps</span>
                <span className="font-medium text-white">{workflow.steps.length}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center space-x-2">
                {getStatusIcon(workflow.status)}
                <span className={`text-sm ${getStatusColor(workflow.status)}`}>
                  {workflow.status}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

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
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Marketing Data</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={loadMarketingData}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <TrendingUp className="h-8 w-8 mr-3 text-blue-400" />
          Marketing Hub
        </h1>
        <p className="text-gray-400">
          Comprehensive marketing management and automation platform
        </p>
      </motion.div>

      {/* Time Range Filter */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-1 bg-gray-800 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'campaigns' && renderCampaigns()}
        {activeTab === 'automation' && renderAutomation()}
        {activeTab === 'content' && (
          <div className="text-center py-12">
            <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Content Library</h3>
            <p className="text-gray-400">Content management features coming soon</p>
          </div>
        )}
        {activeTab === 'leads' && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Lead Generation</h3>
            <p className="text-gray-400">Lead magnet and capture features coming soon</p>
          </div>
        )}
        {activeTab === 'social' && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Social Media Calendar</h3>
            <p className="text-gray-400">Social media scheduling features coming soon</p>
          </div>
        )}
        {activeTab === 'analytics' && (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
            <p className="text-gray-400">Detailed analytics and reporting features coming soon</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MarketingHub;