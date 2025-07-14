import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';

const WelcomeSection = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="mb-8">
        <div className="space-y-2">
          <div className="w-64 h-8 bg-muted rounded animate-pulse"></div>
          <div className="w-48 h-4 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  const userName = userProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';
  const workspaceName = 'Personal Workspace'; // This could come from workspace context later

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {getCurrentGreeting()}, {userName}! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome back to {workspaceName}
        </p>
      </div>
      
      {/* Quick Stats Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              You are logged in as{' '}
              <span className="font-medium text-foreground">
                {userProfile?.role || 'member'}
              </span>
            </p>
            {userProfile?.email && (
              <p className="text-xs text-muted-foreground mt-1">
                {userProfile.email}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSection;