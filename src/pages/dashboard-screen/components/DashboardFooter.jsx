import React from 'react';
import Icon from '../../../components/AppIcon';

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Support", href: "#" },
    { label: "Documentation", href: "#" }
  ];

  return (
    <footer className="mt-16 border-t border-border bg-background">
      <div className="px-4 lg:px-6 py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-lg">
                <Icon name="Zap" size={14} color="white" />
              </div>
              <span className="font-semibold text-foreground">Mewayz</span>
            </div>
            <span className="text-sm text-muted-foreground">
              © {currentYear} Mewayz. All rights reserved.
            </span>
          </div>

          {/* Footer Links */}
          <div className="flex items-center space-x-6">
            {footerLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span className="text-muted-foreground">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;