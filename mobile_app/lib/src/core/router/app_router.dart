import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/forgot_password_page.dart';
import '../../features/onboarding/presentation/pages/onboarding_page.dart';
import '../../features/splash/presentation/pages/splash_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';
import '../../features/crm/presentation/pages/crm_page.dart';
import '../../features/crm/presentation/pages/contact_detail_page.dart';
import '../../features/crm/presentation/pages/deal_detail_page.dart';
import '../../features/ecommerce/presentation/pages/ecommerce_page.dart';
import '../../features/ecommerce/presentation/pages/product_detail_page.dart';
import '../../features/ecommerce/presentation/pages/order_detail_page.dart';
import '../../features/courses/presentation/pages/courses_page.dart';
import '../../features/courses/presentation/pages/course_detail_page.dart';
import '../../features/link_in_bio/presentation/pages/link_in_bio_page.dart';
import '../../features/marketing/presentation/pages/marketing_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import '../../features/settings/presentation/pages/profile_page.dart';
import '../../features/settings/presentation/pages/workspace_settings_page.dart';
import '../../shared/presentation/pages/main_wrapper.dart';
import '../../shared/presentation/pages/error_page.dart';
import 'app_routes.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    debugLogDiagnostics: true,
    initialLocation: AppRoutes.splash,
    redirect: (context, state) {
      final isLoggedIn = authState.isAuthenticated;
      final isOnSplash = state.location == AppRoutes.splash;
      final isOnAuth = state.location.startsWith('/auth');
      final isOnOnboarding = state.location == AppRoutes.onboarding;
      
      // If on splash, stay there
      if (isOnSplash) return null;
      
      // If not logged in and not on auth pages, redirect to login
      if (!isLoggedIn && !isOnAuth) {
        return AppRoutes.login;
      }
      
      // If logged in and on auth pages, redirect to dashboard
      if (isLoggedIn && isOnAuth) {
        return AppRoutes.dashboard;
      }
      
      // If logged in but on onboarding, redirect to dashboard
      if (isLoggedIn && isOnOnboarding) {
        return AppRoutes.dashboard;
      }
      
      return null;
    },
    routes: [
      // Splash Route
      GoRoute(
        path: AppRoutes.splash,
        name: 'splash',
        builder: (context, state) => const SplashPage(),
      ),
      
      // Onboarding Route
      GoRoute(
        path: AppRoutes.onboarding,
        name: 'onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      
      // Auth Routes
      GoRoute(
        path: AppRoutes.login,
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: AppRoutes.register,
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: AppRoutes.forgotPassword,
        name: 'forgot_password',
        builder: (context, state) => const ForgotPasswordPage(),
      ),
      
      // Main App Routes (with bottom navigation)
      ShellRoute(
        builder: (context, state, child) {
          return MainWrapper(child: child);
        },
        routes: [
          // Dashboard Route
          GoRoute(
            path: AppRoutes.dashboard,
            name: 'dashboard',
            builder: (context, state) => const DashboardPage(),
          ),
          
          // CRM Routes
          GoRoute(
            path: AppRoutes.crm,
            name: 'crm',
            builder: (context, state) => const CrmPage(),
            routes: [
              GoRoute(
                path: 'contact/:id',
                name: 'contact_detail',
                builder: (context, state) {
                  final contactId = state.params['id']!;
                  return ContactDetailPage(contactId: contactId);
                },
              ),
              GoRoute(
                path: 'deal/:id',
                name: 'deal_detail',
                builder: (context, state) {
                  final dealId = state.params['id']!;
                  return DealDetailPage(dealId: dealId);
                },
              ),
            ],
          ),
          
          // E-commerce Routes
          GoRoute(
            path: AppRoutes.ecommerce,
            name: 'ecommerce',
            builder: (context, state) => const EcommercePage(),
            routes: [
              GoRoute(
                path: 'product/:id',
                name: 'product_detail',
                builder: (context, state) {
                  final productId = state.params['id']!;
                  return ProductDetailPage(productId: productId);
                },
              ),
              GoRoute(
                path: 'order/:id',
                name: 'order_detail',
                builder: (context, state) {
                  final orderId = state.params['id']!;
                  return OrderDetailPage(orderId: orderId);
                },
              ),
            ],
          ),
          
          // Courses Routes
          GoRoute(
            path: AppRoutes.courses,
            name: 'courses',
            builder: (context, state) => const CoursesPage(),
            routes: [
              GoRoute(
                path: 'course/:id',
                name: 'course_detail',
                builder: (context, state) {
                  final courseId = state.params['id']!;
                  return CourseDetailPage(courseId: courseId);
                },
              ),
            ],
          ),
          
          // Link in Bio Route
          GoRoute(
            path: AppRoutes.linkInBio,
            name: 'link_in_bio',
            builder: (context, state) => const LinkInBioPage(),
          ),
          
          // Marketing Route
          GoRoute(
            path: AppRoutes.marketing,
            name: 'marketing',
            builder: (context, state) => const MarketingPage(),
          ),
          
          // Settings Routes
          GoRoute(
            path: AppRoutes.settings,
            name: 'settings',
            builder: (context, state) => const SettingsPage(),
            routes: [
              GoRoute(
                path: 'profile',
                name: 'profile',
                builder: (context, state) => const ProfilePage(),
              ),
              GoRoute(
                path: 'workspace',
                name: 'workspace_settings',
                builder: (context, state) => const WorkspaceSettingsPage(),
              ),
            ],
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => ErrorPage(error: state.error),
  );
});