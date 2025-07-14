import React from 'react';
import { Crown, Eye, Mail, Palette } from 'lucide-react';
import { Checkbox } from 'components/ui/Checkbox';

const WhiteLabelSettings = ({ settings, onSettingChange }) => {
  const whiteLabelOptions = [
    {
      key: 'removeWatermark',
      title: 'Remove Mewayz Branding',
      description: 'Hide "Powered by Mewayz" from your workspace',
      icon: Eye,
      enabled: settings?.removeWatermark || false
    },
    {
      key: 'customLoginPage',
      title: 'Custom Login Page',
      description: 'Use your own branding on the login and signup pages',
      icon: Palette,
      enabled: settings?.customLoginPage || false
    },
    {
      key: 'customEmails',
      title: 'Custom Email Templates',
      description: 'Customize notification emails with your branding',
      icon: Mail,
      enabled: settings?.customEmails || false
    }
  ];

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Crown className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white">White-label Settings</h3>
            <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded">
              Enterprise Only
            </span>
          </div>
          <p className="text-gray-400 text-sm">Complete brand customization options</p>
        </div>
      </div>

      {/* White-label Options */}
      <div className="space-y-4">
        {whiteLabelOptions.map((option, index) => (
          <div
            key={option.key}
            className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mt-1">
                <option.icon className="w-5 h-5 text-purple-400" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-medium">{option.title}</h4>
                  <Checkbox
                    checked={option.enabled}
                    onChange={(checked) => onSettingChange(option.key, checked)}
                  />
                </div>
                <p className="text-gray-400 text-sm">{option.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* White-label Preview */}
      <div className="mt-6 bg-gray-800 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">White-label Preview</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Mewayz Branding Removed:</span>
            <span className={settings?.removeWatermark ? 'text-green-400' : 'text-gray-500'}>
              {settings?.removeWatermark ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Custom Login Page:</span>
            <span className={settings?.customLoginPage ? 'text-green-400' : 'text-gray-500'}>
              {settings?.customLoginPage ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Custom Email Templates:</span>
            <span className={settings?.customEmails ? 'text-green-400' : 'text-gray-500'}>
              {settings?.customEmails ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Enterprise Benefits */}
      <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
        <h4 className="text-purple-400 font-medium mb-2">Enterprise White-label Benefits</h4>
        <ul className="text-purple-300 text-sm space-y-1">
          <li>• Complete removal of Mewayz branding</li>
          <li>• Custom login pages with your brand colors</li>
          <li>• Personalized email templates and notifications</li>
          <li>• White-label mobile app options available</li>
          <li>• Custom domain with SSL included</li>
          <li>• Priority support and dedicated account manager</li>
        </ul>
      </div>

      {/* Implementation Notice */}
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-1">Implementation Timeline</h4>
        <p className="text-blue-300 text-sm">
          White-label customizations typically take 2-3 business days to implement after workspace creation. 
          Our team will work with you to ensure everything matches your brand perfectly.
        </p>
      </div>
    </div>
  );
};

export default WhiteLabelSettings;