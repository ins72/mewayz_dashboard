import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWizard } from 'contexts/WizardContext';
import { useAuth } from 'contexts/AuthContext';
import WizardContainer from 'pages/workspace-setup-wizard-welcome-basics/components/WizardContainer';
import InvitationForm from './components/InvitationForm';
import TeamStructureBuilder from './components/TeamStructureBuilder';
import InvitationList from './components/InvitationList';
import teamService from 'utils/teamService';

const WorkspaceSetupWizardTeamSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    formData, 
    updateFormData, 
    nextStep, 
    previousStep, 
    setLoading, 
    isLoading,
    setError,
    clearError 
  } = useWizard();

  const [currentInvitation, setCurrentInvitation] = useState({
    email: '',
    role: 'member',
    department: '',
    message: ''
  });

  // Initialize form data if not present
  useEffect(() => {
    if (!formData?.step5) {
      updateFormData('step5', {
        invitations: [],
        teamStructure: {
          departments: teamService.getDefaultDepartments(),
          roles: teamService.getDefaultRoles()
        }
      });
    }
  }, [formData?.step5, updateFormData]);

  const handleAddInvitation = (invitation) => {
    const newInvitations = [...(formData?.step5?.invitations || []), invitation];
    updateFormData('step5', {
      invitations: newInvitations
    });
    
    // Reset current invitation form
    setCurrentInvitation({
      email: '',
      role: 'member',
      department: '',
      message: ''
    });
    
    clearError('invitation');
  };

  const handleRemoveInvitation = (index) => {
    const newInvitations = (formData?.step5?.invitations || []).filter((_, i) => i !== index);
    updateFormData('step5', {
      invitations: newInvitations
    });
  };

  const handleUpdateTeamStructure = (structure) => {
    updateFormData('step5', {
      teamStructure: structure
    });
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      // If there are invitations, we could send them here
      // For now, we'll just proceed to the next step
      nextStep();
      navigate('/workspace-setup-wizard-branding');
    } catch (error) {
      setError('team', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    previousStep();
    navigate('/workspace-setup-wizard-subscription-plan');
  };

  const handleSkip = () => {
    // Clear any team setup data and proceed
    updateFormData('step5', {
      invitations: [],
      teamStructure: {
        departments: [],
        roles: []
      }
    });
    
    nextStep();
    navigate('/workspace-setup-wizard-branding');
  };

  return (
    <WizardContainer
      title="Set Up Your Team"
      description="Invite team members and define your workspace structure. You can always add more members later."
      currentStep={5}
    >
      <div className="space-y-8">
        {/* Team Structure Builder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <TeamStructureBuilder
            structure={formData?.step5?.teamStructure}
            onUpdate={handleUpdateTeamStructure}
          />
        </motion.div>

        {/* Invitation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <InvitationForm
            invitation={currentInvitation}
            onUpdate={setCurrentInvitation}
            onAdd={handleAddInvitation}
            departments={formData?.step5?.teamStructure?.departments || []}
            roles={formData?.step5?.teamStructure?.roles || []}
          />
        </motion.div>

        {/* Invitation List */}
        {formData?.step5?.invitations?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <InvitationList
              invitations={formData.step5.invitations}
              onRemove={handleRemoveInvitation}
            />
          </motion.div>
        )}

        {/* No Team Notice */}
        {(!formData?.step5?.invitations || formData.step5.invitations.length === 0) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800 rounded-xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Flying Solo?</h3>
            <p className="text-gray-400 mb-4">
              No problem! You can add team members anytime from your workspace settings.
            </p>
            <p className="text-gray-500 text-sm">
              Click "Skip" to continue with just yourself, or use the form above to invite your team now.
            </p>
          </motion.div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            onClick={handleBack}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            Back
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleSkip}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              Skip
            </button>
            
            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </WizardContainer>
  );
};

export default WorkspaceSetupWizardTeamSetup;