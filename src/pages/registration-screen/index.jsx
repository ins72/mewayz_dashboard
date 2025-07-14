import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import AuthNavigationLinks from '../../components/ui/AuthNavigationLinks';
import RegistrationForm from './components/RegistrationForm';
import SocialRegistrationButtons from './components/SocialRegistrationButtons';

const RegistrationScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock existing users for duplicate email validation
  const existingUsers = [
    'john.doe@example.com',
    'jane.smith@example.com',
    'admin@mewayz.com'
  ];

  const handleRegistration = async (formData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for duplicate email
      if (existingUsers.includes(formData.email.toLowerCase())) {
        throw new Error('An account with this email already exists. Please use a different email or sign in.');
      }

      // Simulate successful registration
      setSuccess('Account created successfully! Please check your email to verify your account before signing in.');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login-screen');
      }, 3000);

    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate Google OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful Google signup
      setSuccess('Google account connected successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard-screen');
      }, 2000);

    } catch (err) {
      setError('Google signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignup = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Simulate Apple OAuth
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate successful Apple signup
      setSuccess('Apple account connected successfully! Redirecting to dashboard...');
      
      setTimeout(() => {
        navigate('/dashboard-screen');
      }, 2000);

    } catch (err) {
      setError('Apple signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create Account - Mewayz</title>
        <meta name="description" content="Create your Mewayz account to access our comprehensive business management platform" />
      </Helmet>

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
                <Icon name="Zap" size={24} color="white" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Create your account
            </h1>
            <p className="text-muted-foreground">
              Join thousands of businesses using Mewayz to grow their operations
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-card">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={16} className="text-destructive" />
                  <p className="text-sm text-destructive font-medium">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="CheckCircle" size={16} className="text-success" />
                  <p className="text-sm text-success font-medium">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* Registration Form */}
            <RegistrationForm 
              onSubmit={handleRegistration}
              isLoading={isLoading}
            />

            {/* Social Registration */}
            <div className="mt-6">
              <SocialRegistrationButtons
                onGoogleSignup={handleGoogleSignup}
                onAppleSignup={handleAppleSignup}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Navigation Links */}
          <AuthNavigationLinks />

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
              <br />
              © {new Date().getFullYear()} Mewayz. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationScreen;