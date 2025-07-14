import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, Building, MessageSquare, Calendar, Plus, Trash2 } from 'lucide-react';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import invitationService from 'utils/invitationService';

const InviteForm = ({ workspaceId, onClose, onSuccess }) => {
  const [invitations, setInvitations] = useState([{
    email: '',
    role: 'member',
    department: '',
    position: '',
    personalMessage: ''
  }]);
  const [settings, setSettings] = useState({
    expiryDays: 7,
    sendReminders: true,
    template: 'professional'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const roles = [
    { value: 'owner', label: 'Owner', description: 'Full access to workspace and billing' },
    { value: 'admin', label: 'Admin', description: 'Manage team and workspace settings' },
    { value: 'manager', label: 'Manager', description: 'Manage content and view reports' },
    { value: 'member', label: 'Member', description: 'Create and edit own content' },
    { value: 'viewer', label: 'Viewer', description: 'View-only access to workspace' }
  ];

  const departments = [
    'Management', 'Engineering', 'Design', 'Marketing', 'Sales',
    'Customer Success', 'Operations', 'Finance', 'Human Resources', 'Product'
  ];

  const templates = [
    { value: 'professional', label: 'Professional', description: 'Clean and formal design' },
    { value: 'casual', label: 'Casual', description: 'Friendly and approachable tone' },
    { value: 'branded', label: 'Branded', description: 'Custom workspace branding' }
  ];

  const handleInvitationChange = (index, field, value) => {
    const updatedInvitations = [...invitations];
    updatedInvitations[index] = {
      ...updatedInvitations[index],
      [field]: value
    };
    setInvitations(updatedInvitations);
    
    // Clear field-specific errors
    if (errors[`${index}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${index}_${field}`];
        return newErrors;
      });
    }
  };

  const addInvitation = () => {
    setInvitations([...invitations, {
      email: '',
      role: 'member',
      department: '',
      position: '',
      personalMessage: ''
    }]);
  };

  const removeInvitation = (index) => {
    if (invitations.length > 1) {
      setInvitations(invitations.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    invitations.forEach((invitation, index) => {
      if (!invitation.email) {
        newErrors[`${index}_email`] = 'Email is required';
      } else if (!invitationService.validateEmail(invitation.email)) {
        newErrors[`${index}_email`] = 'Invalid email format';
      }
      
      if (!invitation.role) {
        newErrors[`${index}_role`] = 'Role is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      if (invitations.length === 1) {
        // Single invitation
        const result = await invitationService.createInvitation(workspaceId, {
          ...invitations[0],
          expiryDays: settings.expiryDays,
          template: settings.template
        });
        
        if (result.success) {
          onSuccess();
        } else {
          setErrors({ general: result.error });
        }
      } else {
        // Bulk invitations
        const result = await invitationService.createBulkInvitations(
          workspaceId,
          invitations.map(inv => ({
            ...inv,
            expiryDays: settings.expiryDays,
            template: settings.template
          })),
          `Bulk Invitation - ${new Date().toLocaleDateString()}`
        );
        
        if (result.success) {
          onSuccess();
        } else {
          setErrors({ general: result.error });
        }
      }
    } catch (error) {
      setErrors({ general: 'Failed to send invitations. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-white">Invite Team Members</h2>
              <p className="text-gray-400 text-sm">Send invitations to join your workspace</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            <form onSubmit={handleSubmit} className="p-6">
              {/* General Error */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-red-300">{errors.general}</p>
                </div>
              )}

              {/* Invitations */}
              <div className="space-y-6 mb-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Team Members</h3>
                  <button
                    type="button"
                    onClick={addInvitation}
                    className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another
                  </button>
                </div>

                {invitations.map((invitation, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-gray-700/30 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">Invitation #{index + 1}</h4>
                      {invitations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvitation(index)}
                          className="p-2 hover:bg-red-600/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={invitation.email}
                          onChange={(e) => handleInvitationChange(index, 'email', e.target.value)}
                          placeholder="colleague@company.com"
                          error={errors[`${index}_email`]}
                          required
                        />
                      </div>

                      {/* Role */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Role
                        </label>
                        <Select
                          value={invitation.role}
                          onChange={(value) => handleInvitationChange(index, 'role', value)}
                          options={roles}
                          error={errors[`${index}_role`]}
                        />
                      </div>

                      {/* Department */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          <Building className="w-4 h-4 inline mr-2" />
                          Department
                        </label>
                        <Select
                          value={invitation.department}
                          onChange={(value) => handleInvitationChange(index, 'department', value)}
                          options={departments.map(dept => ({ value: dept, label: dept }))}
                          placeholder="Select department"
                        />
                      </div>

                      {/* Position */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Position
                        </label>
                        <Input
                          value={invitation.position}
                          onChange={(e) => handleInvitationChange(index, 'position', e.target.value)}
                          placeholder="Job title or position"
                        />
                      </div>
                    </div>

                    {/* Personal Message */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Personal Message (Optional)
                      </label>
                      <textarea
                        value={invitation.personalMessage}
                        onChange={(e) => handleInvitationChange(index, 'personalMessage', e.target.value)}
                        placeholder="Add a personal welcome message..."
                        rows="3"
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Invitation Settings */}
              <div className="mb-8 p-6 bg-gray-700/30 rounded-lg border border-gray-600">
                <h3 className="text-lg font-medium text-white mb-4">Invitation Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Expiry Days */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Expires After
                    </label>
                    <Select
                      value={settings.expiryDays}
                      onChange={(value) => setSettings(prev => ({ ...prev, expiryDays: parseInt(value) }))}
                      options={[
                        { value: 1, label: '1 day' },
                        { value: 3, label: '3 days' },
                        { value: 7, label: '1 week' },
                        { value: 14, label: '2 weeks' },
                        { value: 30, label: '1 month' }
                      ]}
                    />
                  </div>

                  {/* Template */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Template
                    </label>
                    <Select
                      value={settings.template}
                      onChange={(value) => setSettings(prev => ({ ...prev, template: value }))}
                      options={templates}
                    />
                  </div>

                  {/* Send Reminders */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Options
                    </label>
                    <div className="pt-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={settings.sendReminders}
                          onChange={(e) => setSettings(prev => ({ ...prev, sendReminders: e.target.checked }))}
                          className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                        />
                        <span className="ml-2 text-sm text-gray-300">Send reminder emails</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : `Send ${invitations.length} Invitation${invitations.length > 1 ? 's' : ''}`}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InviteForm;