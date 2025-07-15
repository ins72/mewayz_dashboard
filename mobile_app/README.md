# Mewayz Mobile App

A comprehensive Flutter mobile application for the Mewayz all-in-one business platform.

## Features

### Core Features
- **Authentication** - Login, Register, Forgot Password
- **Dashboard** - Overview of business metrics and quick actions
- **CRM** - Contact, Deal, and Task management
- **E-commerce** - Product and Order management
- **Courses** - Course creation and management
- **Link in Bio** - Personal landing page builder
- **Marketing** - Campaign and automation management
- **Settings** - Profile and workspace configuration

### Technical Features
- **Cross-platform** - iOS and Android from single codebase
- **Clean Architecture** - Domain-driven design with proper separation of concerns
- **State Management** - Flutter Riverpod for reactive state management
- **Navigation** - GoRouter for declarative routing
- **Network Layer** - Dio with Retrofit for API integration
- **Local Storage** - Hive + SharedPreferences for data persistence
- **Push Notifications** - Firebase Cloud Messaging integration
- **Offline Support** - Caching and offline-first architecture
- **Dark Theme** - Beautiful, consistent dark mode design

## Architecture

The app follows Clean Architecture principles:

```
lib/
├── src/
│   ├── core/                 # Core utilities and configurations
│   │   ├── errors/          # Error handling
│   │   ├── network/         # Network layer (Dio client)
│   │   ├── router/          # App routing configuration
│   │   ├── services/        # Core services (DI, notifications)
│   │   ├── storage/         # Local storage services
│   │   ├── theme/           # App theme configuration
│   │   └── utils/           # Constants and utilities
│   ├── features/            # Feature modules
│   │   ├── auth/           # Authentication
│   │   ├── dashboard/      # Dashboard
│   │   ├── crm/           # CRM functionality
│   │   ├── ecommerce/     # E-commerce features
│   │   ├── courses/       # Course management
│   │   ├── marketing/     # Marketing tools
│   │   └── settings/      # App settings
│   └── shared/             # Shared widgets and utilities
│       └── presentation/   # Reusable UI components
```

Each feature follows the Clean Architecture pattern:
- **Data Layer** - Models, repositories, and data sources
- **Domain Layer** - Entities, use cases, and repository interfaces
- **Presentation Layer** - Pages, widgets, and state management

## Tech Stack

### Flutter & Dart
- **Flutter 3.16+** - Cross-platform UI framework
- **Dart 3.0+** - Programming language

### State Management
- **Flutter Riverpod** - Reactive state management
- **Equatable** - Value equality for models

### Navigation
- **GoRouter** - Declarative routing
- **Navigator 2.0** - Modern navigation API

### Network & API
- **Dio** - HTTP client
- **Retrofit** - Type-safe HTTP client
- **Pretty Dio Logger** - Request/response logging

### Local Storage
- **Hive** - Fast, lightweight NoSQL database
- **SharedPreferences** - Key-value storage
- **Secure Storage** - Encrypted storage for sensitive data

### Notifications
- **Firebase Messaging** - Push notifications
- **Flutter Local Notifications** - Local notifications

### UI & Design
- **Material 3** - Modern Material Design
- **Custom Theme** - Consistent dark theme
- **Responsive Design** - Adaptive layouts

### Development Tools
- **JSON Serialization** - Code generation for models
- **Build Runner** - Code generation
- **Flutter Lints** - Code analysis

## Getting Started

