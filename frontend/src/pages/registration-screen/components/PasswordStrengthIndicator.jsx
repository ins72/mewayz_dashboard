import React from 'react';
import Icon from '../../../components/AppIcon';

const PasswordStrengthIndicator = ({ password }) => {
  const requirements = [
    {
      id: 'length',
      label: 'At least 8 characters',
      test: (pwd) => pwd.length >= 8
    },
    {
      id: 'uppercase',
      label: 'One uppercase letter',
      test: (pwd) => /[A-Z]/.test(pwd)
    },
    {
      id: 'lowercase',
      label: 'One lowercase letter',
      test: (pwd) => /[a-z]/.test(pwd)
    },
    {
      id: 'number',
      label: 'One number',
      test: (pwd) => /\d/.test(pwd)
    },
    {
      id: 'special',
      label: 'One special character',
      test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
  ];

  const getStrengthLevel = () => {
    const passedCount = requirements.filter(req => req.test(password)).length;
    if (passedCount === 0) return { level: 'none', color: 'bg-muted', text: '' };
    if (passedCount <= 2) return { level: 'weak', color: 'bg-destructive', text: 'Weak' };
    if (passedCount <= 3) return { level: 'fair', color: 'bg-warning', text: 'Fair' };
    if (passedCount <= 4) return { level: 'good', color: 'bg-primary', text: 'Good' };
    return { level: 'strong', color: 'bg-success', text: 'Strong' };
  };

  const strength = getStrengthLevel();
  const passedCount = requirements.filter(req => req.test(password)).length;

  if (!password) return null;

  return (
    <div className="mt-3 space-y-3">
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Password strength</span>
          {strength.text && (
            <span className={`text-xs font-medium ${
              strength.level === 'weak' ? 'text-destructive' :
              strength.level === 'fair' ? 'text-warning' :
              strength.level === 'good' ? 'text-primary' :
              strength.level === 'strong' ? 'text-success' : ''
            }`}>
              {strength.text}
            </span>
          )}
        </div>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((index) => (
            <div
              key={index}
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                index <= passedCount ? strength.color : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-2">
        {requirements.map((requirement) => {
          const isPassed = requirement.test(password);
          return (
            <div key={requirement.id} className="flex items-center space-x-2">
              <div className={`flex items-center justify-center w-4 h-4 rounded-full transition-colors duration-200 ${
                isPassed ? 'bg-success' : 'bg-muted'
              }`}>
                <Icon 
                  name="Check" 
                  size={10} 
                  color={isPassed ? 'white' : 'transparent'} 
                />
              </div>
              <span className={`text-xs transition-colors duration-200 ${
                isPassed ? 'text-success' : 'text-muted-foreground'
              }`}>
                {requirement.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;