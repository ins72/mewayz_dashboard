import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Palette, Type, Eye, Download, Paintbrush } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Button from '../ui/Button';
import Input from '../ui/Input';

const BrandingSetupStep = () => {
  const {
    workspaceBranding,
    setWorkspaceBranding,
    goToNextStep,
    goToPreviousStep
  } = useOnboarding();

  const [logoPreview, setLogoPreview] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [colorPickerType, setColorPickerType] = useState('primary');

  const predefinedColors = [
    '#3b82f6', '#06b6d4', '#10b981', '#f59e0b',
    '#ef4444', '#8b5cf6', '#ec4899', '#64748b',
    '#0f172a', '#1e293b', '#374151', '#6b7280'
  ];

  const handleInputChange = (field, value) => {
    setWorkspaceBranding({ [field]: value });
  };

  const handleColorChange = (colorType, color) => {
    setWorkspaceBranding({
      colors: {
        ...workspaceBranding.colors,
        [colorType]: color
      }
    });
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target.result;
        setLogoPreview(logoData);
        setWorkspaceBranding({ logo: logoData });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorPicker = (type) => {
    setColorPickerType(type);
    setShowColorPicker(!showColorPicker);
  };

  const handleContinue = () => {
    goToNextStep();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Brand Your Workspace
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Customize your workspace with your brand colors, logo, and information to make it uniquely yours.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branding Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Workspace Name */}
          <div>
            <Input
              label="Workspace Name"
              placeholder="Enter your workspace name"
              value={workspaceBranding.workspaceName}
              onChange={(e) => handleInputChange('workspaceName', e.target.value)}
              icon={<Type className="h-4 w-4" />}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Description
            </label>
            <textarea
              value={workspaceBranding.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your workspace or business"
              rows={3}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Logo
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">SVG, PNG, JPG (MAX. 2MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
              
              {logoPreview && (
                <div className="w-32 h-32 border border-gray-600 rounded-lg overflow-hidden bg-white">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Color Customization */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-4">
              Brand Colors
            </label>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Primary Color */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Primary Color</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleColorPicker('primary')}
                    className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center"
                    style={{ backgroundColor: workspaceBranding.colors.primary }}
                  >
                    <Palette className="h-4 w-4 text-white" />
                  </button>
                  <input
                    type="text"
                    value={workspaceBranding.colors.primary}
                    onChange={(e) => handleColorChange('primary', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Secondary Color</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleColorPicker('secondary')}
                    className="w-10 h-10 rounded-lg border border-gray-600 flex items-center justify-center"
                    style={{ backgroundColor: workspaceBranding.colors.secondary }}
                  >
                    <Paintbrush className="h-4 w-4 text-white" />
                  </button>
                  <input
                    type="text"
                    value={workspaceBranding.colors.secondary}
                    onChange={(e) => handleColorChange('secondary', e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                    placeholder="#64748b"
                  />
                </div>
              </div>
            </div>

            {/* Color Picker */}
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gray-800 border border-gray-600 rounded-lg"
              >
                <div className="grid grid-cols-6 gap-2 mb-4">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorChange(colorPickerType, color)}
                      className="w-8 h-8 rounded-md border border-gray-600 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  value={workspaceBranding.colors[colorPickerType]}
                  onChange={(e) => handleColorChange(colorPickerType, e.target.value)}
                  className="w-full h-10 bg-gray-700 border border-gray-600 rounded-lg"
                />
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-lg p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Preview
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* Mock Workspace Preview */}
          <div className="bg-gray-900 rounded-lg p-4 space-y-4">
            {/* Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-gray-700">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-10 h-10 rounded-lg object-contain bg-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                  <Type className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <div>
                <h4 className="font-semibold text-white">
                  {workspaceBranding.workspaceName || 'Your Workspace'}
                </h4>
                <p className="text-sm text-gray-400">
                  {workspaceBranding.description || 'Workspace description'}
                </p>
              </div>
            </div>

            {/* Sample Content */}
            <div className="space-y-3">
              <div
                className="h-10 rounded-lg flex items-center px-3 text-white font-medium"
                style={{ backgroundColor: workspaceBranding.colors.primary }}
              >
                Primary Button
              </div>
              <div
                className="h-8 rounded-lg flex items-center px-3 text-white"
                style={{ backgroundColor: workspaceBranding.colors.secondary }}
              >
                Secondary Element
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div
                  className="h-6 rounded"
                  style={{ backgroundColor: workspaceBranding.colors.primary + '40' }}
                />
                <div
                  className="h-6 rounded"
                  style={{ backgroundColor: workspaceBranding.colors.secondary + '40' }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="ghost"
          onClick={goToPreviousStep}
          className="text-gray-400 hover:text-white"
        >
          Previous
        </Button>
        
        <Button
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8"
          disabled={!workspaceBranding.workspaceName}
        >
          Continue to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default BrandingSetupStep;