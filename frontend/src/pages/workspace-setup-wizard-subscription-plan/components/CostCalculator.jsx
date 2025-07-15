import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp } from 'lucide-react';

const CostCalculator = ({ plan, estimatedCost, billingCycle, selectedFeatureCount }) => {
  const isYearly = billingCycle === 'yearly';
  const isFree = plan.slug === 'free';

  if (isFree) return null;

  const basePrice = isYearly ? plan.base_price_yearly : plan.base_price_monthly;
  const featurePrice = plan.pricing_model === 'feature_based' 
    ? (isYearly ? plan.feature_price_yearly : plan.feature_price_monthly) * selectedFeatureCount
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20 rounded-xl p-6"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <Calculator className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Cost Breakdown</h3>
          <p className="text-gray-400 text-sm">Your estimated {plan.name} plan cost</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Base Price */}
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-300">Base plan ({isYearly ? 'yearly' : 'monthly'})</span>
          <span className="text-white font-medium">
            ${basePrice.toFixed(2)}{isYearly ? '/year' : '/month'}
          </span>
        </div>

        {/* Feature-based pricing */}
        {plan.pricing_model === 'feature_based' && selectedFeatureCount > 0 && (
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-300">
              Features ({selectedFeatureCount} × ${isYearly ? plan.feature_price_yearly : plan.feature_price_monthly}
              {isYearly ? '/year' : '/month'})
            </span>
            <span className="text-white font-medium">
              ${featurePrice.toFixed(2)}{isYearly ? '/year' : '/month'}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-700 my-3"></div>

        {/* Total */}
        <div className="flex justify-between items-center py-2">
          <span className="text-lg font-semibold text-white">Total</span>
          <span className="text-xl font-bold text-blue-400">
            ${(isYearly ? estimatedCost.yearly : estimatedCost.monthly).toFixed(2)}
            {isYearly ? '/year' : '/month'}
          </span>
        </div>

        {/* Savings for yearly */}
        {isYearly && estimatedCost.savings > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center space-x-3"
          >
            <TrendingUp className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-green-400 font-medium">Annual Savings</p>
              <p className="text-white text-sm">
                Save ${estimatedCost.savings.toFixed(2)} compared to monthly billing
              </p>
            </div>
          </motion.div>
        )}

        {/* Cost per day for yearly plans */}
        {isYearly && (
          <div className="text-center pt-3">
            <p className="text-gray-400 text-sm">
              That's just ${(estimatedCost.yearly / 365).toFixed(2)} per day
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CostCalculator;