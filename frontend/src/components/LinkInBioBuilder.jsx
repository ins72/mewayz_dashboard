import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import linkInBioService from '../services/linkInBioService';

const LinkInBioBuilder = ({ workspaceId, pageId, onSave }) => {
  const [components, setComponents] = useState([]);
  const [availableComponents, setAvailableComponents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [pageSettings, setPageSettings] = useState({
    title: '',
    slug: '',
    description: '',
    theme: 'light',
    customCSS: ''
  });

  useEffect(() => {
    loadInitialData();
  }, [workspaceId, pageId]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [componentsRes, templatesRes] = await Promise.all([
        linkInBioService.getEnhancedComponents(),
        linkInBioService.getEnhancedTemplates()
      ]);

      setAvailableComponents(componentsRes.data || []);
      setTemplates(templatesRes.data || []);

      if (pageId) {
        const pageRes = await linkInBioService.getPages(workspaceId);
        const page = pageRes.data.find(p => p.id === pageId);
        if (page) {
          setComponents(page.components || []);
          setPageSettings({
            title: page.title,
            slug: page.slug,
            description: page.description,
            theme: page.theme || 'light',
            customCSS: page.customCSS || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === 'components' && destination.droppableId === 'builder') {
      // Add component from sidebar to builder
      const componentToAdd = availableComponents.find(c => c.id === result.draggableId);
      if (componentToAdd) {
        const newComponent = {
          id: `${componentToAdd.id}-${Date.now()}`,
          type: componentToAdd.id,
          name: componentToAdd.name,
          data: getDefaultComponentData(componentToAdd),
          order: destination.index
        };
        
        const newComponents = [...components];
        newComponents.splice(destination.index, 0, newComponent);
        setComponents(newComponents);
      }
    } else if (source.droppableId === 'builder' && destination.droppableId === 'builder') {
      // Reorder components within builder
      const newComponents = Array.from(components);
      const [reorderedItem] = newComponents.splice(source.index, 1);
      newComponents.splice(destination.index, 0, reorderedItem);
      setComponents(newComponents);
    }
  };

  const getDefaultComponentData = (component) => {
    const defaultData = {};
    Object.entries(component.settings || {}).forEach(([key, setting]) => {
      if (setting.required) {
        defaultData[key] = setting.type === 'text' ? 'Sample text' : 
                          setting.type === 'url' ? 'https://example.com' : 
                          setting.type === 'email' ? 'email@example.com' : '';
      }
    });
    return defaultData;
  };

  const updateComponent = (componentId, newData) => {
    setComponents(components.map(comp => 
      comp.id === componentId ? { ...comp, data: { ...comp.data, ...newData } } : comp
    ));
  };

  const removeComponent = (componentId) => {
    setComponents(components.filter(comp => comp.id !== componentId));
    setSelectedComponent(null);
  };

  const duplicateComponent = (componentId) => {
    const componentToDuplicate = components.find(comp => comp.id === componentId);
    if (componentToDuplicate) {
      const duplicatedComponent = {
        ...componentToDuplicate,
        id: `${componentToDuplicate.type}-${Date.now()}`,
        data: { ...componentToDuplicate.data }
      };
      setComponents([...components, duplicatedComponent]);
    }
  };

  const applyTemplate = (template) => {
    setSelectedTemplate(template);
    const templateComponents = template.components.map((compType, index) => {
      const availableComp = availableComponents.find(c => c.id === compType);
      return {
        id: `${compType}-${Date.now()}-${index}`,
        type: compType,
        name: availableComp?.name || compType,
        data: getDefaultComponentData(availableComp || {}),
        order: index
      };
    });
    setComponents(templateComponents);
    setPageSettings(prev => ({
      ...prev,
      theme: template.themeColors ? 'custom' : 'light'
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const pageData = {
        ...pageSettings,
        components,
        template: selectedTemplate?.id,
        themeColors: selectedTemplate?.themeColors
      };

      const result = await linkInBioService.saveDragDropPage(workspaceId, pageData);
      if (result.success) {
        onSave?.(result.data);
      }
    } catch (error) {
      console.error('Error saving page:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderComponent = (component, isPreview = false) => {
    const componentConfig = availableComponents.find(c => c.id === component.type);
    
    switch (component.type) {
      case 'header-enhanced':
        return (
          <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            {component.data.avatar && (
              <img 
                src={component.data.avatar} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full mx-auto mb-4"
              />
            )}
            <h1 className="text-2xl font-bold text-gray-800">{component.data.title}</h1>
            {component.data.subtitle && (
              <p className="text-gray-600 mt-2">{component.data.subtitle}</p>
            )}
          </div>
        );
      
      case 'link-advanced':
        return (
          <motion.a
            href={component.data.url}
            target={component.data.targetBlank ? '_blank' : '_self'}
            rel={component.data.targetBlank ? 'noopener noreferrer' : ''}
            className={`block w-full p-4 rounded-lg text-center font-medium transition-all duration-200 ${
              component.data.style === 'filled' ? 'bg-blue-500 text-white hover:bg-blue-600' :
              component.data.style === 'outlined' ? 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50' :
              component.data.style === 'minimal' ? 'text-blue-500 hover:text-blue-600' :
              'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {component.data.icon && (
              <i className={`fas fa-${component.data.icon} mr-2`}></i>
            )}
            {component.data.title}
          </motion.a>
        );
      
      case 'social-enhanced':
        return (
          <div className="flex justify-center space-x-4">
            {component.data.platforms?.map(platform => (
              <motion.a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-full ${
                  component.data.style === 'buttons' ? 'bg-gray-100 hover:bg-gray-200' :
                  'text-gray-600 hover:text-gray-800'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <i className={`fab fa-${platform.name} text-xl`}></i>
              </motion.a>
            ))}
          </div>
        );
      
      case 'gallery-pro':
        return (
          <div className={`grid grid-cols-${component.data.columns || 2} gap-4`}>
            {component.data.images?.map((image, index) => (
              <motion.img
                key={index}
                src={image}
                alt={`Gallery ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => component.data.lightbox && openLightbox(image)}
              />
            ))}
          </div>
        );
      
      case 'text-rich':
        return (
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: component.data.content }}
          />
        );
      
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg text-center">
            <i className={`fas fa-${componentConfig?.icon || 'cube'} text-2xl text-gray-400 mb-2`}></i>
            <p className="text-gray-600">{component.name}</p>
          </div>
        );
    }
  };

  const renderComponentEditor = (component) => {
    const componentConfig = availableComponents.find(c => c.id === component.type);
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{component.name} Settings</h3>
        
        {Object.entries(componentConfig?.settings || {}).map(([key, setting]) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {setting.label}
              {setting.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            
            {setting.type === 'text' && (
              <input
                type="text"
                value={component.data[key] || ''}
                onChange={(e) => updateComponent(component.id, { [key]: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={setting.placeholder}
              />
            )}
            
            {setting.type === 'url' && (
              <input
                type="url"
                value={component.data[key] || ''}
                onChange={(e) => updateComponent(component.id, { [key]: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
              />
            )}
            
            {setting.type === 'select' && (
              <select
                value={component.data[key] || ''}
                onChange={(e) => updateComponent(component.id, { [key]: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {setting.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            )}
            
            {setting.type === 'boolean' && (
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={component.data[key] || false}
                  onChange={(e) => updateComponent(component.id, { [key]: e.target.checked })}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">{setting.label}</span>
              </label>
            )}
            
            {setting.type === 'color' && (
              <input
                type="color"
                value={component.data[key] || '#000000'}
                onChange={(e) => updateComponent(component.id, { [key]: e.target.value })}
                className="w-full h-10 border border-gray-300 rounded-lg"
              />
            )}
          </div>
        ))}
        
        <div className="flex space-x-2 pt-4 border-t">
          <button
            onClick={() => duplicateComponent(component.id)}
            className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Duplicate
          </button>
          <button
            onClick={() => removeComponent(component.id)}
            className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Link in Bio Builder</h2>
            
            {/* Page Settings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Page Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Page Title</label>
                  <input
                    type="text"
                    value={pageSettings.title}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="My Awesome Page"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    value={pageSettings.slug}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, slug: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="my-page"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={pageSettings.description}
                    onChange={(e) => setPageSettings(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Page description"
                  />
                </div>
              </div>
            </div>
            
            {/* Templates */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Templates</h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.map(template => (
                  <motion.div
                    key={template.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedTemplate?.id === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => applyTemplate(template)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img 
                      src={template.thumbnail} 
                      alt={template.name}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                    <h4 className="text-sm font-medium text-gray-800">{template.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                    {template.isPremium && (
                      <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-2">
                        Premium
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
            
            {/* Components */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Components</h3>
              <Droppable droppableId="components" isDropDisabled={true}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {availableComponents.map((component, index) => (
                      <Draggable key={component.id} draggableId={component.id} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 border rounded-lg cursor-move transition-all ${
                              snapshot.isDragging ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-50'
                            }`}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="flex items-center">
                              <i className={`fas fa-${component.icon} text-gray-500 mr-3`}></i>
                              <div>
                                <h4 className="text-sm font-medium text-gray-800">{component.name}</h4>
                                <p className="text-xs text-gray-600">{component.description}</p>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
            
            {/* Component Editor */}
            {selectedComponent && (
              <div className="mb-6">
                {renderComponentEditor(selectedComponent)}
              </div>
            )}
          </div>
        </div>
        
        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  previewMode 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {previewMode ? 'Edit' : 'Preview'}
              </button>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Device:</span>
                <select className="px-3 py-1 border border-gray-300 rounded-md text-sm">
                  <option value="mobile">Mobile</option>
                  <option value="tablet">Tablet</option>
                  <option value="desktop">Desktop</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {isLoading ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </div>
          
          {/* Canvas */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
              {previewMode ? (
                <div className="p-6 space-y-6">
                  {components.map(component => (
                    <div key={component.id}>
                      {renderComponent(component, true)}
                    </div>
                  ))}
                </div>
              ) : (
                <Droppable droppableId="builder">
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-6 space-y-6 min-h-96 ${
                        snapshot.isDraggingOver ? 'bg-blue-50' : ''
                      }`}
                    >
                      {components.length === 0 ? (
                        <div className="text-center py-12">
                          <i className="fas fa-mouse-pointer text-4xl text-gray-400 mb-4"></i>
                          <p className="text-gray-600">Drag components here to build your page</p>
                        </div>
                      ) : (
                        components.map((component, index) => (
                          <Draggable key={component.id} draggableId={component.id} index={index}>
                            {(provided, snapshot) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`relative group ${
                                  snapshot.isDragging ? 'opacity-50' : ''
                                }`}
                                onClick={() => setSelectedComponent(component)}
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="absolute top-0 left-0 w-full h-full bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all cursor-move"
                                />
                                
                                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateComponent(component.id);
                                    }}
                                    className="p-1 bg-white rounded shadow hover:bg-gray-50"
                                  >
                                    <i className="fas fa-copy text-xs text-gray-600"></i>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeComponent(component.id);
                                    }}
                                    className="p-1 bg-white rounded shadow hover:bg-gray-50"
                                  >
                                    <i className="fas fa-trash text-xs text-red-600"></i>
                                  </button>
                                </div>
                                
                                <div className={`border-2 border-transparent group-hover:border-blue-300 rounded-lg transition-all ${
                                  selectedComponent?.id === component.id ? 'border-blue-500' : ''
                                }`}>
                                  {renderComponent(component)}
                                </div>
                              </motion.div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

export default LinkInBioBuilder;