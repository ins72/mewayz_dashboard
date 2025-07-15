import React from 'react';
import { motion } from 'framer-motion';
import ProgressBar from './ProgressBar';

const WizardContainer = ({ children, title, description }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-4xl mx-auto"
      >
        {/* Wizard Header */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Mewayz Workspace Setup
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-blue-400 mx-auto rounded-full" />
          </motion.div>
          
          <ProgressBar />
        </div>

        {/* Main Wizard Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-8 py-6 border-b border-gray-600">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {title}
            </h2>
            {description && (
              <p className="text-gray-300 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Card Content */}
          <div className="p-8">
            {children}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-8"
        >
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <button className="hover:text-blue-400 transition-colors duration-200">
              Need Help?
            </button>
            <span className="text-gray-600">•</span>
            <button className="hover:text-blue-400 transition-colors duration-200">
              Exit Setup
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WizardContainer;