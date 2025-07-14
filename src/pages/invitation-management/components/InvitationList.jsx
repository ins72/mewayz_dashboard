import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Filter, MoreHorizontal, Mail, RefreshCw, X, Copy, 
  CheckCircle, Clock, XCircle, AlertCircle, Calendar, User, Building
} from 'lucide-react';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';

const InvitationList = ({ 
  invitations, 
  loading, 
  filters, 
  onFiltersChange, 
  onResend, 
  onCancel 
}) => {
  const [selectedInvitations, setSelectedInvitations] = useState([]);
  const [showActionMenu, setShowActionMenu] = useState(null);

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'declined', label: 'Declined' },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'owner', label: 'Owner' },
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'member', label: 'Member' },
    { value: 'viewer', label: 'Viewer' }
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'Management', label: 'Management' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Customer Success', label: 'Customer Success' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Product', label: 'Product' }
  ];

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      accepted: CheckCircle,
      declined: XCircle,
      expired: AlertCircle,
      cancelled: X
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      accepted: 'text-green-400 bg-green-500/20 border-green-500/30',
      declined: 'text-red-400 bg-red-500/20 border-red-500/30',
      expired: 'text-gray-400 bg-gray-500/20 border-gray-500/30',
      cancelled: 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatExpiryDate = (dateString) => {
    const expiryDate = new Date(dateString);
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${diffDays} days`;
    }
  };

  const handleSelectInvitation = (invitationId) => {
    setSelectedInvitations(prev => 
      prev.includes(invitationId)
        ? prev.filter(id => id !== invitationId)
        : [...prev, invitationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvitations.length === invitations.length) {
      setSelectedInvitations([]);
    } else {
      setSelectedInvitations(invitations.map(inv => inv.id));
    }
  };

  const copyInvitationLink = (token) => {
    const link = `${window.location.origin}/accept-invitation/${token}`;
    navigator.clipboard.writeText(link);
    // You could show a toast notification here
  };

  const filteredInvitations = invitations?.filter(invitation => {
    if (filters.search && !invitation.email.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && invitation.status !== filters.status) {
      return false;
    }
    if (filters.role && invitation.role !== filters.role) {
      return false;
    }
    if (filters.department && invitation.department !== filters.department) {
      return false;
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by email address..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={filters.status}
              onChange={(value) => onFiltersChange({ ...filters, status: value })}
              options={statusOptions}
            />
          </div>

          {/* Role Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={filters.role}
              onChange={(value) => onFiltersChange({ ...filters, role: value })}
              options={roleOptions}
            />
          </div>

          {/* Department Filter */}
          <div className="w-full lg:w-48">
            <Select
              value={filters.department}
              onChange={(value) => onFiltersChange({ ...filters, department: value })}
              options={departmentOptions}
            />
          </div>
        </div>

        {/* Active Filters */}
        {(filters.search || filters.status || filters.role || filters.department) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Active filters:</span>
            
            {filters.search && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                Search: "{filters.search}"
              </span>
            )}
            
            {filters.status && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                Status: {filters.status}
              </span>
            )}
            
            {filters.role && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                Role: {filters.role}
              </span>
            )}
            
            {filters.department && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                Department: {filters.department}
              </span>
            )}

            <button
              onClick={() => onFiltersChange({ search: '', status: '', role: '', department: '' })}
              className="text-gray-400 hover:text-white text-sm"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedInvitations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-900/50 border border-blue-700 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-300">
                {selectedInvitations.length} invitation{selectedInvitations.length > 1 ? 's' : ''} selected
              </span>
            </div>
            
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
                Resend Selected
              </button>
              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                Cancel Selected
              </button>
              <button
                onClick={() => setSelectedInvitations([])}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Invitations Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Table Header */}
        <div className="p-4 bg-gray-700/50 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={selectedInvitations.length === filteredInvitations.length && filteredInvitations.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <span className="text-white font-medium">
                {filteredInvitations.length} invitation{filteredInvitations.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Filter className="w-4 h-4" />
              <span>Filtered results</span>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="divide-y divide-gray-700">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading invitations...</p>
            </div>
          ) : filteredInvitations.length > 0 ? (
            filteredInvitations.map((invitation, index) => {
              const StatusIcon = getStatusIcon(invitation.status);
              
              return (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedInvitations.includes(invitation.id)}
                      onChange={() => handleSelectInvitation(invitation.id)}
                      className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                    />

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Email & Role */}
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-white font-medium truncate">{invitation.email}</h3>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-medium">
                              {invitation.role}
                            </span>
                          </div>

                          {/* Department & Position */}
                          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                            {invitation.department && (
                              <div className="flex items-center space-x-1">
                                <Building className="w-3 h-3" />
                                <span>{invitation.department}</span>
                              </div>
                            )}
                            
                            {invitation.position && (
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{invitation.position}</span>
                              </div>
                            )}
                          </div>

                          {/* Dates */}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Sent {formatDate(invitation.created_at)}</span>
                            </div>
                            
                            {invitation.status === 'pending' && (
                              <span className="text-yellow-400">
                                {formatExpiryDate(invitation.expires_at)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status & Actions */}
                        <div className="flex items-center space-x-3">
                          {/* Status Badge */}
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(invitation.status)}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}</span>
                          </div>

                          {/* Actions Menu */}
                          <div className="relative">
                            <button
                              onClick={() => setShowActionMenu(showActionMenu === invitation.id ? null : invitation.id)}
                              className="p-2 hover:bg-gray-600 rounded-lg transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>

                            {showActionMenu === invitation.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 top-full mt-1 w-48 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10"
                              >
                                <div className="py-1">
                                  {invitation.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => {
                                          onResend(invitation.id);
                                          setShowActionMenu(null);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                                      >
                                        <RefreshCw className="w-4 h-4 mr-2" />
                                        Resend Invitation
                                      </button>
                                      
                                      <button
                                        onClick={() => copyInvitationLink(invitation.token)}
                                        className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                                      >
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy Link
                                      </button>

                                      <button
                                        onClick={() => {
                                          onCancel(invitation.id);
                                          setShowActionMenu(null);
                                        }}
                                        className="flex items-center w-full px-3 py-2 text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 transition-colors"
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel Invitation
                                      </button>
                                    </>
                                  )}

                                  {invitation.status !== 'pending' && (
                                    <button
                                      onClick={() => copyInvitationLink(invitation.token)}
                                      className="flex items-center w-full px-3 py-2 text-sm text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
                                    >
                                      <Copy className="w-4 h-4 mr-2" />
                                      Copy Link
                                    </button>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Personal Message Preview */}
                      {invitation.personal_message && (
                        <div className="mt-3 p-3 bg-gray-700/50 rounded-lg">
                          <div className="flex items-start space-x-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-300 italic">
                              "{invitation.personal_message}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="p-8 text-center">
              <Mail className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No invitations found</p>
              <p className="text-gray-500 text-sm">
                {filters.search || filters.status || filters.role || filters.department
                  ? 'Try adjusting your filters or search terms' :'Start by sending your first team invitation'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close action menu */}
      {showActionMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActionMenu(null)}
        />
      )}
    </div>
  );
};

export default InvitationList;