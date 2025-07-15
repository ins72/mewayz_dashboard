import React from 'react';
import { Globe, Lock, Crown } from 'lucide-react';
import Input from 'components/ui/Input';

const DomainSettings = ({ domain, onDomainChange, isPro, isEnterprise }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
          <Globe className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white">Custom Domain</h3>
            {isEnterprise && (
              <span className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded">
                <Crown className="w-3 h-3 inline mr-1" />
                Enterprise
              </span>
            )}
            {isPro && !isEnterprise && (
              <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                Pro
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm">Use your own domain for your workspace</p>
        </div>
      </div>

      {/* Domain Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Domain Name
        </label>
        <Input
          type="text"
          value={domain}
          onChange={(e) => onDomainChange(e.target.value)}
          placeholder="yourdomain.com"
          icon={Globe}
        />
        <p className="text-gray-500 text-xs mt-2">
          Enter your domain without "https://" or "www"
        </p>
      </div>

      {/* Domain Status */}
      {domain && (
        <div className="bg-gray-800 rounded-lg p-4 mb-4">
          <h4 className="text-white font-medium mb-2">Domain Preview</h4>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-gray-400">Your workspace will be available at:</span>
          </div>
          <div className="bg-gray-700 rounded px-3 py-2 font-mono text-green-400">
            https://{domain}
          </div>
        </div>
      )}

      {/* Domain Setup Instructions */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
        <div className="flex items-start space-x-2">
          <Lock className="w-5 h-5 text-yellow-400 mt-0.5" />
          <div>
            <h4 className="text-yellow-400 font-medium mb-1">Domain Setup Required</h4>
            <p className="text-yellow-300 text-sm mb-2">
              After completing setup, you'll need to configure DNS settings:
            </p>
            <ul className="text-yellow-300 text-sm space-y-1">
              <li>• Add a CNAME record pointing to our servers</li>
              <li>• SSL certificate will be automatically generated</li>
              <li>• Setup typically takes 24-48 hours to propagate</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Plan Limitations */}
      {!isPro && !isEnterprise && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Lock className="w-5 h-5 text-gray-400" />
            <h4 className="text-gray-400 font-medium">Custom Domain Unavailable</h4>
          </div>
          <p className="text-gray-500 text-sm mb-3">
            Custom domains are available with Pro and Enterprise plans.
          </p>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
            Upgrade to Pro →
          </button>
        </div>
      )}

      {/* Benefits */}
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-2">Custom Domain Benefits</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Professional appearance for your brand</li>
          <li>• Better SEO and search visibility</li>
          <li>• Complete control over your online presence</li>
          <li>• SSL security automatically included</li>
        </ul>
      </div>
    </div>
  );
};

export default DomainSettings;