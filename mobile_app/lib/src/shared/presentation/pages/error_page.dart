import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/router/app_routes.dart';
import '../../../core/utils/app_constants.dart';
import '../widgets/app_button.dart';

class ErrorPage extends StatelessWidget {
  final GoException? error;

  const ErrorPage({super.key, this.error});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(AppConstants.defaultPadding),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 80,
                color: AppConstants.errorColor,
              ),
              const SizedBox(height: AppConstants.largePadding),
              Text(
                'Oops! Something went wrong',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppConstants.defaultPadding),
              Text(
                error?.toString() ?? 'An unexpected error occurred',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: AppConstants.darkTextSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppConstants.largePadding * 2),
              AppButton(
                text: 'Go to Dashboard',
                onPressed: () => context.go(AppRoutes.dashboard),
              ),
              const SizedBox(height: AppConstants.defaultPadding),
              AppButton(
                text: 'Try Again',
                isOutlined: true,
                onPressed: () => context.go(context.namedLocation('dashboard')),
              ),
            ],
          ),
        ),
      ),
    );
  }
}