import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import crmService from '../services/crmService';

const SalesPipeline = ({ workspaceId }) => {
  const [pipeline, setPipeline] = useState({ stages: [], deals: [] });
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showDealModal, setShowDealModal] = useState(false);
  const [newDeal, setNewDeal] = useState({
    title: '',
    contact_id: '',
    value: '',
    stage_id: '',
    probability: 50,
    expected_close: '',
    description: ''
  });

  useEffect(() => {
    loadPipeline();
    loadContacts();
  }, [workspaceId]);

  const loadPipeline = async () => {
    setIsLoading(true);
    try {
      const response = await crmService.getPipeline(workspaceId);
      if (response.success) {
        setPipeline(response.data || { stages: [], deals: [] });
      }
    } catch (error) {
      console.error('Error loading pipeline:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadContacts = async () => {
    try {
      const response = await crmService.getContacts(workspaceId);
      if (response.success) {
        setContacts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId !== destination.droppableId) {
      // Move deal to different stage
      try {
        await crmService.updateDealStage(draggableId, destination.droppableId);
        loadPipeline(); // Refresh pipeline
      } catch (error) {
        console.error('Error updating deal stage:', error);
      }
    }
  };

  const handleCreateDeal = async () => {
    setIsLoading(true);
    try {
      const response = await crmService.createDeal(workspaceId, newDeal);
      if (response.success) {
        loadPipeline(); // Refresh pipeline
        setShowDealModal(false);
        resetNewDeal();
      }
    } catch (error) {
      console.error('Error creating deal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewDeal = () => {
    setNewDeal({
      title: '',
      contact_id: '',
      value: '',
      stage_id: '',
      probability: 50,
      expected_close: '',
      description: ''
    });
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 75) return 'text-green-600';
    if (probability >= 50) return 'text-yellow-600';
    if (probability >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const renderDealCard = (deal) => (
    <Draggable key={deal.id} draggableId={deal.id} index={deal.index || 0}>
      {(provided, snapshot) => (
        <motion.div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow cursor-pointer ${
            snapshot.isDragging ? 'shadow-lg rotate-2' : ''
          }`}
          onClick={() => {
            setSelectedDeal(deal);
            setNewDeal({
              ...deal,
              value: deal.value.toString(),
              expected_close: deal.expected_close?.split('T')[0] || ''
            });
            setShowDealModal(true);
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="mb-3">
            <h4 className="font-medium text-gray-800 mb-1">{deal.title}</h4>
            <p className="text-sm text-gray-600">{deal.contact_name}</p>
            <p className="text-xs text-gray-500">{deal.company}</p>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-green-600">
              {formatCurrency(deal.value)}
            </span>
            <span className={`text-sm font-medium ${getProbabilityColor(deal.probability)}`}>
              {deal.probability}%
            </span>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Expected close</span>
            <span>{new Date(deal.expected_close).toLocaleDateString()}</span>
          </div>
          
          <div className="mt-2 bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${deal.probability}%` }}
            />
          </div>
        </motion.div>
      )}
    </Draggable>
  );

  const renderStageColumn = (stage) => (
    <div key={stage.id} className="bg-gray-50 rounded-lg p-4 min-w-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: stage.color }}
          />
          <h3 className="text-lg font-semibold text-gray-800">{stage.name}</h3>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-600">{stage.deals_count} deals</div>
          <div className="text-xs text-gray-500">
            {formatCurrency(stage.total_value)}
          </div>
        </div>
      </div>
      
      <Droppable droppableId={stage.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`space-y-3 min-h-96 ${
              snapshot.isDraggingOver ? 'bg-blue-50' : ''
            }`}
          >
            {pipeline.deals
              .filter(deal => deal.stage_id === stage.id)
              .map((deal, index) => renderDealCard({ ...deal, index }))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );

  const renderDealModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedDeal ? 'Edit Deal' : 'Create New Deal'}
            </h2>
            <button
              onClick={() => setShowDealModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleCreateDeal(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deal Title *
              </label>
              <input
                type="text"
                value={newDeal.title}
                onChange={(e) => setNewDeal({ ...newDeal, title: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Enterprise Software License"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact *
                </label>
                <select
                  value={newDeal.contact_id}
                  onChange={(e) => setNewDeal({ ...newDeal, contact_id: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Contact</option>
                  {contacts.map(contact => (
                    <option key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name} - {contact.company}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage *
                </label>
                <select
                  value={newDeal.stage_id}
                  onChange={(e) => setNewDeal({ ...newDeal, stage_id: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Stage</option>
                  {pipeline.stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deal Value *
                </label>
                <input
                  type="number"
                  value={newDeal.value}
                  onChange={(e) => setNewDeal({ ...newDeal, value: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Probability (%)
                </label>
                <input
                  type="number"
                  value={newDeal.probability}
                  onChange={(e) => setNewDeal({ ...newDeal, probability: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Close Date
              </label>
              <input
                type="date"
                value={newDeal.expected_close}
                onChange={(e) => setNewDeal({ ...newDeal, expected_close: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newDeal.description}
                onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Additional details about the deal..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowDealModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !newDeal.title || !newDeal.contact_id || !newDeal.stage_id || !newDeal.value}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : selectedDeal ? 'Update Deal' : 'Create Deal'}
              </button>
            </div>
          </form>
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
              <h1 className="text-2xl font-bold text-gray-800">Sales Pipeline</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Total Pipeline Value:</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(pipeline.stages.reduce((sum, stage) => sum + stage.total_value, 0))}
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedDeal(null);
                  resetNewDeal();
                  setShowDealModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Deal
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pipeline Summary */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {pipeline.stages.map(stage => (
            <div key={stage.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center mb-2">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: stage.color }}
                />
                <h3 className="text-sm font-semibold text-gray-800">{stage.name}</h3>
              </div>
              <div className="text-2xl font-bold text-gray-800">{stage.deals_count}</div>
              <div className="text-sm text-gray-600">
                {formatCurrency(stage.total_value)}
              </div>
            </div>
          ))}
        </div>
        
        {/* Pipeline Board */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex space-x-6 overflow-x-auto pb-4">
              {pipeline.stages.length > 0 ? (
                pipeline.stages.map(renderStageColumn)
              ) : (
                <div className="text-center py-12 w-full">
                  <i className="fas fa-funnel-dollar text-6xl text-gray-400 mb-4"></i>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Pipeline Data</h2>
                  <p className="text-gray-600">
                    Pipeline stages and deals will appear here
                  </p>
                </div>
              )}
            </div>
          </DragDropContext>
        </div>
      </div>
      
      {/* Deal Modal */}
      <AnimatePresence>
        {showDealModal && renderDealModal()}
      </AnimatePresence>
    </div>
  );
};

export default SalesPipeline;