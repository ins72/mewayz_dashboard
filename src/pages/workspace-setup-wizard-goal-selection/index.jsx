import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWizard } from '../../contexts/WizardContext';
import WizardContainer from '../workspace-setup-wizard-welcome-basics/components/WizardContainer';
import WizardNavigation from '../workspace-setup-wizard-welcome-basics/components/WizardNavigation';
import GoalCard from './components/GoalCard';
import SmartRecommendations from './components/SmartRecommendations';
import workspaceService from '../../utils/workspaceService';

const WorkspaceSetupWizardGoalSelection = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    formData,
    updateFormData,
    nextStep,
    previousStep,
    setError,
    clearError,
    errors,
    setLoading,
    currentStep
  } = useWizard();

  const [goals, setGoals] = useState([]);
  const [localErrors, setLocalErrors] = useState({});
  const [goalsLoading, setGoalsLoading] = useState(true);

  const step1Data = formData.step1;
  const step2Data = formData.step2;

  // Redirect if not authenticated or step not accessible
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login-screen');
      return;
    }

    if (currentStep !== 2) {
      navigate('/workspace-setup-wizard-welcome-basics');
      return;
    }
  }, [user, authLoading, navigate, currentStep]);

  // Load goals
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setGoalsLoading(true);
      clearError('goals');

      const result = await workspaceService.getGoals();

      if (result.success) {
        setGoals(result.data);
      } else {
        setError('goals', result.error);
      }
    } catch (error) {
      setError('goals', 'Failed to load goals');
      console.log('Error loading goals:', error);
    } finally {
      setGoalsLoading(false);
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!step2Data.selectedGoals || step2Data.selectedGoals.length === 0) {
      newErrors.goals = 'Please select at least one goal';
    }

    // Check for valid priorities
    const priorities = step2Data.selectedGoals.map(g => g.priority);
    const uniquePriorities = [...new Set(priorities)];
    
    if (priorities.length !== uniquePriorities.length) {
      newErrors.priorities = 'Each goal must have a unique priority level';
    }

    if (step2Data.selectedGoals.some(g => !g.priority || g.priority < 1 || g.priority > 6)) {
      newErrors.priorities = 'All selected goals must have a priority between 1-6';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle goal selection
  const handleGoalSelect = (goalId) => {
    const isSelected = step2Data.selectedGoals.some(g => g.goalId === goalId);
    
    if (isSelected) {
      // Remove goal
      const updatedGoals = step2Data.selectedGoals.filter(g => g.goalId !== goalId);
      // Reorder priorities to fill gaps
      const reorderedGoals = updatedGoals.map((goal, index) => ({
        ...goal,
        priority: index + 1
      }));
      updateFormData('step2', { selectedGoals: reorderedGoals });
    } else {
      // Add goal with next available priority
      const nextPriority = step2Data.selectedGoals.length + 1;
      if (nextPriority <= 6) {
        const newGoal = {
          goalId,
          priority: nextPriority,
          setupNow: false
        };
        updateFormData('step2', { 
          selectedGoals: [...step2Data.selectedGoals, newGoal] 
        });
      }
    }

    // Clear errors
    if (localErrors.goals) {
      setLocalErrors(prev => ({ ...prev, goals: undefined }));
    }
  };

  // Handle priority change
  const handlePriorityChange = (goalId, newPriority) => {
    const updatedGoals = step2Data.selectedGoals.map(goal => {
      if (goal.goalId === goalId) {
        return { ...goal, priority: newPriority };
      }
      // Swap priorities if conflict
      if (goal.priority === newPriority) {
        const currentGoal = step2Data.selectedGoals.find(g => g.goalId === goalId);
        return { ...goal, priority: currentGoal.priority };
      }
      return goal;
    });

    updateFormData('step2', { selectedGoals: updatedGoals });
    
    if (localErrors.priorities) {
      setLocalErrors(prev => ({ ...prev, priorities: undefined }));
    }
  };

  // Handle setup now toggle
  const handleSetupToggle = (goalId, setupNow) => {
    const updatedGoals = step2Data.selectedGoals.map(goal =>
      goal.goalId === goalId ? { ...goal, setupNow } : goal
    );
    updateFormData('step2', { selectedGoals: updatedGoals });
  };

  // Handle navigation
  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      clearError('form');

      // TODO: Proceed to next step
      nextStep();
      // Navigate to step 3 when implemented
      // navigate('/workspace-setup-wizard-feature-selection');
      
      // For now, show completion message
      setError('form', 'Goal selection completed! Feature selection step coming soon.');
      
    } catch (error) {
      setError('form', 'Something went wrong. Please try again.');
      console.log('Error proceeding to next step:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    previousStep();
    navigate('/workspace-setup-wizard-welcome-basics');
  };

  // Loading state
  if (authLoading || goalsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading goals...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Error state
  if (errors.goals) {
    return (
      <WizardContainer
        title="Goal Selection"
        description="Define your primary business objectives to customize your workspace experience."
      >
        <div className="text-center py-12">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-400 mb-4">{errors.goals}</p>
            <button
              onClick={loadGoals}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </WizardContainer>
    );
  }

  return (
    <WizardContainer
      title="Goal Selection"
      description="Choose your primary business objectives. These goals will help us recommend the right features and configure your workspace for success."
    >
      <div className="space-y-8">
        {/* Progress Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-2">
            Step 2: Define Your Objectives 🎯
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Select up to 6 goals and prioritize them (1 = highest priority). You can always modify these later, 
            but this helps us set up your workspace with the most relevant features first.
          </p>
        </motion.div>

        {/* Goals Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xl font-semibold text-white">
              Available Goals ({goals.length})
            </h4>
            <div className="text-sm text-gray-400">
              Selected: {step2Data.selectedGoals.length}/6
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal, index) => {
              const selectedGoal = step2Data.selectedGoals.find(g => g.goalId === goal.id);
              const isSelected = !!selectedGoal;
              const isDisabled = !isSelected && step2Data.selectedGoals.length >= 6;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                >
                  <GoalCard
                    goal={goal}
                    isSelected={isSelected}
                    priority={selectedGoal?.priority}
                    setupNow={selectedGoal?.setupNow || false}
                    onSelect={handleGoalSelect}
                    onPriorityChange={handlePriorityChange}
                    onSetupToggle={handleSetupToggle}
                    disabled={isDisabled}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Smart Recommendations */}
        <SmartRecommendations
          selectedGoals={step2Data.selectedGoals}
          industry={step1Data.industry}
          teamSize={step1Data.teamSize}
          goals={goals}
        />

        {/* Validation Errors */}
        {(localErrors.goals || localErrors.priorities) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
          >
            {localErrors.goals && (
              <p className="text-red-400 text-sm mb-2">{localErrors.goals}</p>
            )}
            {localErrors.priorities && (
              <p className="text-red-400 text-sm">{localErrors.priorities}</p>
            )}
          </motion.div>
        )}

        {/* Form Error */}
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
          >
            <p className="text-blue-400 text-sm">{errors.form}</p>
          </motion.div>
        )}

        {/* Navigation */}
        <WizardNavigation
          onNext={handleNext}
          onBack={handleBack}
          nextLabel="Continue to Features"
          backLabel="Back to Basics"
        />
      </div>
    </WizardContainer>
  );
};

export default WorkspaceSetupWizardGoalSelection;