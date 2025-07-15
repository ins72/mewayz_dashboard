import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { useWizard } from '../../../contexts/WizardContext';

const WizardNavigation = ({ 
  onNext, 
  onBack, 
  nextLabel = "Next", 
  backLabel = "Back",
  hideBack = false,
  hideNext = false,
  nextDisabled = false,
  loading = false 
}) => {
  const { currentStep, canProceedToNextStep, TOTAL_STEPS } = useWizard();

  const isLastStep = currentStep === TOTAL_STEPS;
  const isFirstStep = currentStep === 1;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="flex items-center justify-between pt-8 border-t border-gray-600"
    >
      {/* Back Button */}
      <div className="flex-1">
        {!hideBack && !isFirstStep && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            disabled={loading}
            className="inline-flex items-center px-6 py-3 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {backLabel}
          </motion.button>
        )}
      </div>

      {/* Step Indicator */}
      <div className="flex-1 flex justify-center">
        <div className="flex space-x-2">
          {Array.from({ length: TOTAL_STEPS }, (_, index) => {
            const stepNumber = index + 1;
            const isCurrentStep = stepNumber === currentStep;
            const isCompletedStep = stepNumber < currentStep;
            
            return (
              <motion.div
                key={stepNumber}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{ 
                  scale: isCurrentStep ? 1.2 : 1, 
                  opacity: isCurrentStep || isCompletedStep ? 1 : 0.3 
                }}
                transition={{ duration: 0.3 }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  isCurrentStep
                    ? 'bg-blue-500 shadow-lg shadow-blue-500/50'
                    : isCompletedStep
                    ? 'bg-green-500' :'bg-gray-600'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <div className="flex-1 flex justify-end">
        {!hideNext && (
          <motion.button
            whileHover={{ scale: nextDisabled || !canProceedToNextStep ? 1 : 1.05 }}
            whileTap={{ scale: nextDisabled || !canProceedToNextStep ? 1 : 0.95 }}
            onClick={onNext}
            disabled={nextDisabled || !canProceedToNextStep || loading}
            className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
              nextDisabled || !canProceedToNextStep
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' :'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-500 hover:to-blue-400 shadow-lg hover:shadow-blue-500/25'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {nextLabel}
                {!isLastStep && <ArrowRight className="w-4 h-4 ml-2" />}
              </>
            )}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default WizardNavigation;