import React from 'react';
import { motion } from 'framer-motion';

const BillingToggle = ({ billingCycle, onChange }) => {
  return (
    <div className="bg-gray-800 p-1 rounded-xl flex">
      <button
        onClick={() => onChange('monthly')}
        className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          billingCycle === 'monthly' ?'text-white' :'text-gray-400 hover:text-gray-200'
        }`}
      >
        {billingCycle === 'monthly' && (
          <motion.div
            layoutId="billing-toggle"
            className="absolute inset-0 bg-blue-600 rounded-lg"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative">Monthly</span>
      </button>
      
      <button
        onClick={() => onChange('yearly')}
        className={`relative px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          billingCycle === 'yearly' ?'text-white' :'text-gray-400 hover:text-gray-200'
        }`}
      >
        {billingCycle === 'yearly' && (
          <motion.div
            layoutId="billing-toggle"
            className="absolute inset-0 bg-blue-600 rounded-lg"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
        <span className="relative">Yearly</span>
        <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
          Save 20%
        </span>
      </button>
    </div>
  );
};

export default BillingToggle;