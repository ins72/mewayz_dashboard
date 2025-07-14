import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from 'contexts/AuthContext';
import { Users, Mail, Building, UserCheck, X } from 'lucide-react';
import Button from 'components/ui/Button';
import AuthSelector from './components/AuthSelector';
import LoadingScreen from './components/LoadingScreen';
import WelcomeScreen from './components/WelcomeScreen';
import invitationService from 'utils/invitationService';

const InvitationAcceptance = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('loading'); // 'loading', 'auth', 'accepting', 'welcome', 'error'
  const [authMethod, setAuthMethod] = useState('email');

  useEffect(() => {
    loadInvitationDetails();
  }, [token]);

  useEffect(() => {
    // If user is already authenticated, proceed to acceptance
    if (user && invitation && step === 'auth') {
      handleAcceptInvitation();
    }
  }, [user, invitation, step]);

  const loadInvitationDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await invitationService.getInvitationByToken(token);
      
      if (result.success) {
        setInvitation(result.data);
        // Track invitation opened
        await invitationService.trackInvitationEvent(result.data.id, 'opened');
        
        // If user is already authenticated, go straight to acceptance
        if (user) {
          setStep('accepting');
          handleAcceptInvitation();
        } else {
          setStep('auth');
        }
      } else {
        setError(result.error);
        setStep('error');
      }
    } catch (error) {
      setError('Failed to load invitation details');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!user) {
      setStep('auth');
      return;
    }

    try {
      setProcessing(true);
      setStep('accepting');

      const result = await invitationService.acceptInvitation(token);
      
      if (result.success) {
        setStep('welcome');
        // Redirect to workspace after a delay
        setTimeout(() => {
          navigate('/dashboard-screen');
        }, 3000);
      } else {
        setError(result.error);
        setStep('error');
      }
    } catch (error) {
      setError('Failed to accept invitation');
      setStep('error');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineInvitation = async (reason = '') => {
    try {
      const result = await invitationService.declineInvitation(token, reason);
      
      if (result.success) {
        // Show decline confirmation and redirect
        alert('Invitation declined successfully');
        navigate('/');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to decline invitation');
    }
  };

  const handleAuthSuccess = () => {
    // User is now authenticated, proceed to accept invitation
    handleAcceptInvitation();
  };

  if (loading || step === 'loading') {
    return <LoadingScreen message="Loading invitation details..." />;
  }

  if (step === 'accepting') {
    return (
      <LoadingScreen 
        message={`Joining ${invitation?.workspace?.name || 'workspace'}...`}
        steps={[
          'Verifying invitation',
          'Setting up your account',
          'Configuring permissions',
          'Finalizing setup'
        ]}
      />
    );
  }

  if (step === 'welcome') {
    return (
      <WelcomeScreen 
        workspace={invitation?.workspace}
        role={invitation?.role}
        onGetStarted={() => navigate('/dashboard-screen')}
      />
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-gray-800 rounded-xl border border-gray-700 p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X className="w-8 h-8 text-red-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">Invitation Error</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              variant="primary"
              className="w-full"
            >
              Go to Homepage
            </Button>
            
            <button
              onClick={loadInvitationDetails}
              className="w-full text-blue-400 hover:text-blue-300 text-sm"
            >
              Try Again
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-center">
            {invitation?.workspace?.branding?.logo ? (
              <img
                src={invitation.workspace.branding.logo}
                alt={invitation.workspace.name}
                className="h-12 mx-auto mb-4"
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-white" />
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-white mb-2">
              You're Invited!
            </h1>
            <p className="text-blue-100">
              Join {invitation?.workspace?.name} on Mewayz
            </p>
          </div>

          {/* Invitation Details */}
          <div className="p-8">
            <div className="bg-gray-700/30 rounded-lg p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-2">Invitation Details</h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Role:</span>
                      <span className="text-white capitalize">{invitation?.role}</span>
                    </div>
                    
                    {invitation?.department && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Department:</span>
                        <span className="text-white">{invitation.department}</span>
                      </div>
                    )}
                    
                    {invitation?.position && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Position:</span>
                        <span className="text-white">{invitation.position}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Invited by:</span>
                      <span className="text-white">{invitation?.inviter?.full_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Message */}
            {invitation?.personal_message && (
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Mail className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-300 font-medium mb-1">Personal Message</p>
                    <p className="text-blue-100 italic">"{invitation.personal_message}"</p>
                  </div>
                </div>
              </div>
            )}

            {/* Team Preview */}
            <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <Users className="w-5 h-5 text-gray-400" />
                <span className="text-white font-medium">Join the Team</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>You'll be joining</span>
                <span className="text-white font-medium">{invitation?.workspace?.name}</span>
                <span>as a</span>
                <span className="text-blue-400 font-medium capitalize">{invitation?.role}</span>
              </div>
            </div>

            {/* Authentication Options */}
            {!user && (
              <div className="mb-6">
                <AuthSelector
                  method={authMethod}
                  onMethodChange={setAuthMethod}
                  email={invitation?.email}
                  onAuthSuccess={handleAuthSuccess}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              {user ? (
                <Button
                  onClick={handleAcceptInvitation}
                  loading={processing}
                  disabled={processing}
                  className="flex-1"
                >
                  <UserCheck className="w-4 h-4 mr-2" />
                  Accept Invitation
                </Button>
              ) : (
                <div className="flex-1 text-center p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <p className="text-blue-300 text-sm">
                    Sign in or create an account to accept this invitation
                  </p>
                </div>
              )}
              
              <Button
                variant="secondary"
                onClick={() => handleDeclineInvitation('User declined invitation')}
                className="sm:w-auto"
              >
                Decline
              </Button>
            </div>

            {/* Terms */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-xs">
                By accepting this invitation, you agree to Mewayz{' '}
                <a href="/terms" className="text-blue-400 hover:text-blue-300">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-blue-400 hover:text-blue-300">Privacy Policy</a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InvitationAcceptance;