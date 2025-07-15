import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, userProfile, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const result = await signOut();
      if (result?.success) {
        navigate('/login-screen');
      }
    } catch (error) {
      console.log('Sign out error:', error);
    } finally {
      setIsLoggingOut(false);
      setIsOpen(false);
    }
  };

  const menuItems = [
    {
      label: 'Profile Settings',
      icon: 'User',
      onClick: () => {
        console.log('Profile settings clicked');
        setIsOpen(false);
      }
    },
    {
      label: 'Account Settings',
      icon: 'Settings',
      onClick: () => {
        console.log('Account settings clicked');
        setIsOpen(false);
      }
    },
    {
      label: 'Help & Support',
      icon: 'HelpCircle',
      onClick: () => {
        console.log('Help & support clicked');
        setIsOpen(false);
      }
    }
  ];

  // Get user display name and avatar
  const displayName = userProfile?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = userProfile?.email || user?.email || '';
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <div className="relative" ref={menuRef}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
        disabled={isLoggingOut}
      >
        <div className="relative">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success border-2 border-background rounded-full"></div>
        </div>
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          <p className="text-xs text-muted-foreground">{displayEmail}</p>
        </div>
        
        <Icon 
          name={isOpen ? 'ChevronUp' : 'ChevronDown'} 
          size={16} 
          className="text-muted-foreground hidden md:block" 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-lg shadow-modal z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-base font-medium text-primary-foreground">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {displayEmail}
                </p>
                {userProfile?.role && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded-full capitalize">
                    {userProfile.role}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
                disabled={isLoggingOut}
              >
                <Icon name={item.icon} size={16} className="text-muted-foreground" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-border"></div>

          {/* Sign Out */}
          <div className="p-2">
            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              loading={isLoggingOut}
              disabled={isLoggingOut}
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Icon name="LogOut" size={16} className="mr-3" />
              {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;