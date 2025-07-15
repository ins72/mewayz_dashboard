import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, Info, AlertCircle, Crown } from 'lucide-react';

const FeatureToggle = ({ 
  feature, 
  isEnabled, 
  priority = 'medium', 
  onToggle, 
  onPriorityChange,
  goalColor = '#007AFF',
  disabled = false 
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Parse tier availability and usage limits
  const tierAvailability = feature.tier_availability || {};
  const usageLimits = feature.usage_limits || {};

  // Check if feature is available in free plan
  const freeAvailable = tierAvailability.free === true;
  const proRequired = !freeAvailable && tierAvailability.pro === true;
  const enterpriseRequired = !freeAvailable && !proRequired && tierAvailability.enterprise === true;

  // Get usage limit for free plan
  const freeLimit = usageLimits.free;
  const isUnlimited = freeLimit === -1;

  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  // Handle toggle
  const handleToggle = () => {
    if (disabled) return;
    onToggle(feature.id, !isEnabled);
  };

  // Handle priority change
  const handlePriorityChange = (newPriority) => {
    if (onPriorityChange) {
      onPriorityChange(feature.id, newPriority);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`
        relative border rounded-lg p-4 transition-all duration-200
        ${isEnabled 
          ? 'bg-gray-700/50 border-blue-500/50' :'bg-gray-800/30 border-gray-600 hover:border-gray-500'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      onClick={handleToggle}
    >
      {/* Feature Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          {/* Toggle Icon */}
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="mt-0.5"
          >
            {isEnabled ? (
              <ToggleRight 
                className="h-6 w-6 text-blue-400" 
                style={{ color: goalColor }}
              />
            ) : (
              <ToggleLeft className="h-6 w-6 text-gray-500" />
            )}
          </motion.div>

          {/* Feature Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className={`font-medium ${isEnabled ? 'text-white' : 'text-gray-300'}`}>
                {feature.name}
              </h4>
              
              {/* Plan Badge */}
              {!freeAvailable && (
                <span className={`
                  px-2 py-0.5 text-xs rounded-full font-medium
                  ${proRequired 
                    ? 'bg-blue-500/20 text-blue-400' :'bg-purple-500/20 text-purple-400'
                  }
                `}>
                  {proRequired ? 'PRO' : 'ENTERPRISE'}
                  <Crown className="h-3 w-3 inline ml-1" />
                </span>
              )}
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">
              {feature.description}
            </p>

            {/* Usage Limits */}
            {freeAvailable && freeLimit && (
              <div className="mt-2 text-xs text-gray-500">
                {isUnlimited ? (
                  <span className="text-green-400">Unlimited usage</span>
                ) : (
                  <span>Limited to {freeLimit} per month</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Details Toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDetails(!showDetails);
          }}
          className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Info className="h-4 w-4 text-gray-400" />
        </button>
      </div>

      {/* Priority Selector (shown when enabled) */}
      {isEnabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-600 pt-3 mt-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Priority Level:</span>
            <div className="flex space-x-1">
              {['high', 'medium', 'low'].map((level) => (
                <button
                  key={level}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePriorityChange(level);
                  }}
                  className={`
                    px-2 py-1 text-xs rounded-full font-medium transition-colors
                    ${priority === level 
                      ? getPriorityColor(level)
                      : 'text-gray-500 bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Feature Details (expandable) */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-600 pt-3 mt-3 space-y-3"
        >
          {/* Tier Availability */}
          <div>
            <h5 className="text-sm font-medium text-gray-300 mb-2">Plan Availability</h5>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className={`p-2 rounded text-center ${tierAvailability.free ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                Free {tierAvailability.free ? '✓' : '✗'}
              </div>
              <div className={`p-2 rounded text-center ${tierAvailability.pro ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-500'}`}>
                Pro {tierAvailability.pro ? '✓' : '✗'}
              </div>
              <div className={`p-2 rounded text-center ${tierAvailability.enterprise ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-500'}`}>
                Enterprise {tierAvailability.enterprise ? '✓' : '✗'}
              </div>
            </div>
          </div>

          {/* Usage Limits */}
          {Object.keys(usageLimits).length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">Usage Limits</h5>
              <div className="space-y-1 text-xs text-gray-400">
                {Object.entries(usageLimits).map(([plan, limit]) => (
                  <div key={plan} className="flex justify-between">
                    <span className="capitalize">{plan}:</span>
                    <span>{limit === -1 ? 'Unlimited' : `${limit}/month`}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {feature.dependencies && feature.dependencies.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                Dependencies
              </h5>
              <div className="text-xs text-gray-400">
                This feature requires: {feature.dependencies.join(', ')}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Disabled Overlay */}
      {disabled && (
        <div className="absolute inset-0 bg-gray-900/50 rounded-lg flex items-center justify-center">
          <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
            Plan Upgrade Required
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default FeatureToggle;