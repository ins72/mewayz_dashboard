import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AuthNavigationLinks = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const getNavigationLinks = () => {
    switch (currentPath) {
      case '/login-screen':
        return [
          { label: "Don't have an account?", linkText: "Sign up", path: '/registration-screen' },
          { label: "Forgot your password?", linkText: "Reset it", path: '/password-reset-screen' }
        ];
      case '/registration-screen':
        return [
          { label: "Already have an account?", linkText: "Sign in", path: '/login-screen' },
          { label: "Forgot your password?", linkText: "Reset it", path: '/password-reset-screen' }
        ];
      case '/password-reset-screen':
        return [
          { label: "Remember your password?", linkText: "Sign in", path: '/login-screen' },
          { label: "Don't have an account?", linkText: "Sign up", path: '/registration-screen' }
        ];
      default:
        return [];
    }
  };

  const navigationLinks = getNavigationLinks();

  if (navigationLinks.length === 0) return null;

  return (
    <div className="mt-6 space-y-3 text-center">
      {navigationLinks.map((link, index) => (
        <div key={index} className="text-sm">
          <span className="text-muted-foreground">{link.label} </span>
          <Link
            to={link.path}
            className="text-primary hover:text-primary/80 font-medium transition-colors duration-200"
          >
            {link.linkText}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default AuthNavigationLinks;