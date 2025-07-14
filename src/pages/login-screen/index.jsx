import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginHeader from './components/LoginHeader';
import LoginForm from './components/LoginForm';
import SocialAuthButtons from './components/SocialAuthButtons';
import ForgotPasswordLink from './components/ForgotPasswordLink';
import AuthNavigationLinks from '../../components/ui/AuthNavigationLinks';

const LoginScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const [locationMessage, setLocationMessage] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    if (!loading && user) {
      navigate('/dashboard-screen');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Check for messages from registration or other routes
    if (location.state?.message) {
      setLocationMessage({
        type: 'success',
        text: location.state.message
      });
      
      // Clear the state after showing the message
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl p-8 shadow-card">
            <div className="space-y-6 animate-pulse">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-lg mx-auto"></div>
                <div className="w-32 h-6 bg-muted rounded mx-auto"></div>
                <div className="w-48 h-4 bg-muted rounded mx-auto"></div>
              </div>
              <div className="space-y-4">
                <div className="w-full h-12 bg-muted rounded"></div>
                <div className="w-full h-12 bg-muted rounded"></div>
                <div className="w-full h-12 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Authentication Card */}
        <div className="bg-card border border-border rounded-xl p-8 shadow-card">
          <LoginHeader />
          
          {/* Success/Info Messages */}
          {locationMessage && (
            <div className={`mb-6 p-4 rounded-lg border ${
              locationMessage.type === 'success' ?'bg-success/10 border-success/20 text-success' :'bg-primary/10 border-primary/20 text-primary'
            }`}>
              <p className="text-sm">{locationMessage.text}</p>
            </div>
          )}
          
          <div className="space-y-6">
            <LoginForm />
            
            <ForgotPasswordLink />
            
            <SocialAuthButtons />
          </div>
        </div>

        {/* Navigation Links */}
        <AuthNavigationLinks />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Mewayz. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;