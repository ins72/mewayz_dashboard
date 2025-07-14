import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from 'contexts/AuthContext';
import { Mail, Eye, EyeOff, Chrome, Smartphone } from 'lucide-react';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Icon from '../../../components/AppIcon';


const AuthSelector = ({ method, onMethodChange, email, onAuthSuccess }) => {
  const { signIn, signUp, signInWithGoogle, signInWithApple } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: email || '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      if (isSignUp) {
        result = await signUp(formData.email, formData.password, {
          fullName: formData.fullName
        });
      } else {
        result = await signIn(formData.email, formData.password);
      }

      if (result.success) {
        onAuthSuccess();
      } else {
        setErrors({ auth: result.error });
      }
    } catch (error) {
      setErrors({ auth: 'Authentication failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setLoading(true);
    
    try {
      let result;
      
      if (provider === 'google') {
        result = await signInWithGoogle();
      } else if (provider === 'apple') {
        result = await signInWithApple();
      }

      if (result?.success) {
        onAuthSuccess();
      } else {
        setErrors({ auth: result?.error || `${provider} authentication failed` });
      }
    } catch (error) {
      setErrors({ auth: `${provider} authentication failed. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  const authMethods = [
    { id: 'email', label: 'Email & Password', icon: Mail },
    { id: 'google', label: 'Google', icon: Chrome },
    { id: 'apple', label: 'Apple', icon: Smartphone }
  ];

  return (
    <div className="space-y-6">
      {/* Method Selector */}
      <div>
        <h3 className="text-white font-medium mb-3">Choose how to continue</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {authMethods.map((authMethod) => {
            const Icon = authMethod.icon;
            return (
              <button
                key={authMethod.id}
                onClick={() => onMethodChange(authMethod.id)}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                  method === authMethod.id
                    ? 'bg-blue-600 border-blue-500 text-white' :'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{authMethod.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auth Form */}
      <motion.div
        key={method}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {method === 'email' && (
          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600">
            {/* Toggle Sign In/Sign Up */}
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setIsSignUp(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    !isSignUp
                      ? 'bg-blue-600 text-white' :'text-gray-300 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setIsSignUp(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isSignUp
                      ? 'bg-blue-600 text-white' :'text-gray-300 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              {/* Full Name (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Enter your full name"
                    error={errors.fullName}
                  />
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email"
                  error={errors.email}
                  disabled={!!email} // Disable if email is prefilled from invitation
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    error={errors.password}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    error={errors.confirmPassword}
                  />
                </div>
              )}

              {/* Auth Error */}
              {errors.auth && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg">
                  <p className="text-red-300 text-sm">{errors.auth}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>

            {/* Switch Auth Mode */}
            <div className="mt-4 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </div>
        )}

        {method === 'google' && (
          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600 text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Chrome className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Continue with Google</h4>
            <p className="text-gray-400 text-sm mb-4">
              Sign in using your Google account to accept the invitation
            </p>
            
            {errors.auth && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm">{errors.auth}</p>
              </div>
            )}
            
            <Button
              onClick={() => handleSocialAuth('google')}
              loading={loading}
              disabled={loading}
              className="w-full"
            >
              <Chrome className="w-4 h-4 mr-2" />
              Continue with Google
            </Button>
          </div>
        )}

        {method === 'apple' && (
          <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600 text-center">
            <div className="w-12 h-12 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="text-white font-medium mb-2">Continue with Apple</h4>
            <p className="text-gray-400 text-sm mb-4">
              Sign in using your Apple ID to accept the invitation
            </p>
            
            {errors.auth && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-300 text-sm">{errors.auth}</p>
              </div>
            )}
            
            <Button
              onClick={() => handleSocialAuth('apple')}
              loading={loading}
              disabled={loading}
              variant="secondary"
              className="w-full"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Continue with Apple
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AuthSelector;