import React from 'react';
import { useWizard } from '../../../contexts/WizardContext';

const ProgressBar = () => {
  const { currentStep, TOTAL_STEPS, progressPercentage } = useWizard();

  return (
    <div className="w-full mb-8">
      {/* Progress Bar Container */}
      <div className="relative w-full bg-gray-800 rounded-full h-2 mb-4">
        {/* Progress Fill */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500 ease-out shadow-lg"
          style={{ 
            width: `${progressPercentage}%`,
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
          }}
        />
        
        {/* Glow Effect */}
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-300 rounded-full opacity-50 blur-sm transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      {/* Step Indicator */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400 font-medium">
          Step {currentStep} of {TOTAL_STEPS}
        </span>
        <span className="text-blue-400 font-medium">
          {progressPercentage}% Complete
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;