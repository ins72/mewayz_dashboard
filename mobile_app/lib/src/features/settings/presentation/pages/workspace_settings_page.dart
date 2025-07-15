import 'package:flutter/material.dart';
import '../../../../core/utils/app_constants.dart';

class WorkspaceSettingsPage extends StatelessWidget {
  const WorkspaceSettingsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Workspace Settings'),
      ),
      body: const Center(
        child: Text(
          'Workspace Settings - Coming Soon',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AppConstants.darkText,
          ),
        ),
      ),
    );
  }
}