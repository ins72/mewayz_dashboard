# 🎨 Frontend Components Documentation - Mewayz

## Overview

This documentation covers all React components in the Mewayz application, organized by category and functionality. The frontend is built with React 18, styled with Tailwind CSS, and uses modern React patterns.

## 📁 Component Architecture

```
src/
├── components/
│   ├── dashboard/          # Dashboard-specific components
│   ├── onboarding/         # Onboarding wizard components
│   └── ui/                 # Reusable UI components
├── pages/                  # Page components
├── contexts/               # React contexts
└── utils/                  # Utility functions
```

---

## 🎯 Onboarding Components

### OnboardingWizard.jsx
**Purpose**: Main orchestrator for the 6-step onboarding process

**Props:**
```javascript
// No props required - uses OnboardingContext internally
```

**Features:**
- Step progression management
- Progress indicator
- Navigation between steps
- State persistence
- Error handling

**Usage:**
```jsx
import OnboardingWizard from 'components/onboarding/OnboardingWizard';

function App() {
  return (
    <OnboardingWizard />
  );
}
```

### GoalSelectionStep.jsx
**Purpose**: First step - Business goal selection

**Props:**
```javascript
{
  onNext: () => void,
  onBack: () => void,
  isLoading: boolean
}
```

**Features:**
- Pre-defined business goals
- Custom goal input
- Multiple selection support
- Progress tracking

**Goals Options:**
- Increase Brand Awareness
- Generate More Leads
- Improve Customer Engagement
- Drive Website Traffic
- Boost Sales Revenue
- Build Community
- Create Educational Content
- Enhance Customer Support

**Usage:**
```jsx
<GoalSelectionStep
  onNext={handleNext}
  onBack={handleBack}
  isLoading={false}
/>
```

### FeatureSelectionStep.jsx
**Purpose**: Second step - Feature preferences selection

**Props:**
```javascript
{
  onNext: () => void,
  onBack: () => void,
  isLoading: boolean
}
```

**Features:**
- Feature grid layout
- Priority selection
- Feature descriptions
- Recommendation system

**Available Features:**
- Social Media Management
- Instagram Automation
- Link in Bio Builder
- Email Marketing
- CRM System
- Analytics Dashboard
- Course Creator
- E-commerce Store
- Booking System
- Website Builder

**Usage:**
```jsx
<FeatureSelectionStep
  onNext={handleNext}
  onBack={handleBack}
  isLoading={false}
/>
```

### TeamSetupStep.jsx
**Purpose**: Third step - Team member setup

**Props:**
```javascript
{
  onNext: () => void,
  onBack: () => void,
  isLoading: boolean
}
```

**Features:**
- Team member invitation
- Role assignment
- Bulk invitation support
- Email validation
- Progress tracking

**Team Roles:**
- Owner (Full access)
- Admin (Administrative access)
- Editor (Content management)
- Contributor (Limited editing)
- Viewer (Read-only access)

**Usage:**
```jsx
<TeamSetupStep
  onNext={handleNext}
  onBack={handleBack}
  isLoading={false}
/>
```

### SubscriptionSelectionStep.jsx
**Purpose**: Fourth step - Subscription plan selection

**Props:**
```javascript
{
  onNext: () => void,
  onBack: () => void,
  isLoading: boolean
}
```

**Features:**
- Plan comparison
- Billing period toggle (Monthly/Yearly)
- Feature highlights
- Pricing display
- Stripe integration

**Subscription Plans:**
- **Basic**: $29.99/month
  - Up to 5 social accounts
  - Basic analytics
  - Email support
- **Pro**: $79.99/month
  - Up to 25 social accounts
  - Advanced analytics
  - Priority support
  - Custom branding
- **Enterprise**: $199.99/month
  - Unlimited social accounts
  - White-label solution
  - Dedicated support
  - API access

**Usage:**
```jsx
<SubscriptionSelectionStep
  onNext={handleNext}
  onBack={handleBack}
  isLoading={false}
/>
```

### BrandingSetupStep.jsx
**Purpose**: Fifth step - Company branding setup

**Props:**
```javascript
{
  onNext: () => void,
  onBack: () => void,
  isLoading: boolean
}
```

**Features:**
- Logo upload
- Color scheme selection
- Brand guidelines
- Custom themes
- Preview functionality

**Branding Options:**
- Logo upload (base64 encoding)
- Primary color selection
- Secondary color selection
- Font selection
- Brand description
- Company information

