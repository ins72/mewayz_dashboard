import React, { useState, useEffect, useContext } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import TemplateMarketplaceService from '../services/templateMarketplaceService';
import CreatorTemplateGrid from '../components/marketplace/CreatorTemplateGrid';
import TemplateCreationForm from '../components/marketplace/TemplateCreationForm';
import CreatorDashboard from '../components/marketplace/CreatorDashboard';
import { Plus, FileText, Package, BarChart3, Settings, TrendingUp, DollarSign, Download, Star } from 'lucide-react';

const TemplateCreator = () => {
  const { user } = useContext(AuthContext);
  const { currentWorkspace } = useContext(WorkspaceContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [collections, setCollections] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    sort_by: 'newest'
  });

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchData();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if (currentWorkspace?.id && activeTab === 'templates') {
      fetchTemplates();
    }
  }, [currentWorkspace, activeTab, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, collectionsResponse] = await Promise.all([
        TemplateMarketplaceService.getCreatorDashboard({ workspace_id: currentWorkspace.id }),
        TemplateMarketplaceService.getCreatorCollections({ workspace_id: currentWorkspace.id })
      ]);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.dashboard);
      }

      if (collectionsResponse.success) {
        setCollections(collectionsResponse.collections?.data || []);
      }
    } catch (error) {
      console.error('Error fetching creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await TemplateMarketplaceService.getCreatorTemplates({
        workspace_id: currentWorkspace.id,
        ...filters
      });

      if (response.success) {
        setTemplates(response.templates?.data || []);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const handleTemplateCreate = async (templateData) => {
    try {
      const response = await TemplateMarketplaceService.createTemplate({
        workspace_id: currentWorkspace.id,
        ...templateData
      });

      if (response.success) {
        setShowCreateForm(false);
        fetchTemplates();
        fetchData(); // Refresh dashboard
        alert('Template created successfully!');
      } else {
        alert(response.message || 'Failed to create template');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    }
  };

  const handleTemplateUpdate = async (templateId, templateData) => {
    try {
      const response = await TemplateMarketplaceService.updateTemplate(templateId, templateData);

      if (response.success) {
        setEditingTemplate(null);
        fetchTemplates();
        fetchData();
        alert('Template updated successfully!');
      } else {
        alert(response.message || 'Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template. Please try again.');
    }
  };

  const handleTemplateDelete = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await TemplateMarketplaceService.deleteTemplate(templateId);

      if (response.success) {
        fetchTemplates();
        fetchData();
        alert('Template deleted successfully!');
      } else {
        alert(response.message || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    }
  };

  const handleTemplatePublish = async (templateId) => {
    try {
      const response = await TemplateMarketplaceService.publishTemplate(templateId);

      if (response.success) {
        fetchTemplates();
        fetchData();
        alert('Template submitted for approval!');
      } else {
        alert(response.message || 'Failed to publish template');
      }
    } catch (error) {
      console.error('Error publishing template:', error);
      alert('Failed to publish template. Please try again.');
    }
  };

  const tabItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Overview of your template performance'
    },
    {
      id: 'templates',
      label: 'Templates',
      icon: FileText,
      count: templates.length,
      description: 'Manage your templates'
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: Package,
      count: collections.length,
      description: 'Manage template collections'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      description: 'Detailed performance analytics'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Creator Dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Creator</h1>
              <p className="text-gray-600">Create and manage your template marketplace presence</p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {dashboardData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Templates</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.overview?.total_templates || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">${dashboardData.overview?.total_revenue?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Downloads</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.overview?.total_downloads || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Download className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Templates</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardData.overview?.active_templates || 0}</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Creator Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                {tabItems.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {tab.count !== undefined && (
                      <Badge variant="secondary" className="ml-1">
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Dashboard Overview</h3>
                  <p className="text-sm text-gray-600">Monitor your template performance and earnings</p>
                </div>
                <CreatorDashboard
                  dashboardData={dashboardData}
                  workspaceId={currentWorkspace?.id}
                />
              </TabsContent>

              <TabsContent value="templates" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">My Templates</h3>
                  <p className="text-sm text-gray-600">Create and manage your templates</p>
                </div>
                <CreatorTemplateGrid
                  templates={templates}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onTemplateEdit={setEditingTemplate}
                  onTemplateDelete={handleTemplateDelete}
                  onTemplatePublish={handleTemplatePublish}
                />
              </TabsContent>

              <TabsContent value="collections" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Template Collections</h3>
                  <p className="text-sm text-gray-600">Bundle your templates into collections</p>
                </div>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Collections Coming Soon</h3>
                  <p className="text-gray-600">Collection management will be available in a future update.</p>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Detailed Analytics</h3>
                  <p className="text-sm text-gray-600">In-depth performance metrics and insights</p>
                </div>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Analytics Coming Soon</h3>
                  <p className="text-gray-600">Detailed analytics dashboard will be available in a future update.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Template Creation Form Modal */}
        {showCreateForm && (
          <TemplateCreationForm
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            onSubmit={handleTemplateCreate}
            workspaceId={currentWorkspace?.id}
          />
        )}

        {/* Template Edit Form Modal */}
        {editingTemplate && (
          <TemplateCreationForm
            isOpen={!!editingTemplate}
            onClose={() => setEditingTemplate(null)}
            onSubmit={(data) => handleTemplateUpdate(editingTemplate.id, data)}
            workspaceId={currentWorkspace?.id}
            template={editingTemplate}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateCreator;