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

export const TOTAL_STEPS = 6;

// Initial wizard state
const initialState = {
  currentStep: 1,
  completedSteps: [],
  isLoading: false,
  errors: {},
  formData: {
    step1: {
      workspaceName: '',
      workspaceSlug: '',
      description: '',
      industry: '',
      teamSize: 'solo',
      primaryGoal: ''
    },
    step2: {
      selectedGoals: []
    },
    step3: {
      selectedFeatures: []
    },
    step4: {
      selectedPlan: 'free',
      billingCycle: 'monthly',
      estimatedCost: {
        monthly: 0,
        yearly: 0,
        savings: 0
      }
    },
    step5: {
      invitations: [],
      teamStructure: {
        departments: [],
        roles: []
      }
    },
    step6: {
      branding: {
        primaryColor: '#007AFF',
        secondaryColor: '#6C5CE7',
        fontFamily: 'Inter'
      },
      whiteLabelSettings: {
        removeWatermark: false,
        customLoginPage: false,
        customEmails: false
      }
    }
  }
};

// Wizard reducer
function wizardReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      };

    case 'UPDATE_FORM_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.step]: {
            ...state.formData[action.step],
            ...action.payload
          }
        }
      };

    case 'COMPLETE_STEP':
      const newCompletedSteps = [...state.completedSteps];
      if (!newCompletedSteps.includes(action.payload)) {
        newCompletedSteps.push(action.payload);
      }
      return {
        ...state,
        completedSteps: newCompletedSteps
      };

    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.payload
        }
      };

    case 'CLEAR_ERROR':
      const newErrors = { ...state.errors };
      delete newErrors[action.field];
      return {
        ...state,
        errors: newErrors
      };

    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {}
      };

    case 'LOAD_SAVED_STATE':
      return {
        ...state,
        ...action.payload
      };

    case 'RESET_WIZARD':
      return initialState;

    default:
      return state;
  }
}

export function WizardProvider({ children }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState);
  const { user } = useAuth();

  // Load saved wizard state from localStorage
  useEffect(() => {
    if (user?.id) {
      const savedState = localStorage.getItem(`wizard_state_${user.id}`);
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          dispatch({ type: 'LOAD_SAVED_STATE', payload: parsedState });
        } catch (error) {
          console.log('Error loading saved wizard state:', error);
        }
      }
    }
  }, [user?.id]);

  // Save wizard state to localStorage whenever it changes
  useEffect(() => {
    if (user?.id) {
      const stateToSave = {
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        formData: state.formData
      };
      localStorage.setItem(`wizard_state_${user.id}`, JSON.stringify(stateToSave));
    }
  }, [state.currentStep, state.completedSteps, state.formData, user?.id]);

  // Wizard actions
  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= TOTAL_STEPS) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    }
  };

  const nextStep = () => {
    if (state.currentStep < TOTAL_STEPS) {
      dispatch({ type: 'COMPLETE_STEP', payload: state.currentStep });
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
    }
  };

  const previousStep = () => {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 });
    }
  };

  const updateFormData = (step, data) => {
    dispatch({ type: 'UPDATE_FORM_DATA', step, payload: data });
  };

  const setError = (field, message) => {
    dispatch({ type: 'SET_ERROR', field, payload: message });
  };

  const clearError = (field) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  };

  const clearAllErrors = () => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  };

  const resetWizard = () => {
    dispatch({ type: 'RESET_WIZARD' });
    if (user?.id) {
      localStorage.removeItem(`wizard_state_${user.id}`);
    }
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    return Math.round((state.currentStep / TOTAL_STEPS) * 100);
  };

  // Check if step is accessible
  const isStepAccessible = (step) => {
    if (step === 1) return true;
    return state.completedSteps.includes(step - 1) || state.currentStep >= step;
  };

  // Check if current step is valid
  const canProceedToNextStep = () => {
    const currentStepData = state.formData[`step${state.currentStep}`];
    
    switch (state.currentStep) {
      case WIZARD_STEPS.WELCOME_BASICS:
        return !!(currentStepData?.workspaceName && currentStepData?.industry && currentStepData?.teamSize);
      
      case WIZARD_STEPS.GOAL_SELECTION:
        return currentStepData?.selectedGoals?.length > 0;
      
      case WIZARD_STEPS.FEATURE_SELECTION:
        return currentStepData?.selectedFeatures?.length > 0;
      
      case WIZARD_STEPS.SUBSCRIPTION_PLAN:
        return !!(currentStepData?.selectedPlan);
      
      case WIZARD_STEPS.TEAM_SETUP:
        return true; // Optional step
      
      case WIZARD_STEPS.BRANDING:
        return true; // Optional step
      
      default:
        return false;
    }
  };

  const value = {
    // State
    ...state,
    
    // Computed values
    progressPercentage: getProgressPercentage(),
    isStepAccessible,
    canProceedToNextStep: canProceedToNextStep(),
    
    // Actions
    setLoading,
    goToStep,
    nextStep,
    previousStep,
    updateFormData,
    setError,
    clearError,
    clearAllErrors,
    resetWizard,
    
    // Constants
    WIZARD_STEPS,
    TOTAL_STEPS
  };

  return (
    <WizardContext.Provider value={value}>
      {children}
    </WizardContext.Provider>
  );
}

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};

export default WizardContext;