import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useWizard } from '../../contexts/WizardContext';
import WizardContainer from '../workspace-setup-wizard-welcome-basics/components/WizardContainer';
import WizardNavigation from '../workspace-setup-wizard-welcome-basics/components/WizardNavigation';
import FeatureGroup from './components/FeatureGroup';

import SmartRecommendations from './components/SmartRecommendations';
import FeatureSearch from './components/FeatureSearch';
import workspaceService from '../../services/workspaceService';

const WorkspaceSetupWizardFeatureSelection = () => {
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

  const [features, setFeatures] = useState([]);
  const [goals, setGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [localErrors, setLocalErrors] = useState({});
  const [featuresLoading, setFeaturesLoading] = useState(true);

  const step1Data = formData.step1;
  const step2Data = formData.step2;
  const step3Data = formData.step3;

  // Redirect if not authenticated or step not accessible
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login-screen');
      return;
    }

    if (currentStep !== 3) {
      navigate('/workspace-setup-wizard-goal-selection');
      return;
    }
  }, [user, authLoading, navigate, currentStep]);

  // Load features and goals
  useEffect(() => {
    loadFeatures();
    loadGoals();
  }, []);

  const loadFeatures = async () => {
    try {
      setFeaturesLoading(true);
      clearError('features');

      // Get features for selected goals
      const selectedGoalIds = step2Data?.selectedGoals?.map(g => g.goalId) || [];
      const allFeatures = [];

      for (const goalId of selectedGoalIds) {
        const result = await workspaceService.getFeaturesByGoal(goalId);
        if (result.success) {
          allFeatures.push(...result.data);
        }
      }

      // Remove duplicates and sort
      const uniqueFeatures = allFeatures.filter((feature, index, self) => 
        index === self.findIndex(f => f.id === feature.id)
      );

      setFeatures(uniqueFeatures);
    } catch (error) {
      setError('features', 'Failed to load features');
      console.log('Error loading features:', error);
    } finally {
      setFeaturesLoading(false);
    }
  };

  const loadGoals = async () => {
    try {
      const result = await workspaceService.getGoals();
      if (result.success) {
        setGoals(result.data);
      }
    } catch (error) {
      console.log('Error loading goals:', error);
    }
  };

  // Filter features based on search and category
  const filteredFeatures = useMemo(() => {
    let filtered = features;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(feature =>
        feature.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        feature.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category (goal)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(feature => feature.goal_id === selectedCategory);
    }

    return filtered;
  }, [features, searchTerm, selectedCategory]);

  // Group features by goal
  const featuresByGoal = useMemo(() => {
    const grouped = {};
    
    step2Data?.selectedGoals?.forEach(selectedGoal => {
      const goal = goals.find(g => g.id === selectedGoal.goalId);
      if (goal) {
        grouped[goal.id] = {
          goal,
          features: filteredFeatures.filter(f => f.goal_id === goal.id),
          priority: selectedGoal.priority
        };
      }
    });

    // Sort by goal priority
    return Object.values(grouped).sort((a, b) => a.priority - b.priority);
  }, [filteredFeatures, goals, step2Data?.selectedGoals]);

  // Calculate feature selection stats
  const featureStats = useMemo(() => {
    const totalFeatures = features.length;
    const selectedFeatures = step3Data?.selectedFeatures?.length || 0;
    const enabledFeatures = step3Data?.selectedFeatures?.filter(f => f.isEnabled)?.length || 0;

    return {
      total: totalFeatures,
      selected: selectedFeatures,
      enabled: enabledFeatures
    };
  }, [features, step3Data?.selectedFeatures]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!step3Data?.selectedFeatures || step3Data.selectedFeatures.length === 0) {
      newErrors.features = 'Please select at least one feature';
    }

    const enabledFeatures = step3Data?.selectedFeatures?.filter(f => f.isEnabled) || [];
    if (enabledFeatures.length === 0) {
      newErrors.features = 'Please enable at least one feature';
    }

    // Check for plan limitations (free plan has 10 feature limit)
    if (enabledFeatures.length > 10) {
      newErrors.planLimit = 'Free plan is limited to 10 features. Please upgrade or reduce your selection.';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle feature selection
  const handleFeatureToggle = (featureId, isEnabled) => {
    const currentFeatures = step3Data?.selectedFeatures || [];
    let updatedFeatures;

    const existingFeatureIndex = currentFeatures.findIndex(f => f.featureId === featureId);

    if (existingFeatureIndex >= 0) {
      // Update existing feature
      updatedFeatures = currentFeatures.map((feature, index) =>
        index === existingFeatureIndex
          ? { ...feature, isEnabled }
          : feature
      );
    } else {
      // Add new feature
      updatedFeatures = [
        ...currentFeatures,
        {
          featureId,
          isEnabled,
          priority: isEnabled ? 'high' : 'low'
        }
      ];
    }

    updateFormData('step3', { selectedFeatures: updatedFeatures });
    
    // Clear errors
    if (localErrors.features) {
      setLocalErrors(prev => ({ ...prev, features: undefined }));
    }
  };

  // Handle feature priority change
  const handlePriorityChange = (featureId, priority) => {
    const updatedFeatures = step3Data?.selectedFeatures?.map(feature =>
      feature.featureId === featureId
        ? { ...feature, priority }
        : feature
    ) || [];

    updateFormData('step3', { selectedFeatures: updatedFeatures });
  };

  // Handle bulk selection by goal
  const handleGoalFeatureToggle = (goalId, enabled) => {
    const goalFeatures = features.filter(f => f.goal_id === goalId);
    const currentFeatures = step3Data?.selectedFeatures || [];
    
    let updatedFeatures = [...currentFeatures];

    goalFeatures.forEach(feature => {
      const existingIndex = updatedFeatures.findIndex(f => f.featureId === feature.id);
      
      if (existingIndex >= 0) {
        updatedFeatures[existingIndex] = {
          ...updatedFeatures[existingIndex],
          isEnabled: enabled
        };
      } else if (enabled) {
        updatedFeatures.push({
          featureId: feature.id,
          isEnabled: true,
          priority: 'medium'
        });
      }
    });

    updateFormData('step3', { selectedFeatures: updatedFeatures });
  };

  // Handle navigation
  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      clearError('form');

      nextStep();
      navigate('/workspace-setup-wizard-subscription-plan');
    } catch (error) {
      setError('form', 'Something went wrong. Please try again.');
      console.log('Error proceeding to next step:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    previousStep();
    navigate('/workspace-setup-wizard-goal-selection');
  };

  // Loading state
  if (authLoading || featuresLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading features...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Error state
  if (errors.features) {
    return (
      <WizardContainer
        title="Feature Selection"
        description="Choose the features that will power your workspace experience."
      >
        <div className="text-center py-12">
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-400 mb-4">{errors.features}</p>
            <button
              onClick={loadFeatures}
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
      title="Feature Selection"
      description="Customize your workspace with the features you need. Select and prioritize features based on your goals."
    >
      <div className="space-y-8">
        {/* Progress Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
            Step 3: Feature Configuration ⚙️
          </h3>
          <p className="text-gray-300 leading-relaxed">
            Based on your selected goals, we've organized {features.length} features into categories. 
            Enable the features you need and set their priority levels. Free plan includes up to 10 features.
          </p>
        </motion.div>

        {/* Feature Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{featureStats.total}</div>
            <div className="text-sm text-gray-400">Available Features</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{featureStats.enabled}</div>
            <div className="text-sm text-gray-400">Enabled Features</div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{10 - featureStats.enabled}</div>
            <div className="text-sm text-gray-400">Remaining (Free Plan)</div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <FeatureSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          goals={goals}
          selectedGoals={step2Data?.selectedGoals || []}
        />

        {/* Feature Groups */}
        <div className="space-y-6">
          {featuresByGoal.map((group, index) => (
            <motion.div
              key={group.goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.3 }}
            >
              <FeatureGroup
                goal={group.goal}
                features={group.features}
                priority={group.priority}
                selectedFeatures={step3Data?.selectedFeatures || []}
                onFeatureToggle={handleFeatureToggle}
                onPriorityChange={handlePriorityChange}
                onGoalToggle={handleGoalFeatureToggle}
              />
            </motion.div>
          ))}
        </div>

        {/* Smart Recommendations */}
        <SmartRecommendations
          selectedGoals={step2Data?.selectedGoals || []}
          selectedFeatures={step3Data?.selectedFeatures || []}
          industry={step1Data?.industry}
          teamSize={step1Data?.teamSize}
          features={features}
          goals={goals}
          onFeatureRecommend={handleFeatureToggle}
        />

        {/* Validation Errors */}
        {(localErrors.features || localErrors.planLimit) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
          >
            {localErrors.features && (
              <p className="text-red-400 text-sm mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                {localErrors.features}
              </p>
            )}
            {localErrors.planLimit && (
              <p className="text-yellow-400 text-sm flex items-center">
                <Lightbulb className="h-4 w-4 mr-2" />
                {localErrors.planLimit}
              </p>
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
          nextLabel="Continue to Plans"
          backLabel="Back to Goals"
          nextDisabled={featureStats.enabled === 0}
        />
      </div>
    </WizardContainer>
  );
};

export default WorkspaceSetupWizardFeatureSelection;