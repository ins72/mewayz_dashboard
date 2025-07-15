import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Trash2, UserCheck } from 'lucide-react';

const InvitationList = ({ invitations, onRemove }) => {
  const getRoleColor = (role) => {
    const colors = {
      owner: 'bg-red-500/20 text-red-400',
      admin: 'bg-orange-500/20 text-orange-400',
      manager: 'bg-blue-500/20 text-blue-400',
      member: 'bg-green-500/20 text-green-400',
      viewer: 'bg-gray-500/20 text-gray-400'
    };
    return colors[role] || colors.member;
  };

  const getRoleName = (role) => {
    const names = {
      owner: 'Owner',
      admin: 'Admin',
      manager: 'Manager',
      member: 'Member',
      viewer: 'Viewer'
    };
    return names[role] || 'Member';
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Pending Invitations</h3>
          <p className="text-gray-400 text-sm">
            {invitations.length} invitation{invitations.length !== 1 ? 's' : ''} ready to send
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4 flex-1">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-1">
                  <p className="text-white font-medium truncate">{invitation.email}</p>
                  <span className={`text-xs px-2 py-1 rounded ${getRoleColor(invitation.role)}`}>
                    {getRoleName(invitation.role)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  {invitation.department && (
                    <span>📁 {invitation.department}</span>
                  )}
                  {invitation.message && (
                    <span className="truncate max-w-xs">💬 {invitation.message}</span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={() => onRemove(index)}
              className="text-gray-400 hover:text-red-400 transition-colors p-2"
              title="Remove invitation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
        <p className="text-yellow-400 text-sm">
          ⚠️ <strong>Note:</strong> Invitations will be sent when you complete the workspace setup. 
          Team members will receive an email with instructions to join your workspace.
        </p>
      </div>
    </div>
  );
};

export default InvitationList;