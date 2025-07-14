import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from "components/ProtectedRoute";
import { WizardProvider } from "contexts/WizardContext";
// Add your imports here
import LandingPage from "pages/LandingPage";
import OnboardingWizard from "pages/OnboardingWizard";
import LoginScreen from "pages/login-screen";
import DashboardScreen from "pages/dashboard-screen";
import EnhancedDashboardScreen from "pages/enhanced-dashboard-screen";
import PasswordResetScreen from "pages/password-reset-screen";
import RegistrationScreen from "pages/registration-screen";
import WorkspaceSetupWizardWelcomeBasics from "pages/workspace-setup-wizard-welcome-basics";
import WorkspaceSetupWizardGoalSelection from "pages/workspace-setup-wizard-goal-selection";
import WorkspaceSetupWizardFeatureSelection from "pages/workspace-setup-wizard-feature-selection";
import WorkspaceSetupWizardSubscriptionPlan from "pages/workspace-setup-wizard-subscription-plan";
import WorkspaceSetupWizardTeamSetup from "pages/workspace-setup-wizard-team-setup";
import WorkspaceSetupWizardBranding from "pages/workspace-setup-wizard-branding";
import InvitationManagement from "pages/invitation-management";
import InvitationAcceptance from "pages/invitation-acceptance";
import NotFound from "pages/NotFound";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <WizardProvider>
        <RouterRoutes>
          {/* Public landing page */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Public invitation route */}
          <Route path="/accept-invitation/:token" element={<InvitationAcceptancePage />} />
          
          {/* Public routes - redirect to dashboard if authenticated */}
          <Route path="/login-screen" element={
            <ProtectedRoute requireAuth={false}>
              <LoginScreen />
            </ProtectedRoute>
          } />
          <Route path="/registration-screen" element={
            <ProtectedRoute requireAuth={false}>
              <RegistrationScreen />
            </ProtectedRoute>
          } />
          <Route path="/password-reset-screen" element={
            <ProtectedRoute requireAuth={false}>
              <PasswordResetScreen />
            </ProtectedRoute>
          } />
          
          {/* Protected routes - require authentication */}
          <Route path="/onboarding/:step" element={
            <ProtectedRoute>
              <OnboardingWizard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard-screen" element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          } />
          <Route path="/enhanced-dashboard-screen" element={
            <ProtectedRoute>
              <EnhancedDashboardScreen />
            </ProtectedRoute>
          } />
          <Route path="/workspace-setup-wizard-welcome-basics" element={
            <ProtectedRoute>
              <WorkspaceSetupWizardWelcomeBasics />
            </ProtectedRoute>
          } />
          <Route path="/workspace-setup-wizard-goal-selection" element={
            <ProtectedRoute>
              <WorkspaceSetupWizardGoalSelection />
            </ProtectedRoute>
          } />
          <Route path="/workspace-setup-wizard-feature-selection" element={
            <ProtectedRoute>
              <WorkspaceSetupWizardFeatureSelection />
            </ProtectedRoute>
          } />
          <Route path="/workspace-setup-wizard-subscription-plan" element={
            <ProtectedRoute>
              <WorkspaceSetupWizardSubscriptionPlan />
            </ProtectedRoute>
          } />
          <Route path="/workspace-setup-wizard-team-setup" element={
            <ProtectedRoute>
              <WorkspaceSetupWizardTeamSetup />
            </ProtectedRoute>
          } />
          <Route path="/workspace-setup-wizard-branding" element={
            <ProtectedRoute>
              <WorkspaceSetupWizardBranding />
            </ProtectedRoute>
          } />
          <Route path="/invitation-management" element={
            <ProtectedRoute>
              <InvitationManagement />
            </ProtectedRoute>
          } />
          <Route path="/accept-invitation/:token" element={
            <ProtectedRoute>
              <InvitationAcceptance />
            </ProtectedRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </WizardProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;