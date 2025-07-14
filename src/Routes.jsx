import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { WizardProvider } from "contexts/WizardContext";
// Add your imports here
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
          {/* Define your routes here */}
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/login-screen" element={<LoginScreen />} />
          <Route path="/dashboard-screen" element={<DashboardScreen />} />
          <Route path="/enhanced-dashboard-screen" element={<EnhancedDashboardScreen />} />
          <Route path="/password-reset-screen" element={<PasswordResetScreen />} />
          <Route path="/registration-screen" element={<RegistrationScreen />} />
          <Route path="/workspace-setup-wizard-welcome-basics" element={<WorkspaceSetupWizardWelcomeBasics />} />
          <Route path="/workspace-setup-wizard-goal-selection" element={<WorkspaceSetupWizardGoalSelection />} />
          <Route path="/workspace-setup-wizard-feature-selection" element={<WorkspaceSetupWizardFeatureSelection />} />
          <Route path="/workspace-setup-wizard-subscription-plan" element={<WorkspaceSetupWizardSubscriptionPlan />} />
          <Route path="/workspace-setup-wizard-team-setup" element={<WorkspaceSetupWizardTeamSetup />} />
          <Route path="/workspace-setup-wizard-branding" element={<WorkspaceSetupWizardBranding />} />
          <Route path="/invitation-management" element={<InvitationManagement />} />
          <Route path="/accept-invitation/:token" element={<InvitationAcceptance />} />
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </WizardProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;