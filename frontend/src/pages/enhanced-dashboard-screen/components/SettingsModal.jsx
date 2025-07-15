import React, { useState } from 'react';
import { X, Save, Users, CreditCard, Settings, Palette, Globe, Shield } from 'lucide-react';
import { useDashboard } from './DashboardProvider';

const SettingsModal = () => {
  const { showSettingsModal, setShowSettingsModal, workspace, checkPermission } = useDashboard();
  const [activeTab, setActiveTab] = useState('general');

  if (!showSettingsModal) return null;

  const canManageSettings = checkPermission('workspace.settings.manage');
  const canManageTeam = checkPermission('team.manage');
  const canManageBilling = checkPermission('billing.manage');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, permission: 'workspace.settings.view' },
    { id: 'team', label: 'Team', icon: Users, permission: 'team.view' },
    { id: 'billing', label: 'Billing', icon: CreditCard, permission: 'billing.view' },
    { id: 'branding', label: 'Branding', icon: Palette, permission: 'branding.view' },
    { id: 'integrations', label: 'Integrations', icon: Globe, permission: 'integrations.view' },
    { id: 'security', label: 'Security', icon: Shield, permission: 'security.view' }
  ].filter(tab => checkPermission(tab.permission));

  const GeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Workspace Name
        </label>
        <input
          type="text"
          defaultValue={workspace?.name || ''}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          disabled={!canManageSettings}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          rows={3}
          defaultValue={workspace?.description || ''}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          disabled={!canManageSettings}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Timezone
        </label>
        <select 
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          disabled={!canManageSettings}
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
        </select>
      </div>
    </div>
  );

  const TeamSettings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h4>
        {canManageTeam && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Invite Member
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Mock team members */}
        {[
          { name: 'John Doe', email: 'john@example.com', role: 'Owner' },
          { name: 'Jane Smith', email: 'jane@example.com', role: 'Admin' },
          { name: 'Bob Johnson', email: 'bob@example.com', role: 'Member' }
        ].map((member, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">{member.role}</span>
              {canManageTeam && member.role !== 'Owner' && (
                <button className="text-sm text-red-600 hover:text-red-700">Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BillingSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Current Plan</h4>
        <p className="text-blue-700 dark:text-blue-300">Free Plan</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
          Next billing cycle: No upcoming charges
        </p>
      </div>
      
      <div>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Usage</h4>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Team Members</span>
              <span className="text-gray-900 dark:text-white">3 / 5</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">API Calls</span>
              <span className="text-gray-900 dark:text-white">750 / 1,000</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
        </div>
      </div>
      
      {canManageBilling && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Upgrade Plan
          </button>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'team':
        return <TeamSettings />;
      case 'billing':
        return <BillingSettings />;
      case 'branding':
        return <div className="text-center py-8 text-gray-500">Branding settings coming soon...</div>;
      case 'integrations':
        return <div className="text-center py-8 text-gray-500">Integration settings coming soon...</div>;
      case 'security':
        return <div className="text-center py-8 text-gray-500">Security settings coming soon...</div>;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Workspace Settings
          </h2>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' :'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <IconComponent size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderTabContent()}
            
            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              {canManageSettings && (
                <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Save size={16} />
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;