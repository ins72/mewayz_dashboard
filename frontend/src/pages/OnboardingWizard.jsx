import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from '../contexts/OnboardingContext';
import GoalSelectionStep from '../components/onboarding/GoalSelectionStep';
import FeatureSelectionStep from '../components/onboarding/FeatureSelectionStep';
import TeamSetupStep from '../components/onboarding/TeamSetupStep';
import { Loader2 } from 'lucide-react';

const OnboardingContent = () => {
  const { step } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { ONBOARDING_STEPS, setCurrentStep } = useOnboarding();

  useEffect(() => {
    if (!user) {
      navigate('/login-screen');
      return;
    }

    if (!step) {
      navigate(`/onboarding/${ONBOARDING_STEPS.GOAL_SELECTION}`);
      return;
    }

    // Validate step
    if (!Object.values(ONBOARDING_STEPS).includes(step)) {
      navigate(`/onboarding/${ONBOARDING_STEPS.GOAL_SELECTION}`);
      return;
    }

    setCurrentStep(step);
  }, [step, user, navigate, ONBOARDING_STEPS, setCurrentStep]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case ONBOARDING_STEPS.GOAL_SELECTION:
        return <GoalSelectionStep />;
      case ONBOARDING_STEPS.FEATURE_SELECTION:
        return <FeatureSelectionStep />;
      case ONBOARDING_STEPS.TEAM_SETUP:
        return <TeamSetupStep />;
      case ONBOARDING_STEPS.SUBSCRIPTION_SELECTION:
        return <div>Subscription Selection - Coming Soon</div>;
      case ONBOARDING_STEPS.BRANDING_CONFIGURATION:
        return <div>Branding Configuration - Coming Soon</div>;
      case ONBOARDING_STEPS.DASHBOARD_CUSTOMIZATION:
        return <div>Dashboard Customization - Coming Soon</div>;
      default:
        return <GoalSelectionStep />;
    }
  };

  return renderStep();
};

const OnboardingWizard = () => {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
};

export default OnboardingWizard;