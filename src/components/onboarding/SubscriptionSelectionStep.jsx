import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Crown, Gift, Calculator, Info } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Button from '../ui/Button';

const SubscriptionSelectionStep = () => {
  const {
    selectedSubscription,
    setSelectedSubscription,
    billingCycle,
    setBillingCycle,
    selectedFeatures,
    calculateTotalCost,
    SUBSCRIPTION_TIERS,
    goToNextStep,
    goToPreviousStep
  } = useOnboarding();

  const [selectedTier, setSelectedTier] = useState(selectedSubscription?.id || 'free');
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    // Set initial subscription if not already set
    if (!selectedSubscription) {
      const freeTier = SUBSCRIPTION_TIERS.find(tier => tier.id === 'free');
      setSelectedSubscription(freeTier);
    }
  }, [selectedSubscription, setSelectedSubscription]);

  const handleTierSelection = (tier) => {
    setSelectedTier(tier.id);
    setSelectedSubscription(tier);
  };

  const handleBillingCycleChange = (cycle) => {
    setBillingCycle(cycle);
  };

  const handleContinue = () => {
    goToNextStep();
  };

  const getTierIcon = (tierId) => {
    switch (tierId) {
      case 'free':
        return <Gift className="h-8 w-8" />;
      case 'pro':
        return <Zap className="h-8 w-8" />;
      case 'enterprise':
        return <Crown className="h-8 w-8" />;
      default:
        return <Gift className="h-8 w-8" />;
    }
  };

  const getTierColor = (tierId) => {
    switch (tierId) {
      case 'free':
        return 'from-green-500 to-green-600';
      case 'pro':
        return 'from-blue-500 to-blue-600';
      case 'enterprise':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatPrice = (tier) => {
    if (tier.id === 'free') return 'Free';
    
    const price = billingCycle === 'yearly' ? tier.priceYearly : tier.priceMonthly;
    const period = billingCycle === 'yearly' ? 'year' : 'month';
    return `$${price}/feature/${period}`;
  };

  const calculateSavings = (tier) => {
    if (tier.id === 'free' || !tier.priceMonthly || !tier.priceYearly) return 0;
    const monthlyTotal = tier.priceMonthly * 12;
    const yearlyTotal = tier.priceYearly;
    return monthlyTotal - yearlyTotal;
  };

  const totalCost = calculateTotalCost();

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Choose Your Subscription Plan
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Select the plan that best fits your needs. You can change your plan anytime.
        </p>
      </motion.div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-800 rounded-lg p-1 flex">
          <button
            onClick={() => handleBillingCycleChange('monthly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => handleBillingCycleChange('yearly')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
            <span className="ml-1 text-xs text-green-400">(Save 17%)</span>
          </button>
        </div>
      </div>

      {/* Subscription Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {SUBSCRIPTION_TIERS.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`relative bg-gray-800 rounded-xl p-6 cursor-pointer transition-all duration-300 ${
              selectedTier === tier.id
                ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/20'
                : 'hover:bg-gray-700 border border-gray-600'
            }`}
            onClick={() => handleTierSelection(tier)}
          >
            {/* Popular Badge */}
            {tier.id === 'pro' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                  Most Popular
                </div>
              </div>
            )}

            {/* Tier Header */}
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getTierColor(tier.id)} mb-4`}>
                {getTierIcon(tier.id)}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
              <div className="text-3xl font-bold text-white mb-2">
                {formatPrice(tier)}
              </div>
              {tier.id !== 'free' && billingCycle === 'yearly' && (
                <div className="text-sm text-green-400">
                  Save ${calculateSavings(tier)} per feature/year
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm mb-6 text-center">
              {tier.description}
            </p>

            {/* Features/Limitations */}
            <div className="space-y-3">
              {tier.limitations.map((limitation, idx) => (
                <div key={idx} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{limitation}</span>
                </div>
              ))}
            </div>

            {/* Selection Indicator */}
            {selectedTier === tier.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <Check className="h-4 w-4 text-white" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Cost Calculator */}
      {selectedTier !== 'free' && selectedFeatures.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-800 rounded-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Cost Calculation
            </h3>
            <button
              onClick={() => setShowCalculator(!showCalculator)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{selectedFeatures.length}</div>
              <div className="text-sm text-gray-400">Features Selected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                ${selectedSubscription?.priceMonthly || 0}/{billingCycle === 'yearly' ? 'year' : 'month'}
              </div>
              <div className="text-sm text-gray-400">Per Feature</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">${totalCost}</div>
              <div className="text-sm text-gray-400">Total/{billingCycle === 'yearly' ? 'year' : 'month'}</div>
            </div>
          </div>

          {showCalculator && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-700"
            >
              <div className="text-sm text-gray-400 mb-2">Selected Features:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {selectedFeatures.map((feature, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-300">{feature.name}</span>
                    <span className="text-gray-400">${feature.price}/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button
          variant="ghost"
          onClick={goToPreviousStep}
          className="text-gray-400 hover:text-white"
        >
          Previous
        </Button>
        
        <Button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
        >
          Continue to Branding
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionSelectionStep;