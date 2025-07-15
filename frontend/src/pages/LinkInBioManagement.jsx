import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import linkInBioService from '../services/linkInBioService';
import LinkInBioBuilder from '../components/LinkInBioBuilder';
import ABTestingDashboard from '../components/ABTestingDashboard';

const LinkInBioManagement = ({ workspaceId }) => {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pages');
  const [selectedPage, setSelectedPage] = useState(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadPages();
  }, [workspaceId]);

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const response = await linkInBioService.getPages(workspaceId);
      if (response.success) {
        setPages(response.data || []);
      }
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageSave = (savedPage) => {
    if (selectedPage) {
      setPages(pages.map(p => p.id === savedPage.id ? savedPage : p));
    } else {
      setPages([...pages, savedPage]);
    }
    setShowBuilder(false);
    setSelectedPage(null);
  };

  const handleDeletePage = async (pageId) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        await linkInBioService.deletePage(pageId);
        setPages(pages.filter(p => p.id !== pageId));
      } catch (error) {
        console.error('Error deleting page:', error);
      }
    }
  };

  const handleDuplicatePage = async (pageId) => {
    try {
      const response = await linkInBioService.duplicatePageWithABTest(pageId);
      if (response.success) {
        setPages([...pages, response.data]);
      }
    } catch (error) {
      console.error('Error duplicating page:', error);
    }
  };

  const handleViewAnalytics = async (pageId) => {
    setIsLoading(true);
    try {
      const response = await linkInBioService.getAdvancedAnalytics(pageId);
      if (response.success) {
        setAnalytics(response.data);
        setSelectedPage(pages.find(p => p.id === pageId));
        setShowAnalytics(true);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPageCard = (page) => (
    <motion.div
      key={page.id}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{page.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            page.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {page.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-4">{page.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <i className="fas fa-link mr-2"></i>
          <a 
            href={page.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 truncate"
          >
            {page.url}
          </a>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-800">{page.analytics?.views || 0}</div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{page.analytics?.clicks || 0}</div>
            <div className="text-xs text-gray-500">Clicks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{page.analytics?.ctr || 0}%</div>
            <div className="text-xs text-gray-500">CTR</div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setSelectedPage(page);
              setShowBuilder(true);
            }}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <i className="fas fa-edit mr-2"></i>
            Edit
          </button>
          <button
            onClick={() => handleViewAnalytics(page.id)}
            className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
          >
            <i className="fas fa-chart-line mr-2"></i>
            Analytics
          </button>
          <div className="relative">
            <button
              className="p-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                // Toggle dropdown menu
              }}
            >
              <i className="fas fa-ellipsis-v"></i>
            </button>
            {/* Dropdown menu would go here */}
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderAnalyticsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Analytics - {selectedPage?.title}
            </h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {analytics && (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {analytics.overview.totalViews.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Views</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {analytics.overview.totalClicks.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Clicks</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {analytics.overview.clickThroughRate}%
                  </div>
                  <div className="text-sm text-gray-600">CTR</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {analytics.overview.conversionRate}%
                  </div>
                  <div className="text-sm text-gray-600">Conversion Rate</div>
                </div>
              </div>
              
              {/* Traffic Sources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Traffic Sources</h3>
                  <div className="space-y-3">
                    {analytics.traffic.sources.map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                          <span className="font-medium">{source.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{source.visits.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{source.percentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Top Performing Links</h3>
                  <div className="space-y-3">
                    {analytics.engagement.topPerformingComponents.map((component, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{component.title}</div>
                          <div className="text-sm text-gray-500">{component.type}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{component.clicks}</div>
                          <div className="text-sm text-gray-500">{component.ctr}% CTR</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Geography */}
              <div className="bg-white border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.geography.map((country, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{country.country}</span>
                      <div className="text-right">
                        <div className="font-semibold">{country.visits.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">{country.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-800">Link in Bio</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  setSelectedPage(null);
                  setShowBuilder(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Create Page
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pages' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-file-alt mr-2"></i>
            Pages
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'analytics' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-chart-line mr-2"></i>
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('testing')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'testing' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-flask mr-2"></i>
            A/B Testing
          </button>
        </div>
        
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'pages' && (
            <motion.div
              key="pages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : pages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pages.map(renderPageCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-link text-6xl text-gray-400 mb-4"></i>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Link in Bio Pages</h2>
                  <p className="text-gray-600 mb-6">
                    Create your first Link in Bio page to start sharing all your important links
                  </p>
                  <button
                    onClick={() => {
                      setSelectedPage(null);
                      setShowBuilder(true);
                    }}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create Your First Page
                  </button>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Overall Analytics</h2>
                <p className="text-gray-600">
                  View analytics for individual pages by clicking the Analytics button on each page card.
                </p>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'testing' && (
            <motion.div
              key="testing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ABTestingDashboard pageId={selectedPage?.id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showBuilder && (
          <motion.div
            className="fixed inset-0 bg-white z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LinkInBioBuilder
              workspaceId={workspaceId}
              pageId={selectedPage?.id}
              onSave={handlePageSave}
            />
          </motion.div>
        )}
        
        {showAnalytics && renderAnalyticsModal()}
      </AnimatePresence>
    </div>
  );
};

export default LinkInBioManagement;