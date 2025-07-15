import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { DashboardProvider } from './components/DashboardProvider';
import DashboardHeader from '../../components/ui/DashboardHeader';
import WelcomeSection from './components/WelcomeSection';
import MetricsGrid from './components/MetricsGrid';
import GoalsOverview from './components/GoalsOverview';
import QuickActionsGrid from './components/QuickActionsGrid';
import ActivityFeed from './components/ActivityFeed';
import SettingsModal from './components/SettingsModal';
import GoalSetupModal from './components/GoalSetupModal';
import NotificationCenter from './components/NotificationCenter';

const EnhancedDashboardScreen = () => {
  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Enhanced Dashboard - Mewayz</title>
        <meta name="description" content="Mewayz Enhanced Dashboard - Your intelligent workspace command center with dynamic goals, features, and real-time analytics" />
        <meta name="keywords" content="dashboard, analytics, workspace management, goals, features, real-time, business intelligence" />
      </Helmet>

      <DashboardProvider>
        <div className="min-h-screen bg-background">
          {/* Enhanced Header with Workspace Selector & Notifications */}
          <DashboardHeader />

          {/* Main Content */}
          <main className="px-4 lg:px-6 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Main Content Area */}
                <div className="xl:col-span-3 space-y-8">
                  {/* Enhanced Welcome Section with Search */}
                  <WelcomeSection />

                  {/* Dynamic Metrics Grid */}
                  <MetricsGrid />

                  {/* Goals Overview with Permission-based Display */}
                  <GoalsOverview />

                  {/* Quick Actions Grid with Role-based Filtering */}
                  <QuickActionsGrid />
                </div>

                {/* Right Sidebar */}
                <div className="xl:col-span-1 space-y-6">
                  {/* Notification Center */}
                  <NotificationCenter />

                  {/* Activity Feed */}
                  <ActivityFeed />
                </div>
              </div>
            </div>
          </main>

          {/* Modals */}
          <SettingsModal />
          <GoalSetupModal />
        </div>
      </DashboardProvider>
    </>
  );
};

export default EnhancedDashboardScreen;