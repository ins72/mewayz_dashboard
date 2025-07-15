import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Package, CheckCircle, Circle } from 'lucide-react';
import FeatureToggle from './FeatureToggle';

const FeatureGroup = ({ 
  goal, 
  features, 
  priority, 
  selectedFeatures, 
  onFeatureToggle, 
  onPriorityChange,
  onGoalToggle 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate group stats
  const enabledCount = features.filter(feature => {
    const selectedFeature = selectedFeatures.find(sf => sf.featureId === feature.id);
    return selectedFeature?.isEnabled;
  }).length;

  const totalCount = features.length;
  const allEnabled = enabledCount === totalCount && totalCount > 0;
  const someEnabled = enabledCount > 0 && enabledCount < totalCount;

  // Handle group toggle
  const handleGroupToggle = () => {
    onGoalToggle(goal.id, !allEnabled);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden"
    >
      {/* Group Header */}
      <div className="p-6 border-b border-gray-700 bg-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Goal Icon */}
            <div 
              className="p-3 rounded-lg"
              style={{ 
                backgroundColor: `${goal.icon_color}20`,
                borderColor: `${goal.icon_color}30`
              }}
            >
              <Package 
                className="h-6 w-6" 
                style={{ color: goal.icon_color }}
              />
            </div>

            {/* Goal Info */}
            <div>
              <div className="flex items-center space-x-3">
                <h3 className="text-xl font-semibold text-white">
                  {goal.name}
                </h3>
                <span 
                  className="px-2 py-1 text-xs rounded-full"
                  style={{ 
                    backgroundColor: `${goal.icon_color}20`,
                    color: goal.icon_color
                  }}
                >
                  Priority {priority}
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-1">{goal.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <span>{enabledCount} of {totalCount} features enabled</span>
                {totalCount > 0 && (
                  <div className="w-24 bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(enabledCount / totalCount) * 100}%`,
                        backgroundColor: goal.icon_color
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Group Controls */}
          <div className="flex items-center space-x-3">
            {/* Select All/None Toggle */}
            <button
              onClick={handleGroupToggle}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
            >
              {allEnabled ? (
                <CheckCircle className="h-4 w-4 text-green-400" />
              ) : someEnabled ? (
                <Circle className="h-4 w-4 text-yellow-400 fill-current" />
              ) : (
                <Circle className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-300">
                {allEnabled ? 'Disable All' : 'Enable All'}
              </span>
            </button>

            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Features List */}
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? 'auto' : 0,
          opacity: isExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        {features.length > 0 ? (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const selectedFeature = selectedFeatures.find(sf => sf.featureId === feature.id);
              
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  <FeatureToggle
                    feature={feature}
                    isEnabled={selectedFeature?.isEnabled || false}
                    priority={selectedFeature?.priority || 'medium'}
                    onToggle={onFeatureToggle}
                    onPriorityChange={onPriorityChange}
                    goalColor={goal.icon_color}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No features available for this goal yet.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default FeatureGroup;