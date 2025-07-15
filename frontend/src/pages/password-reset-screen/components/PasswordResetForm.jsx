import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const PasswordResetForm = () => {
  const navigate = useNavigate();
  const { resetPassword, authError, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    clearError?.();
    
    try {
      const result = await resetPassword(email);
      
      if (result?.success) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.log('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
    clearError?.();
  };

  if (isSuccess) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Reset Email Sent
          </h3>
          <p className="text-sm text-muted-foreground">
            We have sent a password reset link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Please check your inbox and follow the instructions to reset your password.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/login-screen')}
            variant="default"
            fullWidth
          >
            Back to Sign In
          </Button>
          
          <Button
            onClick={() => {
              setIsSuccess(false);
              setEmail('');
            }}
            variant="outline"
            fullWidth
          >
            Send Another Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">
            Forgot your password?
          </h2>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>

        {(authError || error) && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{authError || error}</p>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={handleEmailChange}
          error={error}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-4">
        <Button
          type="submit"
          variant="default"
          fullWidth
          loading={isLoading}
          disabled={isLoading || !email}
        >
          {isLoading ? 'Sending Reset Email...' : 'Send Reset Email'}
        </Button>

        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => navigate('/login-screen')}
          disabled={isLoading}
        >
          Back to Sign In
        </Button>
      </div>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Remember your password?{' '}
          <button
            type="button"
            onClick={() => navigate('/login-screen')}
            className="text-primary hover:text-primary/80 underline"
            disabled={isLoading}
          >
            Sign in here
          </button>
        </p>
      </div>
    </form>
  );
};

export default PasswordResetForm;