import React from 'react';
import Icon from '../../../components/AppIcon';

const SecurityInfo = () => {
  const securityFeatures = [
    {
      icon: 'Shield',
      title: 'Secure Process',
      description: 'Your password reset is protected with industry-standard encryption'
    },
    {
      icon: 'Clock',
      title: 'Time Limited',
      description: 'Reset links expire after 24 hours for your security'
    },
    {
      icon: 'Mail',
      title: 'Email Verification',
      description: 'We only send reset links to verified email addresses'
    }
  ];

  return (
    <div className="mt-8 p-6 bg-card border border-border rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Info" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">
          Security Information
        </h3>
      </div>
      
      <div className="space-y-4">
        {securityFeatures.map((feature, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="flex items-center justify-center w-8 h-8 bg-primary/20 rounded-lg flex-shrink-0">
              <Icon name={feature.icon} size={16} className="text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                {feature.title}
              </h4>
              <p className="text-xs text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={16} className="text-warning mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground mb-1">
              Important Security Notice
            </h4>
            <p className="text-xs text-muted-foreground">
              If you didn't request this password reset, please contact our support team immediately. 
              Never share your reset link with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityInfo;