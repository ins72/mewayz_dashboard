import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

const LoadingScreen = ({ message, steps = [] }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (steps.length > 0) {
      const interval = setInterval(() => {
        setCurrentStep(prev => {
          if (prev < steps.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [steps.length]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        {/* Loading Animation */}
        <div className="relative mb-8">
          <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full mx-auto mb-6">
            <div className="w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-xl font-semibold text-white mb-4">{message}</h2>

        {/* Steps */}
        {steps.length > 0 && (
          <div className="space-y-3 max-w-xs mx-auto">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center space-x-3 text-sm ${
                    isCompleted
                      ? 'text-green-400'
                      : isCurrent
                      ? 'text-blue-400' :'text-gray-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                  <span>{step}</span>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Progress Dots */}
        {steps.length === 0 && (
          <div className="flex justify-center space-x-2 mt-6">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                className="w-2 h-2 bg-blue-500 rounded-full"
                animate={{
                  opacity: [1, 0.3, 1],
                  scale: [1, 0.8, 1]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: dot * 0.2
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LoadingScreen;