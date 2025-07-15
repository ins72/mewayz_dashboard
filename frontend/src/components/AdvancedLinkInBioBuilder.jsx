/**
 * Advanced Link in Bio Builder
 * Comprehensive drag-and-drop page builder with A/B testing, analytics, and advanced features
 */

import React, { useState, useEffect, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Move, 
  Eye, 
  Settings, 
  Palette, 
  Code, 
  Smartphone, 
  Monitor, 
  Tablet,
  BarChart3,
  AB,
  Globe,
  Link,
  Image,
  Video,
  Type,
  Mail,
  Share2,
  ShoppingCart,
  Star,
  Clock,
  TrendingUp,
  Zap,
  Target,
  Layers,
  Grid,
  Save,
  Undo,
  Redo,
  Download,
  Upload
} from 'lucide-react';

import linkInBioService from '../../services/linkInBioService';

const AdvancedLinkInBioBuilder = ({ pageId, workspaceId }) => {
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [page, setPage] = useState(null);
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const [previewMode, setPreviewMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showABTest, setShowABTest] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(true);
  const [availableComponents, setAvailableComponents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [abTests, setABTests] = useState([]);
  const [customCSS, setCustomCSS] = useState('');
  const [seoSettings, setSeoSettings] = useState({});
  const [integrations, setIntegrations] = useState([]);
  const [theme, setTheme] = useState('light');
  const [animations, setAnimations] = useState(true);
  const [customDomain, setCustomDomain] = useState('');
  const [socialMediaPreview, setSocialMediaPreview] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved, saving, unsaved
  const [autoSave, setAutoSave] = useState(true);
  const [collaborators, setCollaborators] = useState([]);
  const [versionHistory, setVersionHistory] = useState([]);
  const [publishedVersions, setPublishedVersions] = useState([]);
  
  const builderRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Component types registry
  const componentTypes = {
    header: {
      name: 'Header',
      icon: Type,
      category: 'basic',
      description: 'Profile header with avatar and bio',
      defaultProps: {
        title: 'Your Name',
        subtitle: 'Your Bio',
        avatar: '/api/placeholder/80/80'
      }
    },
    link: {
      name: 'Link Button',
      icon: Link,
      category: 'basic',
      description: 'Clickable link button',
      defaultProps: {
        title: 'Link Title',
        url: 'https://example.com',
        style: 'primary',
        icon: 'link'
      }
    },
    text: {
      name: 'Text Block',
      icon: Type,
      category: 'content',
      description: 'Rich text content',
      defaultProps: {
        content: 'Your text content here...',
        alignment: 'left',
        fontSize: 'medium'
      }
    },
    image: {
      name: 'Image',
      icon: Image,
      category: 'media',
      description: 'Image with optional caption',
      defaultProps: {
        src: '/api/placeholder/400/300',
        alt: 'Image description',
        caption: 'Image caption'
      }
    },
    video: {
      name: 'Video',
      icon: Video,
      category: 'media',
      description: 'Embedded video player',
      defaultProps: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Video Title',
        autoplay: false
      }
    },
    social: {
      name: 'Social Media',
      icon: Share2,
      category: 'social',
      description: 'Social media platform links',
      defaultProps: {
        platforms: [
          { name: 'instagram', url: 'https://instagram.com/username' },
          { name: 'twitter', url: 'https://twitter.com/username' },
          { name: 'linkedin', url: 'https://linkedin.com/in/username' }
        ]
      }
    },
    contact: {
      name: 'Contact Form',
      icon: Mail,
      category: 'forms',
      description: 'Contact form with custom fields',
      defaultProps: {
        title: 'Contact Me',
        email: 'your@email.com',
        fields: ['name', 'email', 'message']
      }
    },
    products: {
      name: 'Product Grid',
      icon: ShoppingCart,
      category: 'ecommerce',
      description: 'Product showcase grid',
      defaultProps: {
        products: [],
        columns: 2,
        showPrices: true
      }
    },
    testimonial: {
      name: 'Testimonial',
      icon: Star,
      category: 'social',
      description: 'Customer testimonial',
      defaultProps: {
        quote: 'This is an amazing product!',
        author: 'John Doe',
        avatar: '/api/placeholder/60/60',
        rating: 5
      }
    },
    countdown: {
      name: 'Countdown Timer',
      icon: Clock,
      category: 'special',
      description: 'Countdown to event or launch',
      defaultProps: {
        title: 'Coming Soon',
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        style: 'flip'
      }
    },
    analytics: {
      name: 'Analytics Widget',
      icon: BarChart3,
      category: 'special',
      description: 'Display analytics data',
      defaultProps: {
        metrics: ['views', 'clicks', 'conversions'],
        timeframe: '30d'
      }
    },
    divider: {
      name: 'Divider',
      icon: Grid,
      category: 'basic',
      description: 'Visual divider line',
      defaultProps: {
        style: 'solid',
        color: '#e5e7eb',
        thickness: 1
      }
    },
    spacer: {
      name: 'Spacer',
      icon: Layers,
      category: 'basic',
      description: 'Add vertical spacing',
      defaultProps: {
        height: 20
      }
    }
  };

  // Load initial data
  useEffect(() => {
    loadBuilderData();
  }, [pageId, workspaceId]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && components.length > 0) {
      clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => {
        saveComponents();
      }, 2000);
    }
    return () => clearTimeout(autoSaveRef.current);
  }, [components, autoSave]);

  // Load all builder data
  const loadBuilderData = async () => {
    try {
      setIsLoading(true);
      
      const [
        pageResponse,
        componentsResponse,
        templatesResponse,
        analyticsResponse,
        abTestsResponse
      ] = await Promise.all([
        linkInBioService.getPages(workspaceId),
        linkInBioService.getComponents(),
        linkInBioService.getTemplates(),
        linkInBioService.getPageAnalytics(pageId),
        linkInBioService.getABTests && linkInBioService.getABTests(pageId)
      ]);

      const currentPage = pageResponse.data.find(p => p.id === pageId);
      if (currentPage) {
        setPage(currentPage);
        setComponents(currentPage.components || []);
        setCustomCSS(currentPage.customCSS || '');
        setSeoSettings(currentPage.seoSettings || {});
        setTheme(currentPage.theme || 'light');
        setCustomDomain(currentPage.customDomain || '');
      }

      setAvailableComponents(componentsResponse.data || []);
      setTemplates(templatesResponse.data || []);
      setAnalytics(analyticsResponse.data || null);
      setABTests(abTestsResponse?.data || []);
      
      // Initialize history
      addToHistory(currentPage?.components || []);
      
    } catch (error) {
      console.error('Error loading builder data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // History management
  const addToHistory = (newComponents) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newComponents)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setComponents(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setComponents(history[historyIndex + 1]);
    }
  };

  // Component management
  const addComponent = (type, position = null) => {
    const newComponent = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data: { ...componentTypes[type].defaultProps },
      position: position || components.length,
      visible: true,
      animations: {
        entrance: 'fadeIn',
        hover: 'none'
      }
    };

    const newComponents = [...components];
    if (position !== null) {
      newComponents.splice(position, 0, newComponent);
    } else {
      newComponents.push(newComponent);
    }

    setComponents(newComponents);
    addToHistory(newComponents);
    setSelectedComponent(newComponent.id);
    setSaveStatus('unsaved');
  };

  const updateComponent = (id, updates) => {
    const newComponents = components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    );
    setComponents(newComponents);
    addToHistory(newComponents);
    setSaveStatus('unsaved');
  };

  const deleteComponent = (id) => {
    const newComponents = components.filter(comp => comp.id !== id);
    setComponents(newComponents);
    addToHistory(newComponents);
    setSelectedComponent(null);
    setSaveStatus('unsaved');
  };

  const duplicateComponent = (id) => {
    const component = components.find(comp => comp.id === id);
    if (component) {
      const duplicate = {
        ...component,
        id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        position: component.position + 1
      };
      
      const newComponents = [...components];
      newComponents.splice(component.position + 1, 0, duplicate);
      
      setComponents(newComponents);
      addToHistory(newComponents);
      setSaveStatus('unsaved');
    }
  };

  const moveComponent = (dragIndex, hoverIndex) => {
    const newComponents = [...components];
    const draggedComponent = newComponents[dragIndex];
    
    newComponents.splice(dragIndex, 1);
    newComponents.splice(hoverIndex, 0, draggedComponent);
    
    // Update positions
    newComponents.forEach((comp, index) => {
      comp.position = index;
    });
    
    setComponents(newComponents);
    addToHistory(newComponents);
    setSaveStatus('unsaved');
  };

  // Save functionality
  const saveComponents = async () => {
    if (!page) return;
    
    try {
      setSaveStatus('saving');
      
      const updateData = {
        components,
        customCSS,
        seoSettings,
        theme,
        customDomain,
        updatedAt: new Date().toISOString()
      };
      
      await linkInBioService.updatePage(pageId, updateData);
      setSaveStatus('saved');
      
      // Create version history entry
      const newVersion = {
        id: `version-${Date.now()}`,
        timestamp: new Date().toISOString(),
        components: JSON.parse(JSON.stringify(components)),
        description: 'Auto-save'
      };
      
      setVersionHistory(prev => [newVersion, ...prev.slice(0, 49)]); // Keep last 50 versions
      
    } catch (error) {
      console.error('Error saving components:', error);
      setSaveStatus('error');
    }
  };

  // A/B Testing
  const createABTest = async (testConfig) => {
    try {
      setLoading(true);
      
      const abTest = {
        id: `test-${Date.now()}`,
        name: testConfig.name,
        description: testConfig.description,
        variants: [
          {
            id: 'control',
            name: 'Control',
            components: JSON.parse(JSON.stringify(components)),
            traffic: 50
          },
          {
            id: 'variant',
            name: 'Variant',
            components: JSON.parse(JSON.stringify(testConfig.variantComponents)),
            traffic: 50
          }
        ],
        metrics: testConfig.metrics || ['clicks', 'conversions'],
        duration: testConfig.duration || 14, // days
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + (testConfig.duration || 14) * 24 * 60 * 60 * 1000).toISOString(),
        results: {
          control: { visitors: 0, conversions: 0, conversionRate: 0 },
          variant: { visitors: 0, conversions: 0, conversionRate: 0 }
        }
      };

      // In a real implementation, this would call an API
      setABTests(prev => [...prev, abTest]);
      
    } catch (error) {
      console.error('Error creating A/B test:', error);
    } finally {
      setLoading(false);
    }
  };

  // Preview functionality
  const generatePreview = async () => {
    try {
      const previewData = {
        title: page?.title || 'Preview',
        description: page?.description || '',
        components,
        theme,
        customCSS
      };
      
      const result = await linkInBioService.previewPage(previewData);
      return result.data;
    } catch (error) {
      console.error('Error generating preview:', error);
      return null;
    }
  };

  // Export functionality
  const exportPage = async (format = 'json') => {
    try {
      const exportData = {
        page: {
          ...page,
          components,
          customCSS,
          seoSettings,
          theme,
          customDomain
        },
        metadata: {
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
          format
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${page?.slug || 'page'}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error exporting page:', error);
    }
  };

  // Import functionality
  const importPage = async (file) => {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (importData.page && importData.page.components) {
        setComponents(importData.page.components);
        setCustomCSS(importData.page.customCSS || '');
        setSeoSettings(importData.page.seoSettings || {});
        setTheme(importData.page.theme || 'light');
        
        addToHistory(importData.page.components);
        setSaveStatus('unsaved');
      }
      
    } catch (error) {
      console.error('Error importing page:', error);
    }
  };

  // Responsive design helpers
  const getViewportStyles = () => {
    switch (viewMode) {
      case 'mobile':
        return { maxWidth: '375px', margin: '0 auto' };
      case 'tablet':
        return { maxWidth: '768px', margin: '0 auto' };
      case 'desktop':
      default:
        return { maxWidth: '400px', margin: '0 auto' };
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading builder...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen bg-gray-900 flex overflow-hidden">
        {/* Left Sidebar - Components */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Components</h2>
            
            {/* Component Categories */}
            {Object.entries(
              Object.entries(componentTypes).reduce((acc, [key, comp]) => {
                acc[comp.category] = acc[comp.category] || [];
                acc[comp.category].push({ key, ...comp });
                return acc;
              }, {})
            ).map(([category, categoryComponents]) => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-medium text-gray-400 uppercase mb-2">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryComponents.map(({ key, name, icon: Icon, description }) => (
                    <button
                      key={key}
                      onClick={() => addComponent(key)}
                      className="w-full flex items-center p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
                    >
                      <Icon className="w-5 h-5 text-blue-400 mr-3" />
                      <div>
                        <div className="text-white font-medium">{name}</div>
                        <div className="text-gray-400 text-sm">{description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Builder Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Toolbar */}
          <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Undo/Redo */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Undo className="w-5 h-5" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Redo className="w-5 h-5" />
                </button>
              </div>

              {/* Viewport Controls */}
              <div className="flex items-center space-x-1 bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('tablet')}
                  className={`p-2 rounded ${viewMode === 'tablet' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>

              {/* Preview Mode */}
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  previewMode 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>Preview</span>
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Save Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  saveStatus === 'saved' ? 'bg-green-500' : 
                  saveStatus === 'saving' ? 'bg-yellow-500' : 
                  saveStatus === 'unsaved' ? 'bg-red-500' : 'bg-gray-500'
                }`} />
                <span className="text-sm text-gray-400">
                  {saveStatus === 'saved' ? 'Saved' : 
                   saveStatus === 'saving' ? 'Saving...' : 
                   saveStatus === 'unsaved' ? 'Unsaved' : 'Error'}
                </span>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setShowAnalytics(true)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <BarChart3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowABTest(true)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <AB className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-400 hover:text-white"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button
                onClick={saveComponents}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </div>
          </div>

          {/* Builder Canvas */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-8">
            <div className="max-w-full" style={getViewportStyles()}>
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Page Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <h1 className="text-2xl font-bold">{page?.title || 'My Page'}</h1>
                  <p className="text-blue-100 mt-2">{page?.description || 'Welcome to my page'}</p>
                </div>

                {/* Component Canvas */}
                <div className="p-6">
                  <AnimatePresence>
                    {components.map((component, index) => (
                      <DraggableComponent
                        key={component.id}
                        component={component}
                        index={index}
                        moveComponent={moveComponent}
                        updateComponent={updateComponent}
                        deleteComponent={deleteComponent}
                        duplicateComponent={duplicateComponent}
                        isSelected={selectedComponent === component.id}
                        onSelect={() => setSelectedComponent(component.id)}
                        previewMode={previewMode}
                        viewMode={viewMode}
                      />
                    ))}
                  </AnimatePresence>
                  
                  {/* Empty State */}
                  {components.length === 0 && (
                    <div className="text-center py-16">
                      <div className="text-gray-400 mb-4">
                        <Plus className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg">No components yet</p>
                        <p className="text-sm">Start building by adding components from the sidebar</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        {selectedComponent && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <ComponentProperties
              component={components.find(c => c.id === selectedComponent)}
              onUpdate={(updates) => updateComponent(selectedComponent, updates)}
              onClose={() => setSelectedComponent(null)}
            />
          </div>
        )}
      </div>

      {/* Analytics Modal */}
      {showAnalytics && (
        <AnalyticsModal
          analytics={analytics}
          onClose={() => setShowAnalytics(false)}
        />
      )}

      {/* A/B Test Modal */}
      {showABTest && (
        <ABTestModal
          abTests={abTests}
          onCreateTest={createABTest}
          onClose={() => setShowABTest(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          page={page}
          customCSS={customCSS}
          seoSettings={seoSettings}
          theme={theme}
          customDomain={customDomain}
          onUpdate={(updates) => {
            if (updates.customCSS !== undefined) setCustomCSS(updates.customCSS);
            if (updates.seoSettings !== undefined) setSeoSettings(updates.seoSettings);
            if (updates.theme !== undefined) setTheme(updates.theme);
            if (updates.customDomain !== undefined) setCustomDomain(updates.customDomain);
          }}
          onClose={() => setShowSettings(false)}
        />
      )}
    </DndProvider>
  );
};

// Draggable Component Wrapper
const DraggableComponent = ({ 
  component, 
  index, 
  moveComponent, 
  updateComponent, 
  deleteComponent, 
  duplicateComponent, 
  isSelected, 
  onSelect, 
  previewMode, 
  viewMode 
}) => {
  const ref = useRef(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'component',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'component',
    hover: (item, monitor) => {
      if (!ref.current) return;
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      if (dragIndex === hoverIndex) return;
      
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      
      moveComponent(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  drag(drop(ref));

  const handleClick = (e) => {
    if (!previewMode) {
      e.stopPropagation();
      onSelect();
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative group mb-4 ${
        isDragging ? 'opacity-50' : ''
      } ${
        isSelected && !previewMode ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={handleClick}
    >
      {/* Component Controls */}
      {!previewMode && (
        <div className="absolute top-0 right-0 -mt-8 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateComponent(component.id);
            }}
            className="p-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteComponent(component.id);
            }}
            className="p-1 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Component Renderer */}
      <ComponentRenderer
        component={component}
        viewMode={viewMode}
        previewMode={previewMode}
        onUpdate={(updates) => updateComponent(component.id, updates)}
      />
    </motion.div>
  );
};

export default AdvancedLinkInBioBuilder;