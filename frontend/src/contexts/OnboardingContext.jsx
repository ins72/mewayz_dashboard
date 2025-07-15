import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import invitationService from '../utils/invitationService';

const OnboardingContext = createContext();

// Onboarding steps
const ONBOARDING_STEPS = {
  GOAL_SELECTION: 'goal_selection',
  FEATURE_SELECTION: 'feature_selection', 
  TEAM_SETUP: 'team_setup',
  SUBSCRIPTION_SELECTION: 'subscription_selection',
  BRANDING_CONFIGURATION: 'branding_configuration',
  DASHBOARD_CUSTOMIZATION: 'dashboard_customization'
};

// Business goals
const BUSINESS_GOALS = [
  {
    id: 'instagram_management',
    title: 'Instagram Management & Lead Generation',
    description: 'Manage your Instagram presence, generate leads, and grow your audience',
    icon: '📸',
    color: 'bg-pink-500',
    features: ['social_media_management', 'lead_generation', 'content_scheduling', 'analytics']
  },
  {
    id: 'link_in_bio',
    title: 'Link in Bio Creation & Optimization',
    description: 'Create stunning bio pages that convert visitors into customers',
    icon: '🔗',
    color: 'bg-blue-500',
    features: ['link_in_bio_builder', 'landing_pages', 'conversion_tracking', 'a_b_testing']
  },
  {
    id: 'course_creation',
    title: 'Course Creation & Community Building',
    description: 'Build and monetize online courses with community features',
    icon: '🎓',
    color: 'bg-green-500',
    features: ['course_builder', 'community_platform', 'student_management', 'progress_tracking']
  },
  {
    id: 'ecommerce',
    title: 'E-commerce & Marketplace',
    description: 'Sell products online with full e-commerce capabilities',
    icon: '🛒',
    color: 'bg-purple-500',
    features: ['online_store', 'inventory_management', 'payment_processing', 'order_management']
  },
  {
    id: 'crm_leads',
    title: 'CRM & Lead Management',
    description: 'Manage customer relationships and track sales pipelines',
    icon: '👥',
    color: 'bg-orange-500',
    features: ['crm_system', 'lead_management', 'sales_pipeline', 'email_marketing']
  },
  {
    id: 'website_builder',
    title: 'Website Builder & Content Management',
    description: 'Build professional websites with content management tools',
    icon: '🌐',
    color: 'bg-indigo-500',
    features: ['website_builder', 'content_management', 'seo_tools', 'domain_management']
  }
];

// Available features (40+ features)
const AVAILABLE_FEATURES = [
  // Social Media Features
  { id: 'social_media_management', name: 'Social Media Management', category: 'social_media', price: 10 },
  { id: 'content_scheduling', name: 'Content Scheduling', category: 'social_media', price: 8 },
  { id: 'instagram_analytics', name: 'Instagram Analytics', category: 'social_media', price: 12 },
  { id: 'hashtag_research', name: 'Hashtag Research', category: 'social_media', price: 6 },
  { id: 'competitor_analysis', name: 'Competitor Analysis', category: 'social_media', price: 15 },
  { id: 'social_listening', name: 'Social Listening', category: 'social_media', price: 20 },
  
  // Link in Bio Features
  { id: 'link_in_bio_builder', name: 'Link in Bio Builder', category: 'link_in_bio', price: 5 },
  { id: 'custom_domains', name: 'Custom Domains', category: 'link_in_bio', price: 8 },
  { id: 'conversion_tracking', name: 'Conversion Tracking', category: 'link_in_bio', price: 12 },
  { id: 'a_b_testing', name: 'A/B Testing', category: 'link_in_bio', price: 15 },
  { id: 'qr_codes', name: 'QR Code Generation', category: 'link_in_bio', price: 6 },
  
  // E-commerce Features
  { id: 'online_store', name: 'Online Store', category: 'ecommerce', price: 25 },
  { id: 'inventory_management', name: 'Inventory Management', category: 'ecommerce', price: 18 },
  { id: 'payment_processing', name: 'Payment Processing', category: 'ecommerce', price: 12 },
  { id: 'order_management', name: 'Order Management', category: 'ecommerce', price: 15 },
  { id: 'shipping_management', name: 'Shipping Management', category: 'ecommerce', price: 10 },
  { id: 'product_reviews', name: 'Product Reviews', category: 'ecommerce', price: 8 },
  
  // CRM Features
  { id: 'crm_system', name: 'CRM System', category: 'crm', price: 20 },
  { id: 'lead_management', name: 'Lead Management', category: 'crm', price: 15 },
  { id: 'sales_pipeline', name: 'Sales Pipeline', category: 'crm', price: 18 },
  { id: 'email_marketing', name: 'Email Marketing', category: 'crm', price: 12 },
  { id: 'lead_generation', name: 'Lead Generation', category: 'crm', price: 22 },
  { id: 'customer_segmentation', name: 'Customer Segmentation', category: 'crm', price: 14 },
  
  // Course Features
  { id: 'course_builder', name: 'Course Builder', category: 'courses', price: 25 },
  { id: 'community_platform', name: 'Community Platform', category: 'courses', price: 18 },
  { id: 'student_management', name: 'Student Management', category: 'courses', price: 12 },
  { id: 'progress_tracking', name: 'Progress Tracking', category: 'courses', price: 10 },
  { id: 'certification_system', name: 'Certification System', category: 'courses', price: 15 },
  { id: 'live_streaming', name: 'Live Streaming', category: 'courses', price: 20 },
  
  // Website Builder Features
  { id: 'website_builder', name: 'Website Builder', category: 'website', price: 20 },
  { id: 'content_management', name: 'Content Management', category: 'website', price: 15 },
  { id: 'seo_tools', name: 'SEO Tools', category: 'website', price: 12 },
  { id: 'domain_management', name: 'Domain Management', category: 'website', price: 8 },
  { id: 'ssl_certificates', name: 'SSL Certificates', category: 'website', price: 5 },
  
  // Analytics & Reporting
  { id: 'advanced_analytics', name: 'Advanced Analytics', category: 'analytics', price: 18 },
  { id: 'custom_reports', name: 'Custom Reports', category: 'analytics', price: 15 },
  { id: 'real_time_data', name: 'Real-time Data', category: 'analytics', price: 12 },
  { id: 'data_export', name: 'Data Export', category: 'analytics', price: 8 },
  
  // Marketing & Automation
  { id: 'marketing_automation', name: 'Marketing Automation', category: 'marketing', price: 25 },
  { id: 'email_templates', name: 'Email Templates', category: 'marketing', price: 8 },
  { id: 'campaign_management', name: 'Campaign Management', category: 'marketing', price: 15 },
  { id: 'social_proof', name: 'Social Proof', category: 'marketing', price: 10 },
  
  // Integration & API
  { id: 'api_access', name: 'API Access', category: 'integration', price: 20 },
  { id: 'webhook_support', name: 'Webhook Support', category: 'integration', price: 12 },
  { id: 'third_party_integrations', name: 'Third-party Integrations', category: 'integration', price: 15 },
  { id: 'zapier_integration', name: 'Zapier Integration', category: 'integration', price: 10 }
];

// Subscription tiers
const SUBSCRIPTION_TIERS = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    features: 10,
    description: 'Access to 10 features with Mewayz branding on external-facing content',
    billing: 'free',
    limitations: ['Mewayz branding on external content', 'Email support only', 'Basic analytics']
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    priceMonthly: 1,
    priceYearly: 10,
    description: 'Pay per feature - $1/feature per month or $10/feature per year',
    billing: 'per_feature',
    limitations: ['Standard support', 'Advanced analytics', 'Custom branding available']
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    priceMonthly: 1.5,
    priceYearly: 15,
    description: 'Premium features - $1.5/feature per month or $15/feature per year',
    billing: 'per_feature',
    limitations: ['Priority support', 'White-label options', 'Custom integrations', 'Dedicated account manager']
  }
];

// Initial state
const initialState = {
  currentStep: ONBOARDING_STEPS.GOAL_SELECTION,
  completedSteps: [],
  selectedGoals: [],
  selectedFeatures: [],
  teamInvitations: [],
  selectedSubscription: null,
  billingCycle: 'monthly',
  workspaceBranding: {
    workspaceName: '',
    description: '',
    logo: null,
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b'
    }
  },
  dashboardLayout: {
    widgets: [],
    layout: 'grid'
  },
  isComplete: false,
  loading: false,
  error: null
};

// Reducer
const onboardingReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload
      };
    
    case 'COMPLETE_STEP':
      return {
        ...state,
        completedSteps: [...state.completedSteps, action.payload]
      };
    
    case 'SET_SELECTED_GOALS':
      return {
        ...state,
        selectedGoals: action.payload
      };
    
    case 'SET_SELECTED_FEATURES':
      return {
        ...state,
        selectedFeatures: action.payload
      };
    
    case 'SET_TEAM_INVITATIONS':
      return {
        ...state,
        teamInvitations: action.payload
      };
    
    case 'SET_SELECTED_SUBSCRIPTION':
      return {
        ...state,
        selectedSubscription: action.payload
      };
    
    case 'SET_BILLING_CYCLE':
      return {
        ...state,
        billingCycle: action.payload
      };
    
    case 'SET_WORKSPACE_BRANDING':
      return {
        ...state,
        workspaceBranding: {
          ...state.workspaceBranding,
          ...action.payload
        }
      };
    
    case 'SET_DASHBOARD_LAYOUT':
      return {
        ...state,
        dashboardLayout: {
          ...state.dashboardLayout,
          ...action.payload
        }
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        isComplete: true
      };
    
    case 'RESET_ONBOARDING':
      return initialState;
    
    default:
      return state;
  }
};

// Context Provider
export const OnboardingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  const navigate = useNavigate();

  // Actions
  const setCurrentStep = (step) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const completeStep = (step) => {
    dispatch({ type: 'COMPLETE_STEP', payload: step });
  };

  const setSelectedGoals = (goals) => {
    dispatch({ type: 'SET_SELECTED_GOALS', payload: goals });
  };

  const setSelectedFeatures = (features) => {
    dispatch({ type: 'SET_SELECTED_FEATURES', payload: features });
  };

  const setTeamInvitations = (invitations) => {
    dispatch({ type: 'SET_TEAM_INVITATIONS', payload: invitations });
  };

  const setSelectedSubscription = (subscription) => {
    dispatch({ type: 'SET_SELECTED_SUBSCRIPTION', payload: subscription });
  };

  const setBillingCycle = (cycle) => {
    dispatch({ type: 'SET_BILLING_CYCLE', payload: cycle });
  };

  const setWorkspaceBranding = (branding) => {
    dispatch({ type: 'SET_WORKSPACE_BRANDING', payload: branding });
  };

  const setDashboardLayout = (layout) => {
    dispatch({ type: 'SET_DASHBOARD_LAYOUT', payload: layout });
  };

  const setLoading = (loading) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  // Navigation helpers
  const goToNextStep = () => {
    const steps = Object.values(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      navigate(`/onboarding/${nextStep}`);
    }
  };

  const goToPreviousStep = () => {
    const steps = Object.values(ONBOARDING_STEPS);
    const currentIndex = steps.indexOf(state.currentStep);
    
    if (currentIndex > 0) {
      const previousStep = steps[currentIndex - 1];
      setCurrentStep(previousStep);
      navigate(`/onboarding/${previousStep}`);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    navigate(`/onboarding/${step}`);
  };

  // Get recommended features based on selected goals
  const getRecommendedFeatures = () => {
    const recommendedFeatures = [];
    
    state.selectedGoals.forEach(goalId => {
      const goal = BUSINESS_GOALS.find(g => g.id === goalId);
      if (goal) {
        goal.features.forEach(featureId => {
          const feature = AVAILABLE_FEATURES.find(f => f.id === featureId);
          if (feature && !recommendedFeatures.find(rf => rf.id === feature.id)) {
            recommendedFeatures.push(feature);
          }
        });
      }
    });
    
    return recommendedFeatures;
  };

  // Calculate total cost
  const calculateTotalCost = () => {
    if (!state.selectedSubscription || state.selectedSubscription.id === 'free') {
      return 0;
    }

    const isYearly = state.billingCycle === 'yearly';
    const pricePerFeature = isYearly 
      ? state.selectedSubscription.priceYearly 
      : state.selectedSubscription.priceMonthly;

    return state.selectedFeatures.length * pricePerFeature;
  };

  // Send team invitations
  const sendTeamInvitations = async (workspaceId) => {
    if (state.teamInvitations.length === 0) return { success: true };

    try {
      setLoading(true);
      
      const result = await laravelInvitationService.createBulkInvitations(
        workspaceId,
        state.teamInvitations,
        'Onboarding Team Setup'
      );

      if (!result.success) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data };
    } catch (error) {
      const errorMessage = 'Failed to send team invitations';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    try {
      setLoading(true);
      
      // Here you would typically save the onboarding data to the backend
      // For now, we'll just mark it as complete
      
      dispatch({ type: 'COMPLETE_ONBOARDING' });
      
      // Navigate to dashboard
      navigate('/dashboard-screen', {
        state: {
          message: 'Welcome to Mewayz! Your workspace has been set up successfully.',
          onboardingComplete: true
        }
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = 'Failed to complete onboarding';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    // State
    ...state,
    
    // Constants
    ONBOARDING_STEPS,
    BUSINESS_GOALS,
    AVAILABLE_FEATURES,
    SUBSCRIPTION_TIERS,
    
    // Actions
    setCurrentStep,
    completeStep,
    setSelectedGoals,
    setSelectedFeatures,
    setTeamInvitations,
    setSelectedSubscription,
    setBillingCycle,
    setWorkspaceBranding,
    setDashboardLayout,
    setLoading,
    setError,
    
    // Navigation
    goToNextStep,
    goToPreviousStep,
    goToStep,
    
    // Helpers
    getRecommendedFeatures,
    calculateTotalCost,
    sendTeamInvitations,
    completeOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

// Hook
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export default OnboardingContext;