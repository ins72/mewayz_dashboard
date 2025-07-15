import React from 'react';
import { motion } from 'framer-motion';
import { User, Users, Building2, Building } from 'lucide-react';

const teamSizeOptions = [
  {
    value: 'solo',
    label: 'Just Me',
    description: 'Solo entrepreneur or freelancer',
    icon: User,
    color: 'from-purple-500 to-purple-600'
  },
  {
    value: 'small',
    label: '2-10 People',
    description: 'Small team or startup',
    icon: Users,
    color: 'from-blue-500 to-blue-600'
  },
  {
    value: 'medium',
    label: '11-50 People',
    description: 'Growing business',
    icon: Building2,
    color: 'from-green-500 to-green-600'
  },
  {
    value: 'large',
    label: '50+ People',
    description: 'Large organization',
    icon: Building,
    color: 'from-orange-500 to-orange-600'
  }
];

const TeamSizeSelector = ({ value, onChange, error }) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-200 mb-2">
        Team Size *
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {teamSizeOptions.map((option, index) => {
          const IconComponent = option.icon;
          const isSelected = value === option.value;
          
          return (
            <motion.button
              key={option.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              onClick={() => onChange(option.value)}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left group overflow-hidden ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 transition-opacity duration-300 ${
                isSelected ? 'opacity-10' : 'group-hover:opacity-5'
              }`} />
              
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-3">
                  <div className={`p-3 rounded-lg transition-all duration-300 ${
                    isSelected 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-600 text-gray-300 group-hover:bg-gray-500'
                  }`}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-lg transition-colors duration-300 ${
                      isSelected ? 'text-blue-300' : 'text-white'
                    }`}>
                      {option.label}
                    </h3>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {option.description}
                </p>
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute top-4 right-4 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg"
                >
                  <div className="w-3 h-3 bg-white rounded-full" />
                </motion.div>
              )}
              
              {/* Hover Effect */}
              <div className={`absolute inset-0 rounded-xl border-2 border-transparent transition-all duration-300 ${
                isSelected 
                  ? 'shadow-lg shadow-blue-500/20' 
                  : 'group-hover:shadow-lg group-hover:shadow-gray-500/20'
              }`} />
            </motion.button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default TeamSizeSelector;