**Usage:**
```jsx
<BrandingSetupStep
  onNext={handleNext}
  onBack={handleBack}
  isLoading={false}
/>
```

### DashboardCustomizationStep.jsx
**Purpose**: Sixth step - Dashboard layout customization

**Props:**
```javascript
{
  onNext: () => void,
  onBack: () => void,
  isLoading: boolean
}
```

**Features:**
- Widget selection
- Layout customization
- Dashboard preview
- Quick action setup
- Final configuration

**Dashboard Widgets:**
- Analytics Overview
- Recent Activity
- Quick Actions
- Social Media Feed
- Performance Metrics
- Team Activity
- Revenue Tracking
- Notifications

**Usage:**
```jsx
<DashboardCustomizationStep
  onNext={handleNext}
  onBack={handleBack}
  isLoading={false}
/>
```

---

## 📊 Dashboard Components

### QuickActionsHub.jsx
**Purpose**: Central hub for quick action tiles

**Props:**
```javascript
{
  className?: string,
  workspaceId: string,
  userRole: string
}
```

**Features:**
- Grid layout for action tiles
- Role-based access control
- Navigation integration
- Real-time updates
- Responsive design

**Quick Actions:**
- Instagram Management
- Link in Bio Builder
- Email Campaigns
- Payment Dashboard
- Analytics View
- Team Management
- Settings Access

**Usage:**
```jsx
<QuickActionsHub
  workspaceId="uuid"
  userRole="admin"
  className="mt-6"
/>
```

### InstagramManagement.jsx
**Purpose**: Instagram content management interface

**Props:**
```javascript
{
  workspaceId: string,
  onClose?: () => void
}
```

**Features:**
- Post creation interface
- Media upload
- Caption editing
- Hashtag suggestions
- Scheduling system
- Analytics dashboard

**Instagram Features:**
- Create new posts
- Schedule posts
- Media library
- Hashtag generator
- Performance analytics
- Engagement tracking
- Story management
- IGTV integration

**Usage:**
```jsx
<InstagramManagement
  workspaceId="uuid"
  onClose={handleClose}
/>
```

### LinkInBioBuilder.jsx
**Purpose**: Link in bio page builder

**Props:**
```javascript
{
  workspaceId: string,
  onClose?: () => void
}
```

**Features:**
- Drag-and-drop interface
- Link management
- Theme customization
- Preview functionality
- Analytics tracking

**Link Types:**
- Website links
- Social media links
- Email links
- Phone links
- Custom buttons
- Product links
- Contact forms

**Usage:**
```jsx
<LinkInBioBuilder
  workspaceId="uuid"
  onClose={handleClose}
/>
```

### PaymentDashboard.jsx
**Purpose**: Payment and subscription management

**Props:**
```javascript
{
  workspaceId: string,
  onClose?: () => void
}
```

**Features:**
- Revenue overview
- Transaction history
- Subscription management
- Payment analytics
- Refund processing

**Payment Features:**
- Revenue tracking ($24,567.89 total)
- Monthly revenue ($3,456.78)
- Active subscriptions (142)
- Transaction history
- Payment methods
- Subscription plans
- Billing management
- Tax reporting

**Usage:**
```jsx
<PaymentDashboard
  workspaceId="uuid"
  onClose={handleClose}
/>
```

### EmailCampaignBuilder.jsx
**Purpose**: Email marketing campaign builder

**Props:**
```javascript
{
  workspaceId: string,
  onClose?: () => void
}
```

**Features:**
- Campaign creation
- Template selection
- Audience segmentation
- Analytics tracking
- A/B testing

**Email Features:**
- Campaign management
- Template gallery
- Audience lists (12,845 subscribers)
- Analytics (64.9% open rate, 11.5% click rate)
- Automation workflows
- Segmentation tools
- Performance tracking

**Usage:**
```jsx
<EmailCampaignBuilder
  workspaceId="uuid"
  onClose={handleClose}
/>
```

---

## 🎨 UI Components

### Button.jsx
**Purpose**: Reusable button component with variants

**Props:**
```javascript
{
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link',
  size: 'default' | 'sm' | 'lg' | 'icon',
  className?: string,
  disabled?: boolean,
  loading?: boolean,
  children: React.ReactNode,
  onClick?: () => void,
  type?: 'button' | 'submit' | 'reset'
}
```

**Variants:**
- `default`: Primary blue button
- `destructive`: Red button for dangerous actions
- `outline`: Outlined button
- `secondary`: Secondary gray button
- `ghost`: Transparent button
- `link`: Text link button

