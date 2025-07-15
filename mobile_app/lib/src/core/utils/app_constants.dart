import 'package:flutter/material.dart';

class AppConstants {
  // App Info
  static const String appName = 'Mewayz';
  static const String appVersion = '1.0.0';
  static const String appTagline = 'All-in-one business platform';
  
  // API Configuration
  static const String baseUrl = 'https://api.mewayz.com'; // Replace with actual backend URL
  static const String apiPrefix = '/api';
  static const Duration apiTimeout = Duration(seconds: 30);
  
  // Colors
  static const Color primaryColor = Color(0xFF3B82F6);
  static const Color secondaryColor = Color(0xFF10B981);
  static const Color accentColor = Color(0xFF8B5CF6);
  static const Color errorColor = Color(0xFFEF4444);
  static const Color warningColor = Color(0xFFF59E0B);
  static const Color successColor = Color(0xFF10B981);
  
  // Dark Theme Colors
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color darkSurface = Color(0xFF1E293B);
  static const Color darkCard = Color(0xFF334155);
  static const Color darkBorder = Color(0xFF475569);
  static const Color darkText = Color(0xFFF8FAFC);
  static const Color darkTextSecondary = Color(0xFF94A3B8);
  static const Color darkTextTertiary = Color(0xFF64748B);
  
  // Layout
  static const double defaultPadding = 16.0;
  static const double smallPadding = 8.0;
  static const double largePadding = 24.0;
  static const double borderRadius = 12.0;
  static const double cardElevation = 4.0;
  
  // Animation
  static const Duration defaultAnimationDuration = Duration(milliseconds: 300);
  static const Duration fastAnimationDuration = Duration(milliseconds: 150);
  static const Duration slowAnimationDuration = Duration(milliseconds: 500);
  
  // Storage Keys
  static const String accessTokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String workspaceDataKey = 'workspace_data';
  static const String themeKey = 'theme_preference';
  static const String languageKey = 'language_preference';
  
  // Feature Flags
  static const bool enableBiometrics = true;
  static const bool enablePushNotifications = true;
  static const bool enableAnalytics = true;
  static const bool enableCrashReporting = true;
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
  
  // Image/File
  static const int maxImageSizeBytes = 5 * 1024 * 1024; // 5MB
  static const List<String> allowedImageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  static const List<String> allowedDocumentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  
  // Validation
  static const int minPasswordLength = 8;
  static const int maxPasswordLength = 128;
  static const int minUsernameLength = 3;
  static const int maxUsernameLength = 50;
  
  // Business Logic
  static const int maxWorkspacesPerUser = 10;
  static const int maxTeamMembersPerWorkspace = 100;
  static const int maxProductsPerWorkspace = 1000;
  static const int maxCoursesPerWorkspace = 50;
  
  // URLs
  static const String termsOfServiceUrl = 'https://mewayz.com/terms';
  static const String privacyPolicyUrl = 'https://mewayz.com/privacy';
  static const String supportUrl = 'https://support.mewayz.com';
  static const String documentationUrl = 'https://docs.mewayz.com';
  
  // Social Media
  static const String facebookUrl = 'https://facebook.com/mewayz';
  static const String twitterUrl = 'https://twitter.com/mewayz';
  static const String linkedinUrl = 'https://linkedin.com/company/mewayz';
  static const String instagramUrl = 'https://instagram.com/mewayz';
  
  // Email Templates
  static const String supportEmail = 'support@mewayz.com';
  static const String salesEmail = 'sales@mewayz.com';
  static const String feedbackEmail = 'feedback@mewayz.com';
  
  // Error Messages
  static const String genericErrorMessage = 'Something went wrong. Please try again.';
  static const String networkErrorMessage = 'Please check your internet connection.';
  static const String serverErrorMessage = 'Server error. Please try again later.';
  static const String timeoutErrorMessage = 'Request timed out. Please try again.';
  static const String unauthorizedErrorMessage = 'Please log in again.';
  static const String forbiddenErrorMessage = 'You don\'t have permission to access this resource.';
  
  // Success Messages
  static const String loginSuccessMessage = 'Welcome back!';
  static const String signupSuccessMessage = 'Account created successfully!';
  static const String logoutSuccessMessage = 'Logged out successfully';
  static const String updateSuccessMessage = 'Updated successfully';
  static const String deleteSuccessMessage = 'Deleted successfully';
  static const String createSuccessMessage = 'Created successfully';
  
  // Loading Messages
  static const String loadingMessage = 'Loading...';
  static const String savingMessage = 'Saving...';
  static const String deletingMessage = 'Deleting...';
  static const String updatingMessage = 'Updating...';
  static const String syncingMessage = 'Syncing...';
  
  // Empty States
  static const String noDataMessage = 'No data available';
  static const String noResultsMessage = 'No results found';
  static const String noConnectionMessage = 'No internet connection';
  static const String noPermissionMessage = 'Permission denied';
  
  // Regex Patterns
  static const String emailPattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$';
  static const String phonePattern = r'^\+?[1-9]\d{1,14}$';
  static const String urlPattern = r'^https?:\/\/.+';
  
  // Date Formats
  static const String dateFormat = 'MMM dd, yyyy';
  static const String timeFormat = 'hh:mm a';
  static const String dateTimeFormat = 'MMM dd, yyyy • hh:mm a';
  static const String apiDateFormat = 'yyyy-MM-dd';
  static const String apiDateTimeFormat = 'yyyy-MM-ddTHH:mm:ss.SSSZ';
  
  // Chart Colors
  static const List<Color> chartColors = [
    Color(0xFF3B82F6), // Blue
    Color(0xFF10B981), // Green
    Color(0xFF8B5CF6), // Purple
    Color(0xFFF59E0B), // Yellow
    Color(0xFFEF4444), // Red
    Color(0xFF06B6D4), // Cyan
    Color(0xFFF97316), // Orange
    Color(0xFFEC4899), // Pink
  ];
  
  // Feature Categories
  static const List<String> businessCategories = [
    'E-commerce',
    'Education',
    'Healthcare',
    'Finance',
    'Real Estate',
    'Technology',
    'Marketing',
    'Consulting',
    'Restaurant',
    'Retail',
    'Other'
  ];
  
  // Social Media Platforms
  static const List<String> socialMediaPlatforms = [
    'Facebook',
    'Instagram',
    'Twitter',
    'LinkedIn',
    'YouTube',
    'TikTok',
    'Pinterest',
    'Snapchat'
  ];
  
  // Currency Symbols
  static const Map<String, String> currencySymbols = {
    'USD': '\$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CAD': 'C\$',
    'AUD': 'A\$',
    'INR': '₹',
    'CNY': '¥',
    'BRL': 'R\$',
    'RUB': '₽',
  };
  
  // Time Zones
  static const List<String> commonTimeZones = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Mumbai',
    'Australia/Sydney',
    'America/Toronto',
  ];
}