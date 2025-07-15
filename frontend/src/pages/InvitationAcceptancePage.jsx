import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import invitationService from '../utils/invitationService';
import Button from '../components/ui/Button';
import { Users, CheckCircle, XCircle, Clock, Mail, User } from 'lucide-react';

const InvitationAcceptancePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await invitationService.getInvitationByToken(token);
      
      if (result.success) {
        setInvitation(result.data);
      } else {
        setError(result.error || 'Failed to load invitation');
      }
    } catch (err) {
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!user) {
      // Redirect to login with return URL
      navigate('/login-screen', { 
        state: { 
          returnUrl: `/accept-invitation/${token}`,
          message: 'Please sign in to accept the invitation'
        }
      });
      return;
    }

    if (user.email !== invitation.email) {
      setError('This invitation is for a different email address. Please sign in with the correct account.');
      return;
    }

    try {
      setProcessing(true);
      setError(null);
      
      const result = await laravelInvitationService.acceptInvitation(token);
      
      if (result.success) {
        // Show success message and redirect to workspace
        navigate('/dashboard-screen', {
          state: {
            message: `You have successfully joined ${invitation.workspace.name}!`,
            workspace: result.data.workspace
          }
        });
      } else {
        setError(result.error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError('Failed to accept invitation');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const result = await laravelInvitationService.declineInvitation(token, declineReason);
      
      if (result.success) {
        setShowDeclineModal(false);
        setError(null);
        // Show decline confirmation
        navigate('/', {
          state: {
            message: 'You have declined the invitation.'
          }
        });
      } else {
        setError(result.error || 'Failed to decline invitation');
      }
    } catch (err) {
      setError('Failed to decline invitation');
    } finally {
      setProcessing(false);
    }
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      owner: 'Full workspace administration including billing and team management',
      admin: 'Platform management and team administration',
      editor: 'Content creation and management with limited settings access',
      contributor: 'Content creation without publishing rights',
      viewer: 'Read-only access with customizable scope',
      guest: 'Limited access with time-bound permissions',
      member: 'Basic access with standard permissions'
    };
    return descriptions[role] || 'Standard workspace access';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Invalid Invitation</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/')}>
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Mewayz</span>
            </div>
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Signed in as</span>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Invitation Card */}
          <div className="bg-card border border-border rounded-lg p-8 mb-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                You've been invited!
              </h1>
              <p className="text-muted-foreground">
                Join the workspace and start collaborating
              </p>
            </div>

            {/* Invitation Details */}
            <div className="space-y-6">
              {/* Workspace Info */}
              <div className="p-4 bg-muted/20 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Workspace</h3>
                <div className="text-2xl font-bold text-blue-500 mb-2">
                  {invitation.workspace.name}
                </div>
                {invitation.workspace.description && (
                  <p className="text-muted-foreground">
                    {invitation.workspace.description}
                  </p>
                )}
              </div>

              {/* Role Info */}
              <div className="p-4 bg-muted/20 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Your Role</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {laravelInvitationService.getRoleDisplayName(invitation.role)}
                  </span>
                  {invitation.department && (
                    <span className="text-muted-foreground">
                      • {invitation.department}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getRoleDescription(invitation.role)}
                </p>
              </div>

              {/* Inviter Info */}
              <div className="p-4 bg-muted/20 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2">Invited by</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {invitation.inviter.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invitation.inviter.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Message */}
              {invitation.personal_message && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">Personal Message</h3>
                  <p className="text-foreground italic">
                    "{invitation.personal_message}"
                  </p>
                </div>
              )}

              {/* Expiry Warning */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Invitation expires on</span>
                </div>
                <p className="text-yellow-700 mt-1">
                  {new Date(invitation.expires_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Email Mismatch Warning */}
              {user && user.email !== invitation.email && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Email Address Mismatch</span>
                  </div>
                  <p className="text-red-700 mt-1">
                    This invitation is for <strong>{invitation.email}</strong> but you're signed in as <strong>{user.email}</strong>. 
                    Please sign in with the correct account to accept this invitation.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-800">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-1">{error}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button
                  onClick={handleAccept}
                  loading={processing}
                  disabled={processing || (user && user.email !== invitation.email)}
                  className="flex-1"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {!user ? 'Sign in to Accept' : 'Accept Invitation'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowDeclineModal(true)}
                  disabled={processing}
                  className="flex-1"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Decline Invitation</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure you want to decline this invitation to join {invitation.workspace.name}?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Reason (optional)
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Let them know why you're declining..."
                className="w-full p-3 border border-border rounded-lg resize-none"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeclineModal(false)}
                disabled={processing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDecline}
                loading={processing}
                disabled={processing}
                className="flex-1"
              >
                Decline
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationAcceptancePage;