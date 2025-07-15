// Business Goals Configuration
export const BUSINESS_GOALS = [
  {
    id: 'instagram_management',
    title: 'Instagram Management & Lead Generation',
    description: 'Manage your Instagram presence, generate leads, and grow your audience',
    icon: '📸',
    color: 'bg-pink-500',
    features: ['social_media_management', 'lead_generation', 'content_scheduling', 'analytics']
  },
  {
    id: 'link_in_bio',
    title: 'Link in Bio Creation & Optimization',
    description: 'Create stunning bio pages that convert visitors into customers',
    icon: '🔗',
    color: 'bg-blue-500',
    features: ['link_in_bio_builder', 'landing_pages', 'conversion_tracking', 'a_b_testing']
  },
  {
    id: 'course_creation',
    title: 'Course Creation & Community Building',
    description: 'Build and monetize online courses with community features',
    icon: '🎓',
    color: 'bg-green-500',
    features: ['course_builder', 'community_platform', 'student_management', 'progress_tracking']
  },
  {
    id: 'ecommerce',
    title: 'E-commerce & Marketplace',
    description: 'Sell products online with full e-commerce capabilities',
    icon: '🛒',
    color: 'bg-purple-500',
    features: ['online_store', 'inventory_management', 'payment_processing', 'order_management']
  },
  {
    id: 'crm_leads',
    title: 'CRM & Lead Management',
    description: 'Manage customer relationships and track sales pipelines',
    icon: '👥',
    color: 'bg-orange-500',
    features: ['crm_system', 'lead_management', 'sales_pipeline', 'email_marketing']
  },
  {
    id: 'website_builder',
    title: 'Website Builder & Content Management',
    description: 'Build professional websites with content management tools',
    icon: '🌐',
    color: 'bg-indigo-500',
    features: ['website_builder', 'content_management', 'seo_tools', 'domain_management']
  }
];

// Available Features
export const AVAILABLE_FEATURES = [
  // Social Media Features
  { id: 'social_media_management', name: 'Social Media Management', category: 'social_media', price: 10 },
  { id: 'content_scheduling', name: 'Content Scheduling', category: 'social_media', price: 8 },
  { id: 'instagram_analytics', name: 'Instagram Analytics', category: 'social_media', price: 12 },
  { id: 'hashtag_research', name: 'Hashtag Research', category: 'social_media', price: 6 },
  { id: 'competitor_analysis', name: 'Competitor Analysis', category: 'social_media', price: 15 },
  { id: 'social_listening', name: 'Social Listening', category: 'social_media', price: 20 },
  
  // Link in Bio Features
  { id: 'link_in_bio_builder', name: 'Link in Bio Builder', category: 'link_in_bio', price: 5 },
  { id: 'custom_domains', name: 'Custom Domains', category: 'link_in_bio', price: 8 },
  { id: 'conversion_tracking', name: 'Conversion Tracking', category: 'link_in_bio', price: 12 },
  { id: 'a_b_testing', name: 'A/B Testing', category: 'link_in_bio', price: 15 },
  { id: 'qr_codes', name: 'QR Code Generation', category: 'link_in_bio', price: 6 },
  
  // E-commerce Features
  { id: 'online_store', name: 'Online Store', category: 'ecommerce', price: 25 },
  { id: 'inventory_management', name: 'Inventory Management', category: 'ecommerce', price: 18 },
  { id: 'payment_processing', name: 'Payment Processing', category: 'ecommerce', price: 12 },
  { id: 'order_management', name: 'Order Management', category: 'ecommerce', price: 15 },
  { id: 'shipping_management', name: 'Shipping Management', category: 'ecommerce', price: 10 },
  { id: 'product_reviews', name: 'Product Reviews', category: 'ecommerce', price: 8 },
  
  // CRM Features
  { id: 'crm_system', name: 'CRM System', category: 'crm', price: 20 },
  { id: 'lead_management', name: 'Lead Management', category: 'crm', price: 15 },
  { id: 'sales_pipeline', name: 'Sales Pipeline', category: 'crm', price: 18 },
  { id: 'email_marketing', name: 'Email Marketing', category: 'crm', price: 12 },
  { id: 'lead_generation', name: 'Lead Generation', category: 'crm', price: 22 },
  { id: 'customer_segmentation', name: 'Customer Segmentation', category: 'crm', price: 14 },
  
  // Course Features
  { id: 'course_builder', name: 'Course Builder', category: 'courses', price: 25 },
  { id: 'community_platform', name: 'Community Platform', category: 'courses', price: 18 },
  { id: 'student_management', name: 'Student Management', category: 'courses', price: 12 },
  { id: 'progress_tracking', name: 'Progress Tracking', category: 'courses', price: 10 },
  { id: 'certification_system', name: 'Certification System', category: 'courses', price: 15 },
  { id: 'live_streaming', name: 'Live Streaming', category: 'courses', price: 20 },
  
  // Website Builder Features
  { id: 'website_builder', name: 'Website Builder', category: 'website', price: 20 },
  { id: 'content_management', name: 'Content Management', category: 'website', price: 15 },
  { id: 'seo_tools', name: 'SEO Tools', category: 'website', price: 12 },
  { id: 'domain_management', name: 'Domain Management', category: 'website', price: 8 },
  { id: 'ssl_certificates', name: 'SSL Certificates', category: 'website', price: 5 },
  
  // Analytics & Reporting
  { id: 'advanced_analytics', name: 'Advanced Analytics', category: 'analytics', price: 18 },
  { id: 'custom_reports', name: 'Custom Reports', category: 'analytics', price: 15 },
  { id: 'real_time_data', name: 'Real-time Data', category: 'analytics', price: 12 },
  { id: 'data_export', name: 'Data Export', category: 'analytics', price: 8 },
  
  // Marketing & Automation
  { id: 'marketing_automation', name: 'Marketing Automation', category: 'marketing', price: 25 },
  { id: 'email_templates', name: 'Email Templates', category: 'marketing', price: 8 },
  { id: 'campaign_management', name: 'Campaign Management', category: 'marketing', price: 15 },
  { id: 'social_proof', name: 'Social Proof', category: 'marketing', price: 10 },
  
  // Integration & API
  { id: 'api_access', name: 'API Access', category: 'integration', price: 20 },
  { id: 'webhook_support', name: 'Webhook Support', category: 'integration', price: 12 },
  { id: 'third_party_integrations', name: 'Third-party Integrations', category: 'integration', price: 15 },
  { id: 'zapier_integration', name: 'Zapier Integration', category: 'integration', price: 10 }
];

