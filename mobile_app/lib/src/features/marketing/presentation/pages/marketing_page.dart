import 'package:flutter/material.dart';
import '../../../../core/utils/app_constants.dart';

class MarketingPage extends StatelessWidget {
  const MarketingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Marketing'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Create new campaign
            },
          ),
        ],
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.campaign_outlined,
              size: 80,
              color: AppConstants.darkTextSecondary,
            ),
            SizedBox(height: 16),
            Text(
              'No campaigns yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppConstants.darkText,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Start your marketing journey',
              style: TextStyle(
                color: AppConstants.darkTextSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}