import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import WorkspaceSelector from './WorkspaceSelector';
import UserMenu from './UserMenu';
import Icon from '../AppIcon';

const DashboardHeader = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg animate-pulse"></div>
                <div className="w-20 h-6 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Workspace */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Icon name="Zap" size={18} className="text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground">
                Mewayz
              </h1>
            </div>

            {/* Workspace Selector */}
            <div className="hidden sm:block">
              <WorkspaceSelector />
            </div>
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications (placeholder) */}
            <button className="relative p-2 rounded-lg hover:bg-muted/50 transition-colors">
              <Icon name="Bell" size={20} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>

            {/* User Menu */}
            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Not authenticated</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;