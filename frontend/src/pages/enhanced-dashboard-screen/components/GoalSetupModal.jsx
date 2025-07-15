import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { useDashboard } from './DashboardProvider';

const GoalSetupModal = () => {
  const { showGoalSetupModal, selectedGoal, closeGoalSetup, setupGoal } = useDashboard();
  const [currentStep, setCurrentStep] = useState(0);
  const [setupData, setSetupData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!showGoalSetupModal || !selectedGoal) return null;

  // Define setup steps based on goal type
  const getSetupSteps = (goalSlug) => {
    const commonSteps = [
      {
        id: 'basic',
        title: 'Basic Configuration',
        description: 'Set up basic goal parameters'
      },
      {
        id: 'features',
        title: 'Feature Selection',
        description: 'Choose which features to enable'
      },
      {
        id: 'review',
        title: 'Review & Confirm',
        description: 'Review your configuration'
      }
    ];

    const goalSpecificSteps = {
      'instagram': [
        {
          id: 'account',
          title: 'Connect Instagram',
          description: 'Connect your Instagram account'
        },
        ...commonSteps
      ],
      'link_in_bio': [
        {
          id: 'domain',
          title: 'Domain Setup',
          description: 'Choose your bio link domain'
        },
        ...commonSteps
      ],
      'courses': [
        {
          id: 'school',
          title: 'School Setup',
          description: 'Configure your online school'
        },
        ...commonSteps
      ],
      'ecommerce': [
        {
          id: 'store',
          title: 'Store Configuration',
          description: 'Set up your online store'
        },
        ...commonSteps
      ],
      'crm': [
        {
          id: 'contacts',
          title: 'Contact Import',
          description: 'Import existing contacts'
        },
        ...commonSteps
      ],
      'analytics': [
        {
          id: 'tracking',
          title: 'Tracking Setup',
          description: 'Configure analytics tracking'
        },
        ...commonSteps
      ]
    };

    return goalSpecificSteps[goalSlug] || commonSteps;
  };

  const steps = getSetupSteps(selectedGoal.slug);

  const handleStepData = (stepId, data) => {
    setSetupData(prev => ({
      ...prev,
      [stepId]: { ...prev[stepId], ...data }
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    
    try {
      const result = await setupGoal(selectedGoal.id, setupData);
      
      if (result.success) {
        closeGoalSetup();
      } else {
        // Handle error
        console.error('Setup failed:', result.error);
      }
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'account':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Connect Your Instagram Account
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect your Instagram Business account to manage posts and analytics.
              </p>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                    Instagram Business Account Required
                  </p>
                  <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                    You need an Instagram Business account to use our management features.
                  </p>
                </div>
              </div>
            </div>
            
            <button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              onClick={() => handleStepData('account', { connected: true })}
            >
              Connect Instagram Account
            </button>
          </div>
        );
        
      case 'domain':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose Your Bio Link URL
              </label>
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400">mewayz.bio/</span>
                <input
                  type="text"
                  placeholder="yourname"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onChange={(e) => handleStepData('domain', { subdomain: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Page Title
              </label>
              <input
                type="text"
                placeholder="Your Name or Brand"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onChange={(e) => handleStepData('domain', { title: e.target.value })}
              />
            </div>
          </div>
        );
        
      case 'basic':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goal Priority
              </label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onChange={(e) => handleStepData('basic', { priority: e.target.value })}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Audience
              </label>
              <textarea
                rows={3}
                placeholder="Describe your target audience..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onChange={(e) => handleStepData('basic', { audience: e.target.value })}
              />
            </div>
          </div>
        );
        
      case 'features':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Select Features to Enable
            </h3>
            
            {/* Mock features for the goal */}
            {[
              { id: 'feature1', name: 'Basic Analytics', description: 'Track basic metrics' },
              { id: 'feature2', name: 'Advanced Reports', description: 'Detailed reporting' },
              { id: 'feature3', name: 'Team Collaboration', description: 'Work with team members' }
            ].map((feature) => (
              <label key={feature.id} className="flex items-start gap-3 p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  onChange={(e) => {
                    const features = setupData.features || {};
                    handleStepData('features', {
                      features: {
                        ...features,
                        [feature.id]: e.target.checked
                      }
                    });
                  }}
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{feature.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{feature.description}</p>
                </div>
              </label>
            ))}
          </div>
        );
        
      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Review Configuration
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Goal</h4>
                <p className="text-gray-600 dark:text-gray-400">{selectedGoal.name}</p>
              </div>
              
              {Object.entries(setupData).map(([key, value]) => (
                <div key={key}>
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">{key}</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Check size={20} className="text-green-600" />
                <p className="text-green-800 dark:text-green-200">
                  Ready to complete setup! This goal will be activated once confirmed.
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Setup step not implemented
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
              style={{ backgroundColor: selectedGoal.icon_color || '#6B7280' }}
            >
              {selectedGoal.name?.charAt(0) || 'G'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Setup {selectedGoal.name}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>
          <button
            onClick={closeGoalSetup}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  index <= currentStep 
                    ? 'bg-blue-600' :'bg-gray-300 dark:bg-gray-600'
                }`} />
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${
                    index < currentStep 
                      ? 'bg-blue-600' :'bg-gray-300 dark:bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2">
            <h3 className="font-medium text-gray-900 dark:text-white">
              {steps[currentStep]?.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {steps[currentStep]?.description}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {renderStepContent()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={closeGoalSetup}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Complete Setup
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalSetupModal;