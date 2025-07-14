import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWizard } from 'contexts/WizardContext';
import { useAuth } from 'contexts/AuthContext';
import WizardContainer from 'pages/workspace-setup-wizard-welcome-basics/components/WizardContainer';
import PlanComparisonCard from './components/PlanComparisonCard';
import BillingToggle from './components/BillingToggle';
import FeatureCountSelector from './components/FeatureCountSelector';
import CostCalculator from './components/CostCalculator';
import subscriptionService from 'utils/subscriptionService';

const WorkspaceSetupWizardSubscriptionPlan = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    formData, 
    updateFormData, 
    nextStep, 
    previousStep, 
    setLoading, 
    isLoading,
    setError,
    clearError 
  } = useWizard();

  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [selectedFeatureCount, setSelectedFeatureCount] = useState(
    formData?.step3?.selectedFeatures?.length || 0
  );

  // Load subscription plans on mount
  useEffect(() => {
    loadSubscriptionPlans();
  }, []);

  // Update cost when plan or billing cycle changes
  useEffect(() => {
    if (formData?.step4?.selectedPlan && plans.length > 0) {
      calculateCost();
    }
  }, [formData?.step4?.selectedPlan, formData?.step4?.billingCycle, selectedFeatureCount, plans]);

  const loadSubscriptionPlans = async () => {
    setLoadingPlans(true);
    try {
      const result = await subscriptionService.getSubscriptionPlans();
      
      if (result.success) {
        setPlans(result.data);
      } else {
        setError('subscription', result.error);
      }
    } catch (error) {
      setError('subscription', 'Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const calculateCost = () => {
    const selectedPlan = plans.find(plan => plan.slug === formData?.step4?.selectedPlan);
    if (!selectedPlan) return;

    const estimatedCost = subscriptionService.calculateSubscriptionCost(
      selectedPlan,
      formData?.step4?.billingCycle || 'monthly',
      selectedFeatureCount
    );

    updateFormData('step4', {
      selectedFeatureCount,
      estimatedCost
    });
  };

  const handlePlanSelect = (planSlug) => {
    clearError('subscription');
    updateFormData('step4', {
      selectedPlan: planSlug
    });
  };

  const handleBillingCycleChange = (cycle) => {
    updateFormData('step4', {
      billingCycle: cycle
    });
  };

  const handleNext = async () => {
    if (!formData?.step4?.selectedPlan) {
      setError('subscription', 'Please select a subscription plan');
      return;
    }

    setLoading(true);
    try {
      // If user selected a paid plan, we would normally handle payment here
      // For now, we'll just proceed to the next step
      nextStep();
      navigate('/workspace-setup-wizard-team-setup');
    } catch (error) {
      setError('subscription', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    previousStep();
    navigate('/workspace-setup-wizard-feature-selection');
  };

  const selectedPlan = plans.find(plan => plan.slug === formData?.step4?.selectedPlan);
  const isPaidPlan = selectedPlan?.slug !== 'free';

  return (
    <WizardContainer
      title="Choose Your Plan"
      description="Select the perfect plan for your workspace needs. You can upgrade or downgrade at any time."
      currentStep={4}
    >
      <div className="space-y-8">
        {/* Billing Cycle Toggle */}
        <div className="flex justify-center">
          <BillingToggle
            billingCycle={formData?.step4?.billingCycle || 'monthly'}
            onChange={handleBillingCycleChange}
          />
        </div>

        {/* Feature Count Selector for Feature-Based Plans */}
        {selectedPlan?.pricing_model === 'feature_based' && (
          <FeatureCountSelector
            count={selectedFeatureCount}
            maxCount={Math.min(formData?.step3?.selectedFeatures?.length || 0, 50)}
            onChange={setSelectedFeatureCount}
          />
        )}

        {/* Plans Grid */}
        {loadingPlans ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-8 bg-gray-700 rounded mb-4"></div>
                <div className="h-12 bg-gray-700 rounded mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {plans.map((plan, index) => (
              <PlanComparisonCard
                key={plan.id}
                plan={plan}
                isSelected={formData?.step4?.selectedPlan === plan.slug}
                billingCycle={formData?.step4?.billingCycle || 'monthly'}
                selectedFeatureCount={selectedFeatureCount}
                onSelect={() => handlePlanSelect(plan.slug)}
                index={index}
              />
            ))}
          </motion.div>
        )}

        {/* Cost Calculator */}
        {selectedPlan && formData?.step4?.estimatedCost && (
          <CostCalculator
            plan={selectedPlan}
            estimatedCost={formData.step4.estimatedCost}
            billingCycle={formData?.step4?.billingCycle || 'monthly'}
            selectedFeatureCount={selectedFeatureCount}
          />
        )}

        {/* Payment Notice for Paid Plans */}
        {isPaidPlan && (
          <motion.div 
            className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-medium">Payment Information</h4>
                <p className="text-gray-400 text-sm mt-1">
                  You can complete your workspace setup now and add payment details later. 
                  Your {selectedPlan?.name} plan will be activated once payment is processed.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={handleBack}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={isLoading || !formData?.step4?.selectedPlan}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Processing...' : 'Continue'}
          </button>
        </div>
      </div>
    </WizardContainer>
  );
};

export default WorkspaceSetupWizardSubscriptionPlan;