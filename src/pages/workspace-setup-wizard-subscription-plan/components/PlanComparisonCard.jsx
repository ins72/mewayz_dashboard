import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Zap } from 'lucide-react';
import subscriptionService from 'utils/subscriptionService';

const PlanComparisonCard = ({ 
  plan, 
  isSelected, 
  billingCycle, 
  selectedFeatureCount, 
  onSelect, 
  index 
}) => {
  const isPopular = plan.slug === 'pro';
  const isFree = plan.slug === 'free';
  const estimatedCost = subscriptionService.calculateSubscriptionCost(
    plan,
    billingCycle,
    selectedFeatureCount
  );

  const features = [
    {
      name: 'Team Members',
      value: plan.max_team_members === -1 ? 'Unlimited' : plan.max_team_members?.toString() || '1'
    },
    {
      name: 'Workspaces',
      value: plan.max_workspaces === -1 ? 'Unlimited' : plan.max_workspaces?.toString() || '1'
    },
    {
      name: 'API Calls',
      value: plan.limitations?.api_calls === -1 ? 'Unlimited' : 
             plan.limitations?.api_calls ? `${plan.limitations.api_calls.toLocaleString()}/month` : 'Limited'
    },
    {
      name: 'Storage',
      value: plan.limitations?.storage || '1GB'
    },
    {
      name: 'Support',
      value: isFree ? 'Community' : plan.slug === 'enterprise' ? 'Dedicated' : 'Priority'
    },
    {
      name: 'White-label',
      value: plan.slug === 'enterprise' ? 'Included' : 'Not available'
    }
  ];

  const getPriceDisplay = () => {
    if (isFree) return { main: '$0', period: 'forever' };
    
    const price = billingCycle === 'yearly' ? estimatedCost.yearly : estimatedCost.monthly;
    const period = billingCycle === 'yearly' ? '/year' : '/month';
    
    return {
      main: `$${price.toFixed(0)}`,
      period
    };
  };

  const priceDisplay = getPriceDisplay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative bg-gray-900 rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-500/5' :'hover:bg-gray-800 border border-gray-700'
      }`}
      onClick={onSelect}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      {/* Enterprise Badge */}
      {plan.slug === 'enterprise' && (
        <div className="absolute -top-3 right-4">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Zap className="w-3 h-3" />
            <span>Enterprise</span>
          </div>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
        <p className="text-gray-400 text-sm mb-4">{plan.description}</p>
        
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-bold text-white">{priceDisplay.main}</span>
            <span className="text-gray-400 ml-1">{priceDisplay.period}</span>
          </div>
          
          {billingCycle === 'yearly' && !isFree && estimatedCost.savings > 0 && (
            <div className="text-green-400 text-sm mt-1">
              Save ${estimatedCost.savings.toFixed(0)} annually
            </div>
          )}
        </div>

        {/* Feature-based pricing note */}
        {plan.pricing_model === 'feature_based' && !isFree && (
          <div className="text-xs text-gray-500 mb-4">
            ${plan.feature_price_monthly}/feature/month
          </div>
        )}
      </div>

      {/* Features List */}
      <div className="space-y-3 mb-6">
        {features.map((feature, featureIndex) => (
          <div key={featureIndex} className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              feature.value === 'Not available' ?'bg-gray-700' :'bg-green-500/20'
            }`}>
              {feature.value === 'Not available' ? (
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
              ) : (
                <Check className="w-3 h-3 text-green-400" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-gray-300 text-sm">{feature.name}: </span>
              <span className={`text-sm font-medium ${
                feature.value === 'Not available' ? 'text-gray-500' : 'text-white'
              }`}>
                {feature.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Select Button */}
      <button
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          isSelected
            ? 'bg-blue-600 text-white' :'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
      >
        {isSelected ? 'Selected' : `Choose ${plan.name}`}
      </button>

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-4 h-4 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
};

export default PlanComparisonCard;