**Usage:**
```jsx
<Button
  variant="default"
  size="lg"
  onClick={handleClick}
  loading={isLoading}
>
  Save Changes
</Button>
```

### Input.jsx
**Purpose**: Styled input component with validation

**Props:**
```javascript
{
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url',
  placeholder?: string,
  value: string,
  onChange: (e: Event) => void,
  error?: string,
  disabled?: boolean,
  required?: boolean,
  className?: string,
  icon?: React.ReactNode,
  label?: string
}
```

**Features:**
- Built-in validation
- Error state styling
- Icon support
- Label integration
- Accessibility features

**Usage:**
```jsx
<Input
  type="email"
  label="Email Address"
  placeholder="Enter your email"
  value={email}
  onChange={handleEmailChange}
  error={emailError}
  required
/>
```

### Card.jsx
**Purpose**: Container component for content sections

**Props:**
```javascript
{
  className?: string,
  children: React.ReactNode,
  title?: string,
  subtitle?: string,
  actions?: React.ReactNode,
  padding?: 'none' | 'sm' | 'md' | 'lg'
}
```

**Features:**
- Consistent styling
- Header with title/subtitle
- Action buttons
- Responsive padding
- Shadow effects

**Usage:**
```jsx
<Card
  title="User Profile"
  subtitle="Manage your account settings"
  actions={<Button>Edit</Button>}
  padding="lg"
>
  <div>Card content here</div>
</Card>
```

### Checkbox.jsx
**Purpose**: Styled checkbox component

**Props:**
```javascript
{
  id: string,
  label: string,
  checked: boolean,
  onChange: (checked: boolean) => void,
  disabled?: boolean,
  error?: string,
  className?: string
}
```

**Features:**
- Custom styling
- Label integration
- Error state
- Accessibility compliance
- Click handling fix

**Usage:**
```jsx
<Checkbox
  id="terms"
  label="I agree to the terms and conditions"
  checked={acceptedTerms}
  onChange={setAcceptedTerms}
/>
```

### Select.jsx
**Purpose**: Dropdown selection component

**Props:**
```javascript
{
  options: Array<{value: string, label: string}>,
  value: string,
  onChange: (value: string) => void,
  placeholder?: string,
  disabled?: boolean,
  error?: string,
  className?: string,
  label?: string
}
```

**Features:**
- Searchable options
- Multi-select support
- Custom styling
- Keyboard navigation
- Mobile-friendly

**Usage:**
```jsx
<Select
  label="Select Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' }
  ]}
  value={selectedCountry}
  onChange={setSelectedCountry}
  placeholder="Choose a country"
/>
```

### GoogleOAuthButton.jsx
**Purpose**: Google OAuth authentication button

**Props:**
```javascript
{
  onSuccess: (response: GoogleAuthResponse) => void,
  onError: (error: Error) => void,
  text?: string,
  variant?: 'signin' | 'signup',
  disabled?: boolean,
  className?: string
}
```

**Features:**
- Google branding
- OAuth integration
- Error handling
- Loading states
- Accessibility

**Usage:**
```jsx
<GoogleOAuthButton
  onSuccess={handleGoogleSuccess}
  onError={handleGoogleError}
  text="Sign in with Google"
  variant="signin"
/>
```

### UserMenu.jsx
**Purpose**: User profile dropdown menu

**Props:**
```javascript
{
  user: {
    name: string,
    email: string,
    avatar?: string
  },
  onProfileClick: () => void,
  onSettingsClick: () => void,
  onLogout: () => void
}
```

**Features:**
- User avatar display
- Profile information
- Menu options
- Logout functionality
- Responsive design

**Usage:**
```jsx
<UserMenu
  user={currentUser}
  onProfileClick={handleProfile}
  onSettingsClick={handleSettings}
  onLogout={handleLogout}
/>
```

### WorkspaceSelector.jsx
**Purpose**: Workspace selection dropdown

**Props:**
```javascript
{
  workspaces: Array<{
    id: string,
    name: string,
    logo?: string,
    role: string
  }>,
  currentWorkspace: string,
  onWorkspaceChange: (workspaceId: string) => void
}
```

**Features:**
- Workspace list
- Role indicators
- Search functionality
- Creation option
- Visual indicators

**Usage:**
```jsx
<WorkspaceSelector
  workspaces={userWorkspaces}
  currentWorkspace={activeWorkspace}
  onWorkspaceChange={handleWorkspaceChange}
/>
```

