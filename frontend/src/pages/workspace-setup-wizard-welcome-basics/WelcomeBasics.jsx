import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building, Users, Globe, DollarSign } from 'lucide-react';

const WelcomeBasics = () => {
  const [formData, setFormData] = useState({
    workspaceName: '',
    industry: '',
    teamSize: '',
    businessType: '',
    businessDescription: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currency: 'USD'
  });

  const [errors, setErrors] = useState({});

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce', 
    'Marketing', 'Real Estate', 'Consulting', 'Non-profit', 'Other'
  ];

  const teamSizes = [
    '1-5 employees', '6-20 employees', '21-50 employees', 
    '51-100 employees', '101-500 employees', '500+ employees'
  ];

  const businessTypes = [
    'Startup', 'Small Business', 'Medium Enterprise', 
    'Large Enterprise', 'Freelancer', 'Agency', 'Non-profit'
  ];

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.workspaceName.trim()) {
      newErrors.workspaceName = 'Workspace name is required';
    }
    
    if (!formData.industry) {
      newErrors.industry = 'Please select an industry';
    }
    
    if (!formData.teamSize) {
      newErrors.teamSize = 'Please select team size';
    }
    
    if (!formData.businessType) {
      newErrors.businessType = 'Please select business type';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      // Navigate to next step
      window.location.href = '/workspace-setup-wizard-goal-selection';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to <span className="text-blue-400">Mewayz</span>
            </h1>
            <p className="text-xl text-gray-300">
              Let's set up your workspace with some basic information
            </p>
          </motion.div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workspace Name */}
            <div className="md:col-span-2">
              <label className="block text-white font-medium mb-2">
                <Building className="inline w-5 h-5 mr-2" />
                Workspace Name *
              </label>
              <input
                type="text"
                value={formData.workspaceName}
                onChange={(e) => handleInputChange('workspaceName', e.target.value)}
                placeholder="My Awesome Business"
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.workspaceName ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.workspaceName && (
                <p className="text-red-400 text-sm mt-1">{errors.workspaceName}</p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label className="block text-white font-medium mb-2">
                <Globe className="inline w-5 h-5 mr-2" />
                Industry *
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.industry ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select Industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {errors.industry && (
                <p className="text-red-400 text-sm mt-1">{errors.industry}</p>
              )}
            </div>

            {/* Team Size */}
            <div>
              <label className="block text-white font-medium mb-2">
                <Users className="inline w-5 h-5 mr-2" />
                Team Size *
              </label>
              <select
                value={formData.teamSize}
                onChange={(e) => handleInputChange('teamSize', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.teamSize ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select Team Size</option>
                {teamSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              {errors.teamSize && (
                <p className="text-red-400 text-sm mt-1">{errors.teamSize}</p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-white font-medium mb-2">
                Business Type *
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.businessType ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select Business Type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {errors.businessType && (
                <p className="text-red-400 text-sm mt-1">{errors.businessType}</p>
              )}
            </div>

            {/* Currency */}
            <div>
              <label className="block text-white font-medium mb-2">
                <DollarSign className="inline w-5 h-5 mr-2" />
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Business Description */}
            <div className="md:col-span-2">
              <label className="block text-white font-medium mb-2">
                Business Description (Optional)
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                placeholder="Tell us about your business..."
                rows="4"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Next Button */}
          <div className="flex justify-end mt-8">
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>Continue to Goal Selection</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <div className="text-center mt-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
          </div>
          <p className="text-gray-400 text-sm mt-2">Step 1 of 6</p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBasics;