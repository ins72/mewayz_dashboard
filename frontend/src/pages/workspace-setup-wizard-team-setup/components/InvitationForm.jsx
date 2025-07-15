import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, UserPlus, AlertCircle } from 'lucide-react';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import teamService from 'utils/teamService';

const InvitationForm = ({ invitation, onUpdate, onAdd, departments, roles }) => {
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!invitation.email.trim()) {
      setError('Email address is required');
      return;
    }

    if (!teamService.validateEmail(invitation.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate role
    if (!invitation.role) {
      setError('Please select a role');
      return;
    }

    // Add invitation
    onAdd({
      ...invitation,
      email: invitation.email.trim().toLowerCase(),
      message: invitation.message.trim()
    });
  };

  const handleInputChange = (field, value) => {
    onUpdate({
      ...invitation,
      [field]: value
    });
    if (error) setError('');
  };

  const roleOptions = roles?.map(role => ({
    value: role.value,
    label: role.name,
    description: role.description
  })) || [];

  const departmentOptions = departments?.map(dept => ({
    value: dept,
    label: dept
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-xl p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Invite Team Members</h3>
          <p className="text-gray-400 text-sm">Send invitations to your team members</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address *
          </label>
          <Input
            type="email"
            value={invitation.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="colleague@company.com"
            className="w-full"
            icon={Mail}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Role *
          </label>
          <Select
            value={invitation.role}
            onChange={(value) => handleInputChange('role', value)}
            options={roleOptions}
            placeholder="Select a role"
          />
        </div>

        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Department (Optional)
          </label>
          <Select
            value={invitation.department}
            onChange={(value) => handleInputChange('department', value)}
            options={departmentOptions}
            placeholder="Select a department"
          />
        </div>

        {/* Personal Message */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Personal Message (Optional)
          </label>
          <textarea
            value={invitation.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            placeholder="Add a personal message to your invitation..."
            className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-red-400 text-sm"
          >
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          variant="primary"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Invitation
        </Button>
      </form>

      {/* Help Text */}
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-blue-400 text-sm">
          💡 <strong>Tip:</strong> Invitations will be sent via email with a link to join your workspace. 
          Team members can accept or decline the invitation.
        </p>
      </div>
    </motion.div>
  );
};

export default InvitationForm;