import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from 'contexts/AuthContext';
import { Mail, Users, UserPlus, Filter, Download } from 'lucide-react';
import InvitationDashboard from './components/InvitationDashboard';
import InviteForm from './components/InviteForm';
import InvitationList from './components/InvitationList';
import InvitationAnalytics from './components/InvitationAnalytics';
import BulkImportModal from './components/BulkImportModal';
import invitationService from 'utils/invitationService';
import Icon from '../../components/AppIcon';


const InvitationManagement = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [invitations, setInvitations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    role: '',
    department: '',
    search: ''
  });
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Mock workspace ID - replace with actual workspace context
  const workspaceId = 'workspace-uuid-here';

  useEffect(() => {
    loadInvitationData();
  }, [filters]);

  const loadInvitationData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [invitationsResult, analyticsResult] = await Promise.all([
        invitationService.getWorkspaceInvitations(workspaceId, filters),
        invitationService.getInvitationAnalytics(workspaceId)
      ]);

      if (invitationsResult.success) {
        setInvitations(invitationsResult.data);
      } else {
        setError(invitationsResult.error);
      }

      if (analyticsResult.success) {
        setAnalytics(analyticsResult.data);
      }
    } catch (error) {
      setError('Failed to load invitation data');
    } finally {
      setLoading(false);
    }
  };

  const handleInvitationSent = () => {
    loadInvitationData();
    setShowInviteForm(false);
  };

  const handleBulkImportComplete = () => {
    loadInvitationData();
    setShowBulkImport(false);
  };

  const handleResendInvitation = async (invitationId) => {
    try {
      const result = await invitationService.resendInvitation(invitationId);
      if (result.success) {
        loadInvitationData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to resend invitation');
    }
  };

  const handleCancelInvitation = async (invitationId) => {
    try {
      const result = await invitationService.cancelInvitation(invitationId);
      if (result.success) {
        loadInvitationData();
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to cancel invitation');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'invitations', label: 'Invitations', icon: Mail },
    { id: 'analytics', label: 'Analytics', icon: Filter },
  ];

  if (loading && invitations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading invitation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-white">Team Invitations</h1>
              <p className="text-gray-400 text-sm">Manage your workspace invitations and team onboarding</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkImport(true)}
                className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Bulk Import
              </button>
              
              <button
                onClick={() => setShowInviteForm(true)}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Members
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="border-b border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400' :'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InvitationDashboard
              analytics={analytics}
              recentInvitations={invitations?.slice(0, 5)}
              onInviteClick={() => setShowInviteForm(true)}
              onViewAllClick={() => setActiveTab('invitations')}
            />
          </motion.div>
        )}

        {activeTab === 'invitations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InvitationList
              invitations={invitations}
              loading={loading}
              filters={filters}
              onFiltersChange={setFilters}
              onResend={handleResendInvitation}
              onCancel={handleCancelInvitation}
            />
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <InvitationAnalytics analytics={analytics} loading={loading} />
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {showInviteForm && (
        <InviteForm
          workspaceId={workspaceId}
          onClose={() => setShowInviteForm(false)}
          onSuccess={handleInvitationSent}
        />
      )}

      {showBulkImport && (
        <BulkImportModal
          workspaceId={workspaceId}
          onClose={() => setShowBulkImport(false)}
          onSuccess={handleBulkImportComplete}
        />
      )}
    </div>
  );
};

export default InvitationManagement;