### DashboardHeader.jsx
**Purpose**: Dashboard page header component

**Props:**
```javascript
{
  title: string,
  subtitle?: string,
  user: UserObject,
  workspace: WorkspaceObject,
  onWorkspaceChange: (workspaceId: string) => void,
  actions?: React.ReactNode
}
```

**Features:**
- Page title display
- User menu integration
- Workspace selector
- Action buttons
- Responsive layout

**Usage:**
```jsx
<DashboardHeader
  title="Analytics Dashboard"
  subtitle="Track your performance"
  user={currentUser}
  workspace={currentWorkspace}
  onWorkspaceChange={handleWorkspaceChange}
  actions={<Button>Export Data</Button>}
/>
```

---

## 📱 Page Components

### LandingPage.jsx
**Purpose**: Main marketing landing page

**Features:**
- Hero section with CTA
- Features showcase
- Testimonials
- Pricing section
- Footer with links

**Sections:**
- Hero with value proposition
- Feature highlights
- Social proof
- Pricing plans
- Call-to-action

**Usage:**
```jsx
// Automatically rendered on root route
<Route path="/" element={<LandingPage />} />
```

### InvitationAcceptancePage.jsx
**Purpose**: Workspace invitation acceptance page

**Props:**
```javascript
{
  token: string // From URL params
}
```

**Features:**
- Invitation details display
- Accept/decline actions
- Authentication integration
- Error handling
- Success confirmation

**Usage:**
```jsx
// Route configuration
<Route path="/invitation/:token" element={<InvitationAcceptancePage />} />
```

### NotFound.jsx
**Purpose**: 404 error page

**Features:**
- Custom 404 message
- Navigation links
- Search functionality
- Support contact
- Friendly design

**Usage:**
```jsx
// Route configuration
<Route path="*" element={<NotFound />} />
```

---

## 🔧 Contexts

### AuthContext.jsx
**Purpose**: Authentication state management

**Provider Props:**
```javascript
{
  children: React.ReactNode
}
```

**Context Value:**
```javascript
{
  user: UserObject | null,
  token: string | null,
  isLoading: boolean,
  isAuthenticated: boolean,
  signIn: (email: string, password: string) => Promise<void>,
  signUp: (userData: object) => Promise<void>,
  signOut: () => Promise<void>,
  updateUser: (userData: object) => Promise<void>
}
```

**Usage:**
```jsx
const { user, isAuthenticated, signIn, signOut } = useAuth();
```

### OnboardingContext.jsx
**Purpose**: Onboarding wizard state management

**Provider Props:**
```javascript
{
  children: React.ReactNode
}
```

**Context Value:**
```javascript
{
  currentStep: number,
  totalSteps: number,
  wizardData: object,
  nextStep: () => void,
  prevStep: () => void,
  goToStep: (step: number) => void,
  updateWizardData: (data: object) => void,
  submitWizard: () => Promise<void>,
  isLoading: boolean
}
```

**Usage:**
```jsx
const { currentStep, wizardData, nextStep, updateWizardData } = useOnboarding();
```

### WizardContext.jsx
**Purpose**: Generic wizard state management

**Provider Props:**
```javascript
{
  children: React.ReactNode,
  totalSteps: number,
  onComplete: (data: object) => void
}
```

**Context Value:**
```javascript
{
  currentStep: number,
  totalSteps: number,
  data: object,
  progress: number,
  isFirstStep: boolean,
  isLastStep: boolean,
  nextStep: () => void,
  prevStep: () => void,
  updateData: (data: object) => void,
  complete: () => void
}
```

**Usage:**
```jsx
const { currentStep, progress, nextStep, updateData } = useWizard();
```

---

## 🛡️ Protected Components

### ProtectedRoute.jsx
**Purpose**: Route protection wrapper

**Props:**
```javascript
{
  children: React.ReactNode,
  requireAuth?: boolean,
  requiredRole?: string,
  fallback?: React.ReactNode
}
```

**Features:**
- Authentication checks
- Role-based access
- Automatic redirects
- Loading states
- Error handling

**Usage:**
```jsx
<ProtectedRoute requireAuth={true} requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

### ErrorBoundary.jsx
**Purpose**: Error boundary for component errors

**Props:**
```javascript
{
  children: React.ReactNode,
  fallback?: React.ReactNode,
  onError?: (error: Error, errorInfo: object) => void
}
```

**Features:**
- Error catching
- Fallback UI
- Error reporting
- Recovery options
- User-friendly messages

**Usage:**
```jsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <MainApplication />
</ErrorBoundary>
```

---

## 📐 Styling Guidelines

### Tailwind Classes
Common utility classes used throughout components:

**Layout:**
- `flex`, `grid`, `container`
- `w-full`, `h-full`, `min-h-screen`
- `p-4`, `m-4`, `space-y-4`

**Colors:**
- `bg-white`, `bg-gray-50`, `bg-blue-600`
- `text-gray-900`, `text-white`, `text-blue-600`
- `border-gray-200`, `border-blue-300`

**Typography:**
- `text-sm`, `text-base`, `text-lg`, `text-xl`
- `font-medium`, `font-semibold`, `font-bold`
- `leading-relaxed`, `tracking-wide`

**Interactions:**
- `hover:bg-gray-50`, `hover:text-blue-600`
- `focus:outline-none`, `focus:ring-2`
- `transition-colors`, `duration-200`

### Component Styling
```jsx
// Example component with proper styling
const StyledComponent = ({ className, ...props }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-sm border border-gray-200 p-6",
        "hover:shadow-md transition-shadow duration-200",
        className
      )}
      {...props}
    />
  );
};
```

---

## 🔄 State Management

### Component State
```jsx
// Local component state
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState([]);

// Form state with validation
const [formData, setFormData] = useState({
  name: '',
  email: '',
  message: ''
});

const [errors, setErrors] = useState({});
```

### Context State
```jsx
// Using context for shared state
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('token', response.token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 📱 Responsive Design

### Breakpoints
```javascript
// Tailwind breakpoints used
const breakpoints = {
  sm: '640px',   // Small devices
  md: '768px',   // Medium devices
  lg: '1024px',  // Large devices
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // 2X large devices
};
```

### Mobile-First Approach
```jsx
// Mobile-first responsive component
const ResponsiveComponent = () => {
  return (
    <div className="
      grid grid-cols-1 gap-4
      md:grid-cols-2 md:gap-6
      lg:grid-cols-3 lg:gap-8
      xl:grid-cols-4
    ">
      {/* Content */}
    </div>
  );
};
```

### Mobile Optimizations
- Touch-friendly tap targets (min 44px)
- Optimized form inputs
- Drawer-style navigation
- Swipe gestures
- Reduced content density

---

## 🎭 Animation Guidelines

### Framer Motion Usage
```jsx
import { motion } from 'framer-motion';

const AnimatedComponent = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      Content
    </motion.div>
  );
};
```

### Common Animations
- Fade in/out
- Slide transitions
- Scale hover effects
- Loading spinners
- Page transitions

---

## 🔍 Testing Components

### Testing Setup
```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthProvider } from 'contexts/AuthContext';

const renderWithProvider = (component) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  );
};

test('renders button with correct text', () => {
  renderWithProvider(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Testing Patterns
- Unit tests for individual components
- Integration tests for component interactions
- End-to-end tests for complete workflows
- Accessibility testing
- Performance testing

---

## 📚 Best Practices

### Component Design
1. **Single Responsibility**: Each component has one clear purpose
2. **Prop Validation**: Use TypeScript or PropTypes
3. **Default Props**: Provide sensible defaults
4. **Error Handling**: Graceful error states
5. **Accessibility**: ARIA labels and keyboard navigation

### Performance
1. **Lazy Loading**: Dynamic imports for large components
2. **Memoization**: React.memo for expensive components
3. **Code Splitting**: Bundle optimization
4. **Image Optimization**: Proper sizing and formats
5. **State Management**: Minimize re-renders

### Code Organization
1. **Consistent Naming**: Clear, descriptive names
2. **File Structure**: Logical organization
3. **Import Order**: External, internal, relative
4. **Comments**: Document complex logic
5. **Reusability**: Extract common patterns

---

## 🔧 Development Tools

### VS Code Extensions
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Prettier - Code formatter
- ESLint

### Browser Extensions
- React Developer Tools
- Redux DevTools
- Lighthouse
- ColorZilla
- Wappalyzer

### Command Line Tools
```bash
# Component generation
npx generate-react-cli component ComponentName

# Linting
npm run lint

# Testing
npm run test

# Build
npm run build
```

---

## 📞 Support

For component-related questions:
- Check the component source code
- Review usage examples
- Test in isolation
- Check browser console for errors
- Review React DevTools

---

**Last updated: January 2025**