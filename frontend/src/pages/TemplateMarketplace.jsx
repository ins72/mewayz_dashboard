import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import TemplateMarketplaceService from '../services/templateMarketplaceService';
import TemplateGrid from '../components/marketplace/TemplateGrid';
import TemplateFilters from '../components/marketplace/TemplateFilters';
import CollectionGrid from '../components/marketplace/CollectionGrid';
import UserTemplateLibrary from '../components/marketplace/UserTemplateLibrary';
import TemplateDetails from '../components/marketplace/TemplateDetails';
import { Store, Search, Filter, Grid, List, Star, Download, ShoppingCart } from 'lucide-react';

const TemplateMarketplace = () => {
  const { user } = useAuth();
  const { currentWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState('templates');
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [collections, setCollections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userPurchases, setUserPurchases] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDetails, setShowTemplateDetails] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    price_range: '',
    sort_by: 'popular',
    is_free: null,
    is_premium: null
  });
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchInitialData();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    if (currentWorkspace?.id) {
      fetchTemplates();
    }
  }, [currentWorkspace, filters]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesResponse, collectionsResponse, purchasesResponse] = await Promise.all([
        TemplateMarketplaceService.getTemplateCategories(),
        TemplateMarketplaceService.getTemplateCollections({ featured: true }),
        TemplateMarketplaceService.getUserPurchases({ workspace_id: currentWorkspace.id })
      ]);

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.categories);
      }

      if (collectionsResponse.success) {
        setCollections(collectionsResponse.collections?.data || []);
      }

      if (purchasesResponse.success) {
        setUserPurchases(purchasesResponse.purchases?.data || []);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await TemplateMarketplaceService.getMarketplaceTemplates({
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

  const handleTemplateClick = (template) => {
    setSelectedTemplate(template);
    setShowTemplateDetails(true);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: '',
      type: '',
      price_range: '',
      sort_by: 'popular',
      is_free: null,
      is_premium: null
    });
  };

  const handlePurchaseComplete = () => {
    fetchInitialData(); // Refresh purchases
    setShowTemplateDetails(false);
  };

  const tabItems = [
    {
      id: 'templates',
      label: 'Templates',
      icon: Grid,
      count: templates.length,
      description: 'Browse individual templates'
    },
    {
      id: 'collections',
      label: 'Collections',
      icon: Store,
      count: collections.length,
      description: 'Explore template bundles'
    },
    {
      id: 'library',
      label: 'My Library',
      icon: Download,
      count: userPurchases.length,
      description: 'Your purchased templates'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Template Marketplace...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Template Marketplace</h1>
              <p className="text-gray-600">Discover and purchase professional templates for your business</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">{userPurchases.length} purchased</span>
              </div>
              <Button
                onClick={() => setActiveTab('library')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>My Library</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search templates..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setActiveTab('templates')}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                onClick={() => setViewMode('grid')}
                className="p-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                onClick={() => setViewMode('list')}
                className="p-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Marketplace</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {tabItems.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <Badge variant="secondary" className="ml-1">
                      {tab.count}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="templates" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Browse Templates</h3>
                  <p className="text-sm text-gray-600">Discover professional templates for your business needs</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Filters Sidebar */}
                  <div className="lg:col-span-1">
                    <TemplateFilters
                      filters={filters}
                      categories={categories}
                      onFilterChange={handleFilterChange}
                      onClearFilters={handleClearFilters}
                    />
                  </div>
                  
                  {/* Templates Grid */}
                  <div className="lg:col-span-3">
                    <TemplateGrid
                      templates={templates}
                      viewMode={viewMode}
                      onTemplateClick={handleTemplateClick}
                      userPurchases={userPurchases}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="collections" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Template Collections</h3>
                  <p className="text-sm text-gray-600">Curated template bundles with special pricing</p>
                </div>
                
                <CollectionGrid
                  collections={collections}
                  onCollectionClick={handleTemplateClick}
                  userPurchases={userPurchases}
                />
              </TabsContent>

              <TabsContent value="library" className="mt-6">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">My Template Library</h3>
                  <p className="text-sm text-gray-600">Your purchased templates and collections</p>
                </div>
                
                <UserTemplateLibrary
                  purchases={userPurchases}
                  onTemplateClick={handleTemplateClick}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Template Details Modal */}
        {showTemplateDetails && selectedTemplate && (
          <TemplateDetails
            template={selectedTemplate}
            isOpen={showTemplateDetails}
            onClose={() => setShowTemplateDetails(false)}
            onPurchaseComplete={handlePurchaseComplete}
            workspaceId={currentWorkspace?.id}
          />
        )}
      </div>
    </div>
  );
};

export default TemplateMarketplace;