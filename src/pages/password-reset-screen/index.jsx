import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import AuthNavigationLinks from '../../components/ui/AuthNavigationLinks';
import PasswordResetForm from './components/PasswordResetForm';
import SecurityInfo from './components/SecurityInfo';

const PasswordResetScreen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="w-full p-6">
        <div className="max-w-7xl mx-auto">
          <Link to="/login-screen" className="flex items-center space-x-2 w-fit">
            <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <span className="font-semibold text-xl text-foreground">Mewayz</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Form */}
            <div className="flex flex-col items-center">
              <div className="w-full max-w-md">
                <PasswordResetForm />
                <AuthNavigationLinks />
              </div>
            </div>

            {/* Right Side - Security Info */}
            <div className="hidden lg:block">
              <div className="max-w-lg">
                <div className="mb-8">
                  <h1 className="text-4xl font-bold text-foreground mb-4">
                    Secure Password Recovery
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    Reset your password safely with our secure verification process. 
                    We'll guide you through each step to ensure your account remains protected.
                  </p>
                </div>

                <SecurityInfo />

                {/* Help Section */}
                <div className="mt-8 p-6 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <Icon name="HelpCircle" size={20} className="text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">
                      Need Help?
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you're having trouble resetting your password or don't receive the email, 
                    our support team is here to help.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors">
                      <Icon name="Mail" size={16} />
                      <span className="text-sm font-medium">Email Support</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                      <Icon name="MessageCircle" size={16} />
                      <span className="text-sm font-medium">Live Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Security Info */}
      <div className="lg:hidden px-4 pb-8">
        <div className="max-w-md mx-auto">
          <SecurityInfo />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-4 border-t border-border bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6">
              <Link 
                to="/login-screen" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                to="/login-screen" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                to="/login-screen" 
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Support
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Mewayz. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PasswordResetScreen;