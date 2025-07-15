import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import DashboardHeader from '../../components/ui/DashboardHeader';
import WelcomeSection from './components/WelcomeSection';
import MetricsGrid from './components/MetricsGrid';
import QuickActionsGrid from './components/QuickActionsGrid';
import DashboardFooter from './components/DashboardFooter';

const DashboardScreen = () => {
  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Dashboard - Mewayz</title>
        <meta name="description" content="Mewayz Dashboard - Your central command center for workspace management and business analytics" />
        <meta name="keywords" content="dashboard, analytics, business management, workspace, metrics" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <DashboardHeader />

        {/* Main Content */}
        <main className="px-4 lg:px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <WelcomeSection 
              userName="John" 
              workspaceName="Personal Workspace" 
            />

            {/* Metrics Grid */}
            <MetricsGrid />

            {/* Quick Actions Grid */}
            <QuickActionsGrid />
          </div>
        </main>

        {/* Footer */}
        <DashboardFooter />
      </div>
    </>
  );
};

export default DashboardScreen;