// Subscription Tiers
export const SUBSCRIPTION_TIERS = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    features: 10,
    description: 'Access to 10 features with Mewayz branding on external-facing content',
    billing: 'free',
    limitations: ['Mewayz branding on external content', 'Email support only', 'Basic analytics']
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    priceMonthly: 1,
    priceYearly: 10,
    description: 'Pay per feature - $1/feature per month or $10/feature per year',
    billing: 'per_feature',
    limitations: ['Standard support', 'Advanced analytics', 'Custom branding available']
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    priceMonthly: 1.5,
    priceYearly: 15,
    description: 'Premium features - $1.5/feature per month or $15/feature per year',
    billing: 'per_feature',
    limitations: ['Priority support', 'White-label options', 'Custom integrations', 'Dedicated account manager']
  }
];

// Onboarding Steps
export const ONBOARDING_STEPS = {
  GOAL_SELECTION: 'goal_selection',
  FEATURE_SELECTION: 'feature_selection', 
  TEAM_SETUP: 'team_setup',
  SUBSCRIPTION_SELECTION: 'subscription_selection',
  BRANDING_CONFIGURATION: 'branding_configuration',
  DASHBOARD_CUSTOMIZATION: 'dashboard_customization'
};

// Wizard Steps
export const WIZARD_STEPS = {
  WELCOME_BASICS: 1,
  GOAL_SELECTION: 2,
  FEATURE_SELECTION: 3,
  SUBSCRIPTION_PLAN: 4,
  TEAM_SETUP: 5,
  BRANDING: 6
};

export const TOTAL_STEPS = 6;

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Color Palette
export const COLOR_PALETTE = [
  { name: 'Mewayz Blue', primary: '#007AFF', secondary: '#6C5CE7' },
  { name: 'Ocean Breeze', primary: '#45B7D1', secondary: '#96CEB4' },
  { name: 'Sunset Orange', primary: '#FF6B6B', secondary: '#FF9F43' },
  { name: 'Forest Green', primary: '#26DE81', secondary: '#2ED573' },
  { name: 'Purple Dream', primary: '#A55EEA', secondary: '#CD84F1' },
  { name: 'Rose Gold', primary: '#FF7675', secondary: '#FDCB6E' },
  { name: 'Corporate Gray', primary: '#2D3436', secondary: '#636E72' },
  { name: 'Teal Splash', primary: '#00B894', secondary: '#00CEC9' }
];

