import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Link, GraduationCap, ShoppingBag, Users, BarChart3, Star, ArrowUp, ArrowDown, Minus } from 'lucide-react';

const iconMap = {
  Instagram, Link, GraduationCap, ShoppingBag, Users, BarChart3
};

const priorityConfig = {
  1: { label: 'High', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/50', icon: ArrowUp },
  2: { label: 'High', color: 'text-red-400', bgColor: 'bg-red-500/20', borderColor: 'border-red-500/50', icon: ArrowUp },
  3: { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', icon: Minus },
  4: { label: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', icon: Minus },
  5: { label: 'Low', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50', icon: ArrowDown },
  6: { label: 'Low', color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50', icon: ArrowDown }
};

const GoalCard = ({ goal, isSelected, priority, onSelect, onPriorityChange, onSetupToggle, setupNow, disabled = false }) => {
  const IconComponent = iconMap[goal?.icon_name] || Star;
  const priorityInfo = priority ? priorityConfig[priority] : null;
  const PriorityIcon = priorityInfo?.icon || Minus;

  const handleCardClick = () => {
    if (!disabled) {
      onSelect(goal.id);
    }
  };

  const handlePriorityClick = (e, newPriority) => {
    e.stopPropagation();
    if (!disabled && onPriorityChange) {
      onPriorityChange(goal.id, newPriority);
    }
  };

  const handleSetupToggle = (e) => {
    e.stopPropagation();
    if (!disabled && onSetupToggle) {
      onSetupToggle(goal.id, !setupNow);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className={`relative p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer group overflow-hidden ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : isSelected
          ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
          : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
      }`}
      style={{
        backgroundColor: isSelected ? `${goal?.icon_color}10` : undefined,
        borderColor: isSelected ? goal?.icon_color : undefined
      }}
    >
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${goal?.icon_color}40, transparent 50%)`
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div 
            className={`p-3 rounded-lg transition-all duration-300 shadow-lg`}
            style={{
              backgroundColor: isSelected ? goal?.icon_color : '#374151',
              color: isSelected ? 'white' : '#D1D5DB'
            }}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <div>
            <h3 className={`font-semibold text-lg transition-colors duration-300 ${
              isSelected ? 'text-white' : 'text-white'
            }`}>
              {goal?.name}
            </h3>
            <p className="text-gray-400 text-sm capitalize">
              {goal?.category} • {goal?.required_features?.length || 0} features
            </p>
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: goal?.icon_color }}
          >
            <div className="w-3 h-3 bg-white rounded-full" />
          </motion.div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm leading-relaxed mb-6 relative z-10">
        {goal?.description}
      </p>

      {/* Priority Selection */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="relative z-10 space-y-4"
        >
          {/* Priority Selector */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((level) => {
                const config = priorityConfig[level];
                const ConfigIcon = config.icon;
                const isSelectedPriority = priority === level;
                
                return (
                  <button
                    key={level}
                    onClick={(e) => handlePriorityClick(e, level)}
                    className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      isSelectedPriority
                        ? `${config.bgColor} ${config.borderColor} border-2 ${config.color}`
                        : 'bg-gray-600 border border-gray-500 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    <ConfigIcon className="h-3 w-3" />
                    <span>{level}</span>
                  </button>
                );
              })}
            </div>
            {priorityInfo && (
              <div className={`flex items-center space-x-2 text-xs ${priorityInfo.color}`}>
                <PriorityIcon className="h-3 w-3" />
                <span>{priorityInfo.label} Priority</span>
              </div>
            )}
          </div>

          {/* Setup Now Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-200">
                Setup Now
              </label>
              <p className="text-xs text-gray-400">
                Configure this goal immediately after wizard completion
              </p>
            </div>
            <button
              onClick={handleSetupToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                setupNow ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <motion.span
                animate={{ x: setupNow ? 20 : 2 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
              />
            </button>
          </div>
        </motion.div>
      )}

      {/* Hover Effect */}
      {!disabled && (
        <div className={`absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 pointer-events-none ${
          isSelected 
            ? 'shadow-lg' 
            : 'group-hover:shadow-lg group-hover:shadow-gray-500/20'
        }`} style={{
          boxShadow: isSelected ? `0 10px 25px ${goal?.icon_color}20` : undefined
        }} />
      )}
    </motion.div>
  );
};

export default GoalCard;