import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layout, Grid, List, BarChart3, Users, Calendar, TrendingUp, Settings, Plus, X } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Button from '../ui/Button';

const DashboardCustomizationStep = () => {
  const {
    dashboardLayout,
    setDashboardLayout,
    selectedFeatures,
    completeOnboarding,
    loading,
    goToPreviousStep
  } = useOnboarding();

  const [selectedLayout, setSelectedLayout] = useState(dashboardLayout.layout || 'grid');
  const [selectedWidgets, setSelectedWidgets] = useState(dashboardLayout.widgets || []);
  const [draggedWidget, setDraggedWidget] = useState(null);

  // Available widgets based on selected features
  const availableWidgets = [
    { id: 'analytics', name: 'Analytics Overview', icon: BarChart3, category: 'analytics', size: 'large' },
    { id: 'social_posts', name: 'Recent Posts', icon: Calendar, category: 'social_media', size: 'medium' },
    { id: 'team_activity', name: 'Team Activity', icon: Users, category: 'team', size: 'small' },
    { id: 'performance', name: 'Performance Metrics', icon: TrendingUp, category: 'analytics', size: 'medium' },
    { id: 'quick_actions', name: 'Quick Actions', icon: Settings, category: 'general', size: 'small' },
    { id: 'lead_stats', name: 'Lead Statistics', icon: Users, category: 'crm', size: 'medium' },
    { id: 'course_progress', name: 'Course Progress', icon: TrendingUp, category: 'courses', size: 'large' },
    { id: 'sales_overview', name: 'Sales Overview', icon: BarChart3, category: 'ecommerce', size: 'large' },
    { id: 'link_analytics', name: 'Link Analytics', icon: TrendingUp, category: 'link_in_bio', size: 'medium' },
    { id: 'notifications', name: 'Notifications', icon: Calendar, category: 'general', size: 'small' }
  ];

  const layoutOptions = [
    { id: 'grid', name: 'Grid Layout', icon: Grid, description: 'Organized cards in a grid' },
    { id: 'list', name: 'List Layout', icon: List, description: 'Vertical list view' },
    { id: 'dashboard', name: 'Dashboard', icon: Layout, description: 'Traditional dashboard layout' }
  ];

  useEffect(() => {
    // Set default widgets based on selected features
    if (selectedWidgets.length === 0) {
      const defaultWidgets = ['analytics', 'quick_actions', 'notifications'];
      setSelectedWidgets(defaultWidgets);
      setDashboardLayout({
        layout: selectedLayout,
        widgets: defaultWidgets
      });
    }
  }, [selectedWidgets.length, selectedLayout, setDashboardLayout]);

  const handleLayoutChange = (layout) => {
    setSelectedLayout(layout);
    setDashboardLayout({
      layout,
      widgets: selectedWidgets
    });
  };

  const handleWidgetToggle = (widgetId) => {
    const newWidgets = selectedWidgets.includes(widgetId)
      ? selectedWidgets.filter(id => id !== widgetId)
      : [...selectedWidgets, widgetId];
    
    setSelectedWidgets(newWidgets);
    setDashboardLayout({
      layout: selectedLayout,
      widgets: newWidgets
    });
  };

  const handleDragStart = (e, widget) => {
    setDraggedWidget(widget);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedWidget) {
      const newWidgets = [...selectedWidgets];
      const draggedIndex = newWidgets.findIndex(id => id === draggedWidget.id);
      
      if (draggedIndex !== -1) {
        newWidgets.splice(draggedIndex, 1);
        newWidgets.splice(targetIndex, 0, draggedWidget.id);
        setSelectedWidgets(newWidgets);
        setDashboardLayout({
          layout: selectedLayout,
          widgets: newWidgets
        });
      }
    }
    setDraggedWidget(null);
  };

  const handleComplete = async () => {
    await completeOnboarding();
  };

  const getWidgetIcon = (widgetId) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    return widget ? widget.icon : Settings;
  };

  const getWidgetName = (widgetId) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    return widget ? widget.name : widgetId;
  };

  const getWidgetSize = (widgetId) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    return widget ? widget.size : 'medium';
  };

  const getSizeClass = (size) => {
    switch (size) {
      case 'small':
        return 'col-span-1 row-span-1';
      case 'medium':
        return 'col-span-2 row-span-1';
      case 'large':
        return 'col-span-3 row-span-2';
      default:
        return 'col-span-2 row-span-1';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Customize Your Dashboard
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Choose your preferred layout and select widgets to create your perfect dashboard experience.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Layout Selection */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-1"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Layout Style</h3>
          <div className="space-y-3">
            {layoutOptions.map((layout) => {
              const IconComponent = layout.icon;
              return (
                <button
                  key={layout.id}
                  onClick={() => handleLayoutChange(layout.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedLayout === layout.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="h-6 w-6 text-blue-400" />
                    <div className="text-left">
                      <div className="font-medium text-white">{layout.name}</div>
                      <div className="text-sm text-gray-400">{layout.description}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Widget Selection */}
          <h3 className="text-xl font-semibold text-white mb-4 mt-8">Available Widgets</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {availableWidgets.map((widget) => {
              const IconComponent = widget.icon;
              const isSelected = selectedWidgets.includes(widget.id);
              
              return (
                <button
                  key={widget.id}
                  onClick={() => handleWidgetToggle(widget.id)}
                  className={`w-full p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-500/10 text-blue-400'
                      : 'border-gray-600 hover:border-gray-500 bg-gray-800 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5" />
                      <span className="text-sm font-medium">{widget.name}</span>
                    </div>
                    {isSelected ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Dashboard Preview</h3>
          
          <div className="bg-gray-900 rounded-lg p-6 min-h-96">
            {selectedLayout === 'grid' && (
              <div className="grid grid-cols-4 gap-4 auto-rows-fr">
                {selectedWidgets.map((widgetId, index) => {
                  const IconComponent = getWidgetIcon(widgetId);
                  const size = getWidgetSize(widgetId);
                  
                  return (
                    <div
                      key={widgetId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, availableWidgets.find(w => w.id === widgetId))}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`bg-gray-800 rounded-lg p-4 cursor-move hover:bg-gray-700 transition-colors ${getSizeClass(size)}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <IconComponent className="h-5 w-5 text-blue-400" />
                        <div className="text-xs text-gray-400">{size}</div>
                      </div>
                      <div className="text-sm font-medium text-white">{getWidgetName(widgetId)}</div>
                      <div className="text-xs text-gray-400 mt-1">Sample data</div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedLayout === 'list' && (
              <div className="space-y-3">
                {selectedWidgets.map((widgetId, index) => {
                  const IconComponent = getWidgetIcon(widgetId);
                  
                  return (
                    <div
                      key={widgetId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, availableWidgets.find(w => w.id === widgetId))}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className="bg-gray-800 rounded-lg p-4 cursor-move hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-6 w-6 text-blue-400" />
                        <div className="flex-1">
                          <div className="font-medium text-white">{getWidgetName(widgetId)}</div>
                          <div className="text-sm text-gray-400">Widget content preview</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedLayout === 'dashboard' && (
              <div className="grid grid-cols-12 gap-4">
                {selectedWidgets.map((widgetId, index) => {
                  const IconComponent = getWidgetIcon(widgetId);
                  const size = getWidgetSize(widgetId);
                  const colSpan = size === 'large' ? 'col-span-8' : size === 'medium' ? 'col-span-6' : 'col-span-4';
                  
                  return (
                    <div
                      key={widgetId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, availableWidgets.find(w => w.id === widgetId))}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`bg-gray-800 rounded-lg p-4 cursor-move hover:bg-gray-700 transition-colors ${colSpan}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <IconComponent className="h-5 w-5 text-blue-400" />
                        <div className="text-xs text-gray-400">{size}</div>
                      </div>
                      <div className="text-sm font-medium text-white">{getWidgetName(widgetId)}</div>
                      <div className="text-xs text-gray-400 mt-1">Dashboard widget</div>
                    </div>
                  );
                })}
              </div>
            )}

            {selectedWidgets.length === 0 && (
              <div className="text-center py-12">
                <Layout className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Select widgets to preview your dashboard</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={goToPreviousStep}
          className="text-gray-400 hover:text-white"
        >
          Previous
        </Button>
        
        <Button
          onClick={handleComplete}
          loading={loading}
          disabled={loading || selectedWidgets.length === 0}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          Complete Setup
        </Button>
      </div>
    </div>
  );
};

export default DashboardCustomizationStep;