### Prerequisites
- Flutter SDK 3.16+
- Dart SDK 3.0+
- Android Studio / VS Code
- iOS development setup (for iOS builds)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd mewayz-mobile
```

2. **Install dependencies:**
```bash
flutter pub get
```

3. **Generate code:**
```bash
flutter packages pub run build_runner build
```

4. **Configure environment:**
   - Update `baseUrl` in `lib/src/core/utils/app_constants.dart`
   - Add your API endpoint URL

5. **Run the app:**
```bash
flutter run
```

### Development Setup

1. **Generate models:**
```bash
flutter packages pub run build_runner build --delete-conflicting-outputs
```

2. **Run tests:**
```bash
flutter test
```

3. **Analyze code:**
```bash
flutter analyze
```

## Configuration

### API Configuration
Update the base URL in `lib/src/core/utils/app_constants.dart`:
```dart
static const String baseUrl = 'https://your-api-endpoint.com';
```

### Firebase Setup
1. Add your `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)
2. Configure Firebase project for push notifications

### Build Configuration
- **Android**: Update `android/app/build.gradle`
- **iOS**: Update `ios/Runner/Info.plist`

## API Integration

The app integrates with the Mewayz backend API:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset

### CRM Endpoints
- `GET /api/crm-contacts` - Get contacts
- `POST /api/crm-contacts` - Create contact
- `GET /api/crm-deals` - Get deals
- `POST /api/crm-deals` - Create deal

### E-commerce Endpoints
- `GET /api/products` - Get products
- `POST /api/products` - Create product
- `GET /api/orders` - Get orders

### More endpoints available in the backend API documentation

## State Management

The app uses Riverpod for state management with the following providers:

### Auth Provider
```dart
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(/* dependencies */);
});
```

### Usage in widgets:
```dart
class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);
    return Text(authState.user?.name ?? 'Loading...');
  }
}
```

## Routing

The app uses GoRouter for navigation:

```dart
context.go('/dashboard');
context.push('/crm/contact/123');
context.pop();
```

### Route Structure
- `/splash` - Splash screen
- `/onboarding` - Onboarding flow
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/dashboard` - Main dashboard
- `/crm` - CRM management
- `/ecommerce` - E-commerce management
- `/courses` - Course management
- `/settings` - App settings

## Storage

### Token Storage
```dart
await DependencyInjection.storageService.saveTokens(
  accessToken: token,
  refreshToken: refreshToken,
);
```

### User Data Storage
```dart
await DependencyInjection.storageService.saveUserData(userData);
final user = await DependencyInjection.storageService.getUserData();
```

### Cache Management
```dart
await DependencyInjection.storageService.cacheData('key', data);
final cached = await DependencyInjection.storageService.getCachedData('key');
```

## Push Notifications

### Setup
1. Configure Firebase project
2. Add configuration files
3. Request permissions

### Usage
```dart
await NotificationService.showNotification(
  title: 'New Message',
  body: 'You have a new message',
);
```

## Testing

### Run Tests
```bash
flutter test
```

### Test Structure
- **Unit Tests** - Business logic and use cases
- **Widget Tests** - UI components
- **Integration Tests** - Full app flows

## Build & Deployment

### Android Build
```bash
flutter build apk --release
flutter build appbundle --release
```

### iOS Build
```bash
flutter build ios --release
```

### Build Configurations
- **Debug** - Development builds
- **Profile** - Performance testing
- **Release** - Production builds

## Performance Optimization

### Image Optimization
- Use `cached_network_image` for network images
- Implement proper image sizing
- Use appropriate image formats

### Memory Management
- Dispose controllers and subscriptions
- Use `const` constructors
- Implement proper widget lifecycle

### Network Optimization
- Implement request caching
- Use pagination for large datasets
- Implement offline support

## Security

### Data Protection
- Encrypted token storage
- Secure API communication (HTTPS)
- Input validation and sanitization

### Authentication Security
- JWT token management
- Automatic token refresh
- Secure logout

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Style
- Follow Flutter best practices
- Use meaningful variable names
- Add comments for complex logic
- Maintain consistent formatting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@mewayz.com
- Documentation: https://docs.mewayz.com
- Issues: GitHub Issues

## Changelog

### v1.0.0
- Initial release
- Core authentication system
- Dashboard implementation
- CRM basic functionality
- E-commerce foundation
- Course management basics
- Settings and profile management