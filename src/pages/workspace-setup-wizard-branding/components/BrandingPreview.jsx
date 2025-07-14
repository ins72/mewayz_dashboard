import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, Smartphone, Eye } from 'lucide-react';

const BrandingPreview = ({ branding, whiteLabelSettings, selectedPlan }) => {
  const primaryColor = branding?.primaryColor || '#007AFF';
  const secondaryColor = branding?.secondaryColor || '#6C5CE7';
  const fontFamily = branding?.fontFamily || 'Inter';
  const logo = branding?.logo;
  const customDomain = branding?.customDomain;

  // Mock workspace data for preview
  const mockWorkspace = {
    name: 'Your Workspace',
    description: 'This is how your workspace will look with your branding'
  };

  return (
    <div className="space-y-6">
      {/* Preview Header */}
      <div className="bg-gray-900 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Live Preview</h3>
            <p className="text-gray-400 text-sm">See how your branding looks in action</p>
          </div>
        </div>

        {/* Device Toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-4">
          <button className="flex-1 flex items-center justify-center py-2 bg-blue-600 rounded text-white text-sm">
            <Monitor className="w-4 h-4 mr-2" />
            Desktop
          </button>
          <button className="flex-1 flex items-center justify-center py-2 text-gray-400 text-sm">
            <Smartphone className="w-4 h-4 mr-2" />
            Mobile
          </button>
        </div>
      </div>

      {/* Desktop Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-xl p-6"
      >
        <h4 className="text-white font-medium mb-4">Workspace Dashboard Preview</h4>
        
        {/* Mock Browser Window */}
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          {/* Browser Header */}
          <div className="bg-gray-700 px-4 py-3 flex items-center space-x-2">
            <div className="flex space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 bg-gray-600 rounded px-3 py-1 text-xs text-gray-300">
              https://{customDomain || 'your-workspace.mewayz.com'}
            </div>
          </div>
          
          {/* Mock Workspace Content */}
          <div className="p-6" style={{ fontFamily }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                {/* Logo */}
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center"
                     style={{ backgroundColor: primaryColor + '20' }}>
                  {logo?.preview ? (
                    <img src={logo.preview} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: primaryColor }}></div>
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">{mockWorkspace.name}</h1>
                  <p className="text-gray-400 text-sm">{mockWorkspace.description}</p>
                </div>
              </div>
              
              {/* Action Button */}
              <button
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: primaryColor }}
              >
                Get Started
              </button>
            </div>

            {/* Content Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="w-8 h-8 rounded mb-3" style={{ backgroundColor: primaryColor }}></div>
                <h3 className="text-white font-medium mb-2">Feature Card</h3>
                <p className="text-gray-400 text-sm">Your primary brand color highlights important elements</p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="w-8 h-8 rounded mb-3" style={{ backgroundColor: secondaryColor }}></div>
                <h3 className="text-white font-medium mb-2">Secondary Element</h3>
                <p className="text-gray-400 text-sm">Secondary color provides visual hierarchy</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-white">Dashboard</button>
              <button 
                className="font-medium"
                style={{ color: primaryColor }}
              >
                Active Page
              </button>
              <button className="text-gray-400 hover:text-white">Settings</button>
            </div>
          </div>
          
          {/* Footer */}
          {!whiteLabelSettings?.removeWatermark && (
            <div className="bg-gray-800 px-6 py-3 border-t border-gray-700">
              <p className="text-gray-500 text-xs text-center">
                Powered by Mewayz
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Branding Summary */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h4 className="text-white font-medium mb-4">Branding Summary</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Logo:</span>
            <span className="text-white text-sm">
              {logo ? logo.name : 'Default Mewayz logo'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Primary Color:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: primaryColor }}></div>
              <span className="text-white text-sm font-mono">{primaryColor}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Secondary Color:</span>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: secondaryColor }}></div>
              <span className="text-white text-sm font-mono">{secondaryColor}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Font Family:</span>
            <span className="text-white text-sm" style={{ fontFamily }}>
              {fontFamily.split(',')[0]}
            </span>
          </div>
          
          {customDomain && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Custom Domain:</span>
              <span className="text-white text-sm">{customDomain}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Plan:</span>
            <span className="text-white text-sm capitalize">{selectedPlan || 'Free'}</span>
          </div>
        </div>
      </div>

      {/* Apply Changes Notice */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <h4 className="text-blue-400 font-medium mb-2">Ready to Apply?</h4>
        <p className="text-blue-300 text-sm">
          Your branding settings will be applied to your workspace after completing the setup. 
          You can always modify these settings later from your workspace preferences.
        </p>
      </div>
    </div>
  );
};

export default BrandingPreview;