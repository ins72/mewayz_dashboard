import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import invitationService from '../utils/invitationService';
import workspaceService from '../services/workspaceService';
import subscriptionService from '../utils/subscriptionService';
import brandingService from '../utils/brandingService';

const WizardContext = createContext();

// Wizard steps configuration
const WIZARD_STEPS = {
  WELCOME_BASICS: 1,
  GOAL_SELECTION: 2,
  FEATURE_SELECTION: 3,
  SUBSCRIPTION_PLAN: 4,
  TEAM_SETUP: 5,
  BRANDING_CONFIGURATION: 6
};

// Initial state for the wizard
const initialState = {
  currentStep: 1,
  isLoading: false,
  errors: {},
  formData: {
    // Step 1: Welcome & Basics
    step1: {
      workspaceName: '',
      industry: '',
      teamSize: '',
      businessType: '',
      businessDescription: '',
      timezone: '',
      currency: 'USD'
    },
    // Step 2: Goal Selection
    step2: {
      selectedGoals: [] // Array of { goalId, priority, setupNow }
    },
    // Step 3: Feature Selection
    step3: {
      selectedFeatures: [] // Array of { featureId, isEnabled, priority }
    },
    // Step 4: Subscription Plan
    step4: {
      selectedPlan: '',
      billingCycle: 'monthly',
      selectedFeatureCount: 0,
      estimatedCost: null
    },
    // Step 5: Team Setup
    step5: {
      invitations: [],
      teamStructure: {
        departments: [],
        roles: []
      }
    },
    // Step 6: Branding Configuration
    step6: {
      branding: {
        logo: null,
        primaryColor: '#007AFF',
        secondaryColor: '#6C5CE7',
        fontFamily: 'Inter',
        customDomain: ''
      },
      whiteLabelSettings: {
        removeWatermark: false,
        customLoginPage: false,
        customEmails: false
      }
    }
  },
  completedSteps: new Set(),
  workspaceId: null,
  setupProgress: {}
};

// Reducer for wizard state management
const wizardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
        errors: {}
      };
    
    case 'NEXT_STEP':
      const nextStep = Math.min(state.currentStep + 1, 6);
      return {
        ...state,
        currentStep: nextStep,
        completedSteps: new Set([...state.completedSteps, state.currentStep]),
        errors: {}
      };
    
    case 'PREVIOUS_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
        errors: {}
      };
    
    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.step]: {
            ...state.formData[action.payload.step],
            ...action.payload.data
          }
        }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.field]: action.payload.message
        }
      };
    
    case 'CLEAR_ERROR':
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return {
        ...state,
        errors: newErrors
      };
    
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {}
      };
    
    case 'SET_WORKSPACE_ID':
      return {
        ...state,
        workspaceId: action.payload
      };
    
    case 'SET_SETUP_PROGRESS':
      return {
        ...state,
        setupProgress: action.payload
      };
    
    case 'RESET_WIZARD':
      return {
        ...initialState,
        workspaceId: state.workspaceId
      };
    
    default:
      return state;
  }
};

// WizardProvider component
export const WizardProvider = ({ children }) => {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const navigate = useNavigate();

  // Initialize workspace and load progress
  useEffect(() => {
    initializeWorkspace();
  }, []);

  // Auto-save progress when form data changes
  useEffect(() => {
    if (state.workspaceId && state.currentStep > 1) {
      saveProgressToServer();
    }
  }, [state.formData, state.currentStep]);

  // Initialize workspace
  const initializeWorkspace = async () => {
    try {
      // Check if we have a workspace ID from URL params or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const workspaceId = urlParams.get('workspace') || localStorage.getItem('currentWorkspaceId');
      
      if (workspaceId) {
        dispatch({ type: 'SET_WORKSPACE_ID', payload: workspaceId });
        await loadSetupProgress(workspaceId);
      }
    } catch (error) {
      console.error('Error initializing workspace:', error);
    }
  };

  // Load setup progress from server
  const loadSetupProgress = async (workspaceId) => {
    try {
      const result = await workspaceService.getSetupProgress(workspaceId);
      if (result.success && result.data) {
        dispatch({ type: 'SET_SETUP_PROGRESS', payload: result.data });
        
        // Restore form data if available
        if (result.data.formData) {
          Object.keys(result.data.formData).forEach(step => {
            dispatch({
              type: 'UPDATE_FORM_DATA',
              payload: {
                step,
                data: result.data.formData[step]
              }
            });
          });
        }
        
        // Set current step
        if (result.data.currentStep) {
          dispatch({ type: 'SET_CURRENT_STEP', payload: result.data.currentStep });
        }
      }
    } catch (error) {
      console.error('Error loading setup progress:', error);
    }
  };

  // Save progress to server
  const saveProgressToServer = async () => {
    if (!state.workspaceId) return;
    
    try {
      await workspaceService.saveSetupProgress(state.workspaceId, state.currentStep, {
        formData: state.formData,
        currentStep: state.currentStep,
        completedSteps: Array.from(state.completedSteps)
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Navigation functions
  const goToStep = (step) => {
    if (step >= 1 && step <= 6) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
      
      // Navigate to the appropriate route
      const routes = {
        1: '/workspace-setup-wizard-welcome-basics',
        2: '/workspace-setup-wizard-goal-selection',
        3: '/workspace-setup-wizard-feature-selection',
        4: '/workspace-setup-wizard-subscription-plan',
        5: '/workspace-setup-wizard-team-setup',
        6: '/workspace-setup-wizard-branding'
      };
      
      if (routes[step]) {
        navigate(routes[step]);
      }
    }
  };

  const nextStep = () => {
    dispatch({ type: 'NEXT_STEP' });
  };

  const previousStep = () => {
    dispatch({ type: 'PREVIOUS_STEP' });
  };

  // Form data management
  const updateFormData = (step, data) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: { step, data }
    });
  };

  // Loading state management
  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  // Error management
  const setError = (field, message) => {
    dispatch({
      type: 'SET_ERROR',
      payload: { field, message }
    });
  };

  const clearError = (field) => {
    dispatch({ type: 'CLEAR_ERROR', payload: field });
  };

  const clearAllErrors = () => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  };

  // Validation functions
  const validateStep = (stepNumber) => {
    const step = `step${stepNumber}`;
    const stepData = state.formData[step];
    const errors = {};

    switch (stepNumber) {
      case 1:
        if (!stepData.workspaceName?.trim()) {
          errors.workspaceName = 'Workspace name is required';
        }
        if (!stepData.industry?.trim()) {
          errors.industry = 'Industry is required';
        }
        if (!stepData.teamSize?.trim()) {
          errors.teamSize = 'Team size is required';
        }
        break;

      case 2:
        if (!stepData.selectedGoals || stepData.selectedGoals.length === 0) {
          errors.goals = 'Please select at least one goal';
        }
        break;

      case 3:
        if (!stepData.selectedFeatures || stepData.selectedFeatures.length === 0) {
          errors.features = 'Please select at least one feature';
        }
        const enabledFeatures = stepData.selectedFeatures?.filter(f => f.isEnabled) || [];
        if (enabledFeatures.length === 0) {
          errors.features = 'Please enable at least one feature';
        }
        break;

      case 4:
        if (!stepData.selectedPlan) {
          errors.plan = 'Please select a subscription plan';
        }
        break;

      case 5:
        // Team setup is optional
        break;

      case 6:
        // Branding is optional
        break;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  // Complete setup
  const completeSetup = async () => {
    try {
      setLoading(true);
      clearAllErrors();

      // Validate all steps
      let allValid = true;
      for (let i = 1; i <= 6; i++) {
        const validation = validateStep(i);
        if (!validation.isValid) {
          Object.keys(validation.errors).forEach(field => {
            setError(field, validation.errors[field]);
          });
          allValid = false;
        }
      }

      if (!allValid) {
        setError('global', 'Please complete all required fields');
        return false;
      }

      // Send all data to complete workspace setup
      const result = await workspaceService.completeWorkspaceSetup(state.workspaceId, {
        ...state.formData,
        completedSteps: Array.from(state.completedSteps)
      });

      if (result.success) {
        // Clear the wizard data
        dispatch({ type: 'RESET_WIZARD' });
        localStorage.removeItem('currentWorkspaceId');
        return true;
      } else {
        setError('global', result.error || 'Failed to complete setup');
        return false;
      }
    } catch (error) {
      setError('global', 'An error occurred while completing setup');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    // State
    currentStep: state.currentStep,
    isLoading: state.isLoading,
    errors: state.errors,
    formData: state.formData,
    completedSteps: state.completedSteps,
    workspaceId: state.workspaceId,
    setupProgress: state.setupProgress,

    // Navigation
    goToStep,
    nextStep,
    previousStep,

    // Form data
    updateFormData,

    // Loading
    setLoading,

    // Errors
    setError,
    clearError,
    clearAllErrors,

    // Validation
    validateStep,

    // Setup completion
    completeSetup,

    // Constants
    WIZARD_STEPS
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
};

// Custom hook to use the wizard context
export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

export default WizardContext;