// Font Families
export const FONT_FAMILIES = [
  { name: 'Inter', value: 'Inter, sans-serif', category: 'Sans Serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Sans Serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif', category: 'Sans Serif' },
  { name: 'Lato', value: 'Lato, sans-serif', category: 'Sans Serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif', category: 'Sans Serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Sans Serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif', category: 'Serif' },
  { name: 'Merriweather', value: 'Merriweather, serif', category: 'Serif' },
  { name: 'Fira Code', value: 'Fira Code, monospace', category: 'Monospace' }
];

// Application Status
export const APP_STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  IDLE: 'idle'
};

// User Roles
export const USER_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  EDITOR: 'editor',
  CONTRIBUTOR: 'contributor',
  VIEWER: 'viewer',
  GUEST: 'guest'
};

// Workspace Status
export const WORKSPACE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Invitation Status
export const INVITATION_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// Social Media Platforms
export const SOCIAL_PLATFORMS = {
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  TWITTER: 'twitter',
  LINKEDIN: 'linkedin',
  TIKTOK: 'tiktok',
  YOUTUBE: 'youtube'
};

// Email Campaign Status
export const EMAIL_CAMPAIGN_STATUS = {
  DRAFT: 'draft',
  SCHEDULED: 'scheduled',
  SENT: 'sent',
  FAILED: 'failed'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Course Status
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Product Status
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived'
};

// CRM Contact Status
export const CRM_CONTACT_STATUS = {
  LEAD: 'lead',
  PROSPECT: 'prospect',
  CUSTOMER: 'customer',
  INACTIVE: 'inactive'
};

// Application Environment
export const APP_ENV = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production'
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  AUTHENTICATION_ERROR: 'Authentication failed. Please log in again.',
  AUTHORIZATION_ERROR: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  WORKSPACE_CREATED: 'Workspace created successfully!',
  INVITATION_SENT: 'Invitation sent successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  POST_PUBLISHED: 'Post published successfully!',
  CAMPAIGN_SENT: 'Campaign sent successfully!',
  PAYMENT_PROCESSED: 'Payment processed successfully!',
  COURSE_CREATED: 'Course created successfully!',
  PRODUCT_ADDED: 'Product added successfully!'
};

// Feature Categories
export const FEATURE_CATEGORIES = {
  SOCIAL_MEDIA: 'social_media',
  LINK_IN_BIO: 'link_in_bio',
  ECOMMERCE: 'ecommerce',
  CRM: 'crm',
  COURSES: 'courses',
  WEBSITE: 'website',
  ANALYTICS: 'analytics',
  MARKETING: 'marketing',
  INTEGRATION: 'integration'
};

// File Upload Configuration
export const FILE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
  URL_REGEX: /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)$/,
  DOMAIN_REGEX: /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
  HEX_COLOR_REGEX: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  WORKSPACE_ID: 'current_workspace_id',
  ONBOARDING_STATE: 'onboarding_state',
  WIZARD_STATE: 'wizard_state',
  THEME_PREFERENCES: 'theme_preferences',
  LANGUAGE_PREFERENCE: 'language_preference'
};

// Default Values
export const DEFAULT_VALUES = {
  WORKSPACE_NAME: 'My Workspace',
  PAGINATION_LIMIT: 10,
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  NOTIFICATION_DURATION: 5000
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: true,
  ENABLE_TEAM_FEATURES: true,
  ENABLE_ADVANCED_BRANDING: true,
  ENABLE_WHITE_LABEL: true,
  ENABLE_API_ACCESS: true,
  ENABLE_WEBHOOKS: true,
  ENABLE_THIRD_PARTY_INTEGRATIONS: true,
  ENABLE_MOBILE_APP: false // Set to true when mobile app is ready
};

// Platform Configuration
export const PLATFORM_CONFIG = {
  APP_NAME: 'Mewayz',
  APP_VERSION: '1.0.0',
  COMPANY_NAME: 'Mewayz Inc.',
  SUPPORT_EMAIL: 'support@mewayz.com',
  WEBSITE_URL: 'https://mewayz.com',
  DOCUMENTATION_URL: 'https://docs.mewayz.com',
  STATUS_PAGE_URL: 'https://status.mewayz.com',
  PRIVACY_POLICY_URL: 'https://mewayz.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://mewayz.com/terms',
  CONTACT_US_URL: 'https://mewayz.com/contact'
};