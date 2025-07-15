import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '../contexts/WorkspaceContext';
import crmService from '../services/crmService';

const CRMManagement = () => {
  const { currentWorkspace } = useWorkspace();
  const workspaceId = currentWorkspace?.id;
  const [contacts, setContacts] = useState([]);
  const [pipeline, setPipeline] = useState({ stages: [], deals: [] });
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    source: '',
    tags: []
  });
  const [newDeal, setNewDeal] = useState({
    title: '',
    contact_id: '',
    value: '',
    stage_id: '',
    probability: 50,
    expected_close: ''
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    contact_id: '',
    deal_id: '',
    type: 'call',
    priority: 'medium',
    due_date: ''
  });

  useEffect(() => {
    loadContacts();
    loadPipeline();
    loadTasks();
    loadAnalytics();
  }, [workspaceId]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const response = await crmService.getContacts(workspaceId);
      if (response.success) {
        setContacts(response.data || []);
      }
    } catch (error) {
      console.error('Error loading contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPipeline = async () => {
    try {
      const response = await crmService.getPipeline(workspaceId);
      if (response.success) {
        setPipeline(response.data || { stages: [], deals: [] });
      }
    } catch (error) {
      console.error('Error loading pipeline:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await crmService.getTasks(workspaceId);
      if (response.success) {
        setTasks(response.data || []);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await crmService.getCrmAnalytics(workspaceId);
      if (response.success) {
        setAnalytics(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleCreateContact = async () => {
    setIsLoading(true);
    try {
      const response = await crmService.createContact(workspaceId, newContact);
      if (response.success) {
        setContacts([...contacts, response.data]);
        setShowContactModal(false);
        resetNewContact();
      }
    } catch (error) {
      console.error('Error creating contact:', error);
    } finally {
      setIsLoading(false);
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

  const handleCreateTask = async () => {
    setIsLoading(true);
    try {
      const response = await crmService.createTask(workspaceId, newTask);
      if (response.success) {
        setTasks([...tasks, response.data]);
        setShowTaskModal(false);
        resetNewTask();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    try {
      await crmService.updateTaskStatus(taskId, status);
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status, updated_at: new Date().toISOString() } : task
      ));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleUpdateDealStage = async (dealId, stageId) => {
    try {
      await crmService.updateDealStage(dealId, stageId);
      loadPipeline(); // Refresh pipeline
    } catch (error) {
      console.error('Error updating deal stage:', error);
    }
  };

  const handleImportFromEcommerce = async () => {
    setIsLoading(true);
    try {
      const response = await crmService.importFromEcommerce(workspaceId);
      if (response.success) {
        loadContacts(); // Refresh contacts
        alert(`Successfully imported ${response.data.imported_count} contacts from e-commerce orders`);
      }
    } catch (error) {
      console.error('Error importing from e-commerce:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetNewContact = () => {
    setNewContact({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      source: '',
      tags: []
    });
  };

  const resetNewDeal = () => {
    setNewDeal({
      title: '',
      contact_id: '',
      value: '',
      stage_id: '',
      probability: 50,
      expected_close: ''
    });
  };

  const resetNewTask = () => {
    setNewTask({
      title: '',
      description: '',
      contact_id: '',
      deal_id: '',
      type: 'call',
      priority: 'medium',
      due_date: ''
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'prospect':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'call':
        return 'fas fa-phone';
      case 'email':
        return 'fas fa-envelope';
      case 'meeting':
        return 'fas fa-calendar';
      case 'task':
        return 'fas fa-tasks';
      default:
        return 'fas fa-check';
    }
  };

  const renderContactCard = (contact) => (
    <motion.div
      key={contact.id}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => {
        setSelectedContact(contact);
        setShowContactModal(true);
      }}
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {contact.first_name.charAt(0)}{contact.last_name.charAt(0)}
            </span>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-gray-800">
              {contact.first_name} {contact.last_name}
            </h3>
            <p className="text-sm text-gray-600">{contact.position} at {contact.company}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contact.status)}`}>
          {contact.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <i className="fas fa-envelope mr-2"></i>
          {contact.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <i className="fas fa-phone mr-2"></i>
          {contact.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <i className="fas fa-chart-line mr-2"></i>
          Lead Score: {contact.lead_score}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          {contact.tags.map(tag => (
            <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
              {tag}
            </span>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          ${contact.total_value?.toLocaleString() || 0}
        </div>
      </div>
    </motion.div>
  );

  const renderPipelineStage = (stage) => (
    <div key={stage.id} className="bg-gray-50 rounded-lg p-4 min-w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{stage.name}</h3>
        <div className="text-sm text-gray-600">
          {stage.deals_count} deals • ${stage.total_value?.toLocaleString() || 0}
        </div>
      </div>
      
      <div className="space-y-3">
        {pipeline.deals
          .filter(deal => deal.stage_id === stage.id)
          .map(deal => (
            <motion.div
              key={deal.id}
              className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setNewDeal({
                  ...deal,
                  value: deal.value.toString(),
                  expected_close: deal.expected_close?.split('T')[0] || ''
                });
                setShowDealModal(true);
              }}
            >
              <h4 className="font-medium text-gray-800 mb-2">{deal.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{deal.contact_name} • {deal.company}</p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-green-600">
                  ${deal.value?.toLocaleString() || 0}
                </span>
                <span className="text-sm text-gray-500">
                  {deal.probability}% • {new Date(deal.expected_close).toLocaleDateString()}
                </span>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );

  const renderTaskCard = (task) => (
    <motion.div
      key={task.id}
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <i className={`${getTaskTypeIcon(task.type)} text-blue-600 mr-3`}></i>
          <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {task.status}
          </span>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          <span className="font-medium">{task.contact_name}</span>
          {task.deal_title && <span> • {task.deal_title}</span>}
        </div>
        <div className="flex items-center space-x-2">
          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
          {task.status === 'pending' && (
            <button
              onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
            >
              Complete
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderContactModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedContact ? 'Edit Contact' : 'Create New Contact'}
            </h2>
            <button
              onClick={() => setShowContactModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleCreateContact(); }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={newContact.first_name}
                  onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={newContact.last_name}
                  onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  type="text"
                  value={newContact.company}
                  onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <input
                  type="text"
                  value={newContact.position}
                  onChange={(e) => setNewContact({ ...newContact, position: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source
              </label>
              <select
                value={newContact.source}
                onChange={(e) => setNewContact({ ...newContact, source: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Source</option>
                <option value="website">Website</option>
                <option value="referral">Referral</option>
                <option value="social_media">Social Media</option>
                <option value="cold_outreach">Cold Outreach</option>
                <option value="event">Event</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowContactModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !newContact.first_name || !newContact.last_name || !newContact.email}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Saving...' : selectedContact ? 'Update Contact' : 'Create Contact'}
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
              <h1 className="text-2xl font-bold text-gray-800">CRM Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleImportFromEcommerce}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center"
              >
                <i className="fas fa-download mr-2"></i>
                Import from E-commerce
              </button>
              <button
                onClick={() => {
                  setSelectedContact(null);
                  resetNewContact();
                  setShowContactModal(true);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Contact
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <i className="fas fa-users text-blue-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Contacts</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.overview.total_contacts}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <i className="fas fa-handshake text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Deals</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.overview.active_deals}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <i className="fas fa-dollar-sign text-purple-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Deal Value</p>
                  <p className="text-2xl font-bold text-gray-800">${analytics.overview.total_deal_value.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <i className="fas fa-percentage text-yellow-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-800">{analytics.overview.conversion_rate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8 w-fit">
          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'contacts' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-users mr-2"></i>
            Contacts
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pipeline' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-funnel-dollar mr-2"></i>
            Pipeline
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tasks' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <i className="fas fa-tasks mr-2"></i>
            Tasks
          </button>
        </div>
        
        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'contacts' && (
            <motion.div
              key="contacts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {contacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contacts.map(renderContactCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-users text-6xl text-gray-400 mb-4"></i>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Contacts Yet</h2>
                  <p className="text-gray-600 mb-6">
                    Add your first contact or import from e-commerce orders
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => {
                        setSelectedContact(null);
                        resetNewContact();
                        setShowContactModal(true);
                      }}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add Contact
                    </button>
                    <button
                      onClick={handleImportFromEcommerce}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <i className="fas fa-download mr-2"></i>
                      Import from E-commerce
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
          
          {activeTab === 'pipeline' && (
            <motion.div
              key="pipeline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex space-x-6 overflow-x-auto pb-4">
                {pipeline.stages.map(renderPipelineStage)}
              </div>
            </motion.div>
          )}
          
          {activeTab === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Tasks</h2>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Task
                </button>
              </div>
              
              {tasks.length > 0 ? (
                <div className="space-y-4">
                  {tasks.map(renderTaskCard)}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-tasks text-6xl text-gray-400 mb-4"></i>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Tasks Yet</h2>
                  <p className="text-gray-600 mb-6">
                    Create your first task to start managing your follow-ups
                  </p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Create Task
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {showContactModal && renderContactModal()}
      </AnimatePresence>
    </div>
  );
};

export default CRMManagement;