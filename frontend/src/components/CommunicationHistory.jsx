import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import crmService from '../services/crmService';

const CommunicationHistory = ({ contactId, onClose }) => {
  const [communications, setCommunications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCommunication, setNewCommunication] = useState({
    type: 'email',
    direction: 'outbound',
    subject: '',
    summary: '',
    duration: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (contactId) {
      loadCommunications();
    }
  }, [contactId]);

  const loadCommunications = async () => {
    setIsLoading(true);
    try {
      const response = await crmService.getCommunicationHistory(contactId);
      if (response.success) {
        setCommunications(response.data || []);
      }
    } catch (error) {
      console.error('Error loading communications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCommunication = async () => {
    setIsLoading(true);
    try {
      const response = await crmService.addCommunication(contactId, newCommunication);
      if (response.success) {
        setCommunications([response.data, ...communications]);
        setShowAddModal(false);
        resetNewCommunication();
      }
    } catch (error) {
      console.error('Error adding communication:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewCommunication = () => {
    setNewCommunication({
      type: 'email',
      direction: 'outbound',
      subject: '',
      summary: '',
      duration: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const getCommunicationIcon = (type) => {
    switch (type) {
      case 'email':
        return 'fas fa-envelope';
      case 'call':
        return 'fas fa-phone';
      case 'meeting':
        return 'fas fa-calendar';
      case 'note':
        return 'fas fa-sticky-note';
      default:
        return 'fas fa-comment';
    }
  };

  const getCommunicationColor = (type, direction) => {
    const baseColor = type === 'email' ? 'blue' : 
                     type === 'call' ? 'green' : 
                     type === 'meeting' ? 'purple' : 'gray';
    
    return direction === 'inbound' ? 
      `bg-${baseColor}-100 text-${baseColor}-800` : 
      `bg-${baseColor}-200 text-${baseColor}-900`;
  };

  const renderCommunicationItem = (communication) => (
    <motion.div
      key={communication.id}
      className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={`p-2 rounded-full mr-3 ${getCommunicationColor(communication.type, communication.direction)}`}>
            <i className={`${getCommunicationIcon(communication.type)} text-sm`}></i>
          </div>
          <div>
            <h4 className="font-medium text-gray-800">{communication.subject}</h4>
            <p className="text-sm text-gray-600 capitalize">
              {communication.direction} {communication.type}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date(communication.date).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-400">
            {communication.user_name}
          </p>
        </div>
      </div>
      
      <p className="text-gray-700 mb-3">{communication.summary}</p>
      
      {communication.duration && (
        <div className="flex items-center text-sm text-gray-600">
          <i className="fas fa-clock mr-2"></i>
          Duration: {communication.duration}
        </div>
      )}
    </motion.div>
  );

  const renderAddModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-2xl w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Add Communication</h2>
            <button
              onClick={() => setShowAddModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleAddCommunication(); }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={newCommunication.type}
                  onChange={(e) => setNewCommunication({ ...newCommunication, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="email">Email</option>
                  <option value="call">Phone Call</option>
                  <option value="meeting">Meeting</option>
                  <option value="note">Note</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Direction *
                </label>
                <select
                  value={newCommunication.direction}
                  onChange={(e) => setNewCommunication({ ...newCommunication, direction: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={newCommunication.subject}
                onChange={(e) => setNewCommunication({ ...newCommunication, subject: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Follow-up call about proposal"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary *
              </label>
              <textarea
                value={newCommunication.summary}
                onChange={(e) => setNewCommunication({ ...newCommunication, summary: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Brief summary of the communication..."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newCommunication.date}
                  onChange={(e) => setNewCommunication({ ...newCommunication, date: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              {newCommunication.type === 'call' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={newCommunication.duration}
                    onChange={(e) => setNewCommunication({ ...newCommunication, duration: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 30 minutes"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !newCommunication.subject || !newCommunication.summary}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Adding...' : 'Add Communication'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Communication History</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Communication
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : communications.length > 0 ? (
            <div className="space-y-4">
              {communications.map(renderCommunicationItem)}
            </div>
          ) : (
            <div className="text-center py-12">
              <i className="fas fa-comments text-6xl text-gray-400 mb-4"></i>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Communications Yet</h3>
              <p className="text-gray-600 mb-6">
                Start tracking your communications with this contact
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Add First Communication
              </button>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Add Communication Modal */}
      <AnimatePresence>
        {showAddModal && renderAddModal()}
      </AnimatePresence>
    </div>
  );
};

export default CommunicationHistory;