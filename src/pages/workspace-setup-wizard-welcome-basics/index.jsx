import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useWizard } from '../../contexts/WizardContext';
import WizardContainer from './components/WizardContainer';
import IndustrySelector from './components/IndustrySelector';
import TeamSizeSelector from './components/TeamSizeSelector';
import WizardNavigation from './components/WizardNavigation';
import Input from '../../components/ui/Input';
import workspaceService from '../../utils/workspaceService';

const WorkspaceSetupWizardWelcomeBasics = () => {
  const navigate = useNavigate();
  const { user, userProfile, loading: authLoading } = useAuth();
  const {
    formData,
    updateFormData,
    nextStep,
    setError,
    clearError,
    errors,
    setLoading
  } = useWizard();

  const [localErrors, setLocalErrors] = useState({});
  const [slugGenerated, setSlugGenerated] = useState(false);

  const step1Data = formData.step1;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login-screen');
    }
  }, [user, authLoading, navigate]);

  // Auto-generate slug when workspace name changes
  useEffect(() => {
    const generateSlug = async () => {
      if (step1Data.workspaceName && step1Data.workspaceName.length > 2) {
        try {
          const result = await workspaceService.generateSlug(step1Data.workspaceName);
          if (result.success && !slugGenerated) {
            updateFormData('step1', { workspaceSlug: result.data });
            setSlugGenerated(true);
          }
        } catch (error) {
          console.log('Error generating slug:', error);
        }
      }
    };

    if (step1Data.workspaceName && !step1Data.workspaceSlug) {
      generateSlug();
    }
  }, [step1Data.workspaceName, step1Data.workspaceSlug, updateFormData, slugGenerated]);

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!step1Data.workspaceName?.trim()) {
      newErrors.workspaceName = 'Workspace name is required';
    } else if (step1Data.workspaceName.length < 2) {
      newErrors.workspaceName = 'Workspace name must be at least 2 characters';
    }

    if (!step1Data.workspaceSlug?.trim()) {
      newErrors.workspaceSlug = 'Workspace slug is required';
    } else if (!/^[a-z0-9-]+$/.test(step1Data.workspaceSlug)) {
      newErrors.workspaceSlug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    if (!step1Data.industry) {
      newErrors.industry = 'Please select an industry';
    }

    if (!step1Data.teamSize) {
      newErrors.teamSize = 'Please select your team size';
    }

    setLocalErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleNext = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      clearError('form');

      // Check slug availability
      const slugResult = await workspaceService.checkSlugAvailability(step1Data.workspaceSlug);
      
      if (!slugResult.success) {
        setError('form', slugResult.error);
        return;
      }

      if (!slugResult.data) {
        setLocalErrors({ workspaceSlug: 'This workspace URL is already taken' });
        return;
      }

      // Proceed to next step
      nextStep();
      navigate('/workspace-setup-wizard-goal-selection');
    } catch (error) {
      setError('form', 'Something went wrong. Please try again.');
      console.log('Error proceeding to next step:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    updateFormData('step1', { [field]: value });
    
    // Clear errors when user starts typing
    if (localErrors[field]) {
      setLocalErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (errors[field]) {
      clearError(field);
    }

    // Reset slug generation flag when name changes
    if (field === 'workspaceName') {
      setSlugGenerated(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <WizardContainer
      title="Welcome & Workspace Basics"
      description="Let's start by setting up your workspace fundamentals. This information helps us customize your experience and provide relevant recommendations."
    >
      <div className="space-y-8">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6"
        >
          <h3 className="text-xl font-semibold text-white mb-2">
            Welcome to Mewayz, {userProfile?.full_name || user?.email?.split('@')[0]}! 🎉
          </h3>
          <p className="text-gray-300 leading-relaxed">
            We're excited to help you build your workspace. This quick setup will configure your environment 
            with the right tools and features for your business needs.
          </p>
        </motion.div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Workspace Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Input
              label="Workspace Name *"
              placeholder="Enter your workspace name (e.g., 'Acme Marketing')"
              value={step1Data.workspaceName}
              onChange={(e) => handleInputChange('workspaceName', e.target.value)}
              error={localErrors.workspaceName || errors.workspaceName}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            />
          </motion.div>

          {/* Workspace Slug */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Workspace URL *
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-400 text-sm">mewayz.com/</span>
                <Input
                  placeholder="your-workspace-url"
                  value={step1Data.workspaceSlug}
                  onChange={(e) => handleInputChange('workspaceSlug', e.target.value)}
                  error={localErrors.workspaceSlug || errors.workspaceSlug}
                  className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <p className="text-xs text-gray-400">
                This will be your workspace's unique URL. Only lowercase letters, numbers, and hyphens allowed.
              </p>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">
                Description (Optional)
              </label>
              <textarea
                placeholder="Tell us about your workspace and what you plan to achieve..."
                value={step1Data.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>
          </motion.div>

          {/* Industry Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <IndustrySelector
              value={step1Data.industry}
              onChange={(value) => handleInputChange('industry', value)}
              error={localErrors.industry || errors.industry}
            />
          </motion.div>

          {/* Team Size Selector */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <TeamSizeSelector
              value={step1Data.teamSize}
              onChange={(value) => handleInputChange('teamSize', value)}
              error={localErrors.teamSize || errors.teamSize}
            />
          </motion.div>
        </div>

        {/* Form Error */}
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500/30 rounded-lg p-4"
          >
            <p className="text-red-400 text-sm">{errors.form}</p>
          </motion.div>
        )}

        {/* Navigation */}
        <WizardNavigation
          onNext={handleNext}
          nextLabel="Continue to Goals"
          hideBack={true}
        />
      </div>
    </WizardContainer>
  );
};

export default WorkspaceSetupWizardWelcomeBasics;