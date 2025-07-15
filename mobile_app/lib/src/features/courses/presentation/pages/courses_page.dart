import 'package:flutter/material.dart';
import '../../../../core/utils/app_constants.dart';

class CoursesPage extends StatelessWidget {
  const CoursesPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Courses'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Create new course
            },
          ),
        ],
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.school_outlined,
              size: 80,
              color: AppConstants.darkTextSecondary,
            ),
            SizedBox(height: 16),
            Text(
              'No courses yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppConstants.darkText,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Share your knowledge with the world',
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