import 'package:flutter/material.dart';
import '../../../../core/utils/app_constants.dart';

class LinkInBioPage extends StatelessWidget {
  const LinkInBioPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Link in Bio'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // TODO: Edit link in bio
            },
          ),
        ],
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.link,
              size: 80,
              color: AppConstants.darkTextSecondary,
            ),
            SizedBox(height: 16),
            Text(
              'No link in bio yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppConstants.darkText,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Create your personal landing page',
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