import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import linkInBioService from '../services/linkInBioService';

const ABTestingDashboard = ({ pageId }) => {
  const [activeTests, setActiveTests] = useState([]);
  const [completedTests, setCompletedTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    hypothesis: '',
    variants: [
      { name: 'Control (A)', changes: [] },
      { name: 'Variant (B)', changes: [] }
    ],
    trafficSplit: 50,
    duration: 14,
    successMetric: 'conversion_rate'
  });

  useEffect(() => {
    loadTestResults();
  }, [pageId]);

  const loadTestResults = async () => {
    setIsLoading(true);
    try {
      const response = await linkInBioService.getABTestResults(pageId);
      if (response.success) {
        setActiveTests(response.data.activeTests || []);
        setCompletedTests(response.data.completedTests || []);
      }
    } catch (error) {
      console.error('Error loading A/B test results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTest = async () => {
    setIsLoading(true);
    try {
      const response = await linkInBioService.createABTest(pageId, newTest);
      if (response.success) {
        setActiveTests([...activeTests, response.data]);
        setShowCreateModal(false);
        setNewTest({
          name: '',
          description: '',
          hypothesis: '',
          variants: [
            { name: 'Control (A)', changes: [] },
            { name: 'Variant (B)', changes: [] }
          ],
          trafficSplit: 50,
          duration: 14,
          successMetric: 'conversion_rate'
        });
      }
    } catch (error) {
      console.error('Error creating A/B test:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopTest = (testId) => {
    // Implementation for stopping a test
    console.log('Stopping test:', testId);
  };

  const renderTestCard = (test, isActive = true) => (
    <motion.div
      key={test.id}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => setSelectedTest(test)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{test.name}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isActive ? 'Active' : 'Completed'}
        </span>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <i className="fas fa-calendar mr-2"></i>
          Started: {new Date(test.startDate).toLocaleDateString()}
          {test.endDate && (
            <span className="ml-2">
              - Ended: {new Date(test.endDate).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {test.variants.map((variant, index) => (
            <div key={variant.id} className="text-center">
              <h4 className="text-sm font-medium text-gray-800 mb-1">{variant.name}</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Visits: {variant.visits.toLocaleString()}</div>
                <div>Conversions: {variant.conversions}</div>
                <div className={`font-medium ${
                  variant.isWinning ? 'text-green-600' : 'text-gray-700'
                }`}>
                  Rate: {variant.conversionRate}%
                  {variant.isWinning && <i className="fas fa-trophy ml-1 text-yellow-500"></i>}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Confidence: {test.confidence}%</span>
            <span className={`font-medium ${
              test.significantDifference ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {test.significantDifference ? 'Significant' : 'Not Significant'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderTestDetails = (test) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{test.name}</h2>
            <button
              onClick={() => setSelectedTest(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Test Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    test.status === 'active' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {test.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Confidence:</span>
                  <span className="font-medium">{test.confidence}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Significant:</span>
                  <span className={`font-medium ${
                    test.significantDifference ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {test.significantDifference ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 mb-2">Performance</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Visits:</span>
                  <span className="font-medium">
                    {test.variants.reduce((sum, v) => sum + v.visits, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Conversions:</span>
                  <span className="font-medium">
                    {test.variants.reduce((sum, v) => sum + v.conversions, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Best Performer:</span>
                  <span className="font-medium text-green-600">
                    {test.variants.find(v => v.isWinning)?.name || 'TBD'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-purple-800 mb-2">Timeline</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Started:</span>
                  <span className="font-medium">
                    {new Date(test.startDate).toLocaleDateString()}
                  </span>
                </div>
                {test.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ended:</span>
                    <span className="font-medium">
                      {new Date(test.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">
                    {test.endDate 
                      ? `${Math.ceil((new Date(test.endDate) - new Date(test.startDate)) / (1000 * 60 * 60 * 24))} days`
                      : 'Ongoing'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Variant Comparison</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {test.variants.map((variant, index) => (
                <div key={variant.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-800">{variant.name}</h4>
                    {variant.isWinning && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Winner
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 mb-1">Visits</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {variant.visits.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 mb-1">Conversions</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {variant.conversions}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-600 mb-1">Conversion Rate</div>
                      <div className="text-3xl font-bold text-blue-600">
                        {variant.conversionRate}%
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${variant.conversionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            {test.status === 'active' && (
              <button
                onClick={() => stopTest(test.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Stop Test
              </button>
            )}
            <button
              onClick={() => setSelectedTest(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );

  const renderCreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Create A/B Test</h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); createTest(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Name *
              </label>
              <input
                type="text"
                value={newTest.name}
                onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Button Color Test"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newTest.description}
                onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Describe what you're testing..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hypothesis
              </label>
              <textarea
                value={newTest.hypothesis}
                onChange={(e) => setNewTest({ ...newTest, hypothesis: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="If I change X, then Y will happen because..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Traffic Split (%)
                </label>
                <input
                  type="number"
                  value={newTest.trafficSplit}
                  onChange={(e) => setNewTest({ ...newTest, trafficSplit: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="10"
                  max="90"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={newTest.duration}
                  onChange={(e) => setNewTest({ ...newTest, duration: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                  max="90"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Success Metric
              </label>
              <select
                value={newTest.successMetric}
                onChange={(e) => setNewTest({ ...newTest, successMetric: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="conversion_rate">Conversion Rate</option>
                <option value="click_rate">Click Rate</option>
                <option value="time_on_page">Time on Page</option>
                <option value="bounce_rate">Bounce Rate</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !newTest.name}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating...' : 'Create Test'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );

  if (isLoading && !activeTests.length && !completedTests.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">A/B Testing Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Test different variations of your page to optimize conversions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
        >
          <i className="fas fa-plus mr-2"></i>
          Create Test
        </button>
      </div>
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <i className="fas fa-flask text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Tests</p>
              <p className="text-2xl font-bold text-gray-800">{activeTests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <i className="fas fa-check-circle text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Completed Tests</p>
              <p className="text-2xl font-bold text-gray-800">{completedTests.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <i className="fas fa-chart-line text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg. Improvement</p>
              <p className="text-2xl font-bold text-gray-800">12.3%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <i className="fas fa-trophy text-yellow-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-800">68%</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Active Tests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Tests</h2>
        {activeTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTests.map(test => renderTestCard(test, true))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <i className="fas fa-flask text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">No active tests. Create your first A/B test!</p>
          </div>
        )}
      </div>
      
      {/* Completed Tests */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Completed Tests</h2>
        {completedTests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTests.map(test => renderTestCard(test, false))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <i className="fas fa-history text-4xl text-gray-400 mb-4"></i>
            <p className="text-gray-600">No completed tests yet.</p>
          </div>
        )}
      </div>
      
      {/* Modals */}
      <AnimatePresence>
        {selectedTest && renderTestDetails(selectedTest)}
        {showCreateModal && renderCreateModal()}
      </AnimatePresence>
    </div>
  );
};

export default ABTestingDashboard;