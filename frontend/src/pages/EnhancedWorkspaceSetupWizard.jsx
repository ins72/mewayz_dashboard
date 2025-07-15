import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, ArrowRight, ArrowLeft, Settings, Target, Zap, Users, CreditCard, Palette } from 'lucide-react';

// Step Components
import WelcomeBasics from './workspace-setup-wizard-welcome-basics';
import GoalSelection from './workspace-setup-wizard-goal-selection';
import FeatureSelection from './workspace-setup-wizard-feature-selection';
import SubscriptionPlan from './workspace-setup-wizard-subscription-plan';
import TeamSetup from './workspace-setup-wizard-team-setup';
import BrandingConfiguration from './workspace-setup-wizard-branding';

// Contexts
import { useAuth } from '../contexts/AuthContext';
import { useWizard } from '../contexts/WizardContext';

const EnhancedWorkspaceSetupWizard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { currentStep, formData, isLoading, errors } = useWizard();
  const [isComplete, setIsComplete] = useState(false);

  // Wizard steps configuration
  const steps = [
    {
      id: 1,
      title: 'Welcome & Basics',
      description: 'Set up your workspace foundation',
      icon: Settings,
      component: WelcomeBasics,
      route: '/workspace-setup-wizard-welcome-basics'
    },
    {
      id: 2,
      title: 'Goal Selection',
      description: 'Choose your primary business objectives',
      icon: Target,
      component: GoalSelection,
      route: '/workspace-setup-wizard-goal-selection'
    },
    {
      id: 3,
      title: 'Feature Selection',
      description: 'Select and configure your features',
      icon: Zap,
      component: FeatureSelection,
      route: '/workspace-setup-wizard-feature-selection'
    },
    {
      id: 4,
      title: 'Subscription Plan',
      description: 'Choose the perfect plan for your needs',
      icon: CreditCard,
      component: SubscriptionPlan,
      route: '/workspace-setup-wizard-subscription-plan'
    },
    {
      id: 5,
      title: 'Team Setup',
      description: 'Invite team members and define roles',
      icon: Users,
      component: TeamSetup,
      route: '/workspace-setup-wizard-team-setup'
    },
    {
      id: 6,
      title: 'Branding & Finalization',
      description: 'Customize your workspace appearance',
      icon: Palette,
      component: BrandingConfiguration,
      route: '/workspace-setup-wizard-branding'
    }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login-screen');
    }
  }, [user, authLoading, navigate]);

  // Handle completion
  useEffect(() => {
    if (currentStep > 6) {
      setIsComplete(true);
      // Redirect to dashboard after a delay
      setTimeout(() => {
        navigate('/dashboard-screen');
      }, 3000);
    }
  }, [currentStep, navigate]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading workspace setup...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Completion state
  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Setup Complete!</h1>
          <p className="text-gray-300 mb-6">
            Your workspace has been successfully configured. You're now ready to start building your business.
          </p>
          <div className="flex items-center justify-center space-x-2 text-blue-400">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
            <span>Redirecting to your dashboard...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Get current step component
  const getCurrentStepComponent = () => {
    const step = steps.find(s => s.id === currentStep);
    if (!step) return null;

    const Component = step.component;
    return <Component />;
  };

  // Calculate progress percentage
  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black">
      {/* Progress Header */}
      <div className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>Workspace Setup Progress</span>
                <span>{currentStep} of {steps.length}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Step Navigation */}
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                const isUpcoming = step.id > currentStep;
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
                  >
                    <div className="flex items-center">
                      <div
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                          ${isCompleted 
                            ? 'bg-green-500 border-green-500 text-white' 
                            : isActive 
                              ? 'bg-blue-500 border-blue-500 text-white' 
                              : 'border-gray-600 text-gray-400'
                          }
                        `}
                      >
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <div className="ml-3 hidden sm:block">
                        <div
                          className={`
                            text-sm font-medium
                            ${isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-gray-400'}
                          `}
                        >
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-4 hidden sm:block">
                        <div
                          className={`
                            h-0.5 transition-all duration-300
                            ${isCompleted ? 'bg-green-500' : 'bg-gray-700'}
                          `}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {getCurrentStepComponent()}
      </div>

      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-white">Processing your setup...</p>
          </div>
        </div>
      )}

      {/* Global Error Display */}
      {errors.global && (
        <div className="fixed bottom-4 right-4 bg-red-900/90 border border-red-500/50 rounded-lg p-4 max-w-md z-50">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
              <Circle className="w-3 h-3 text-white" />
            </div>
            <div>
              <h4 className="text-white font-medium">Setup Error</h4>
              <p className="text-red-200 text-sm mt-1">{errors.global}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedWorkspaceSetupWizard;