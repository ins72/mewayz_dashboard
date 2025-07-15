import 'package:flutter/material.dart';
import '../../../../core/utils/app_constants.dart';

class CourseDetailPage extends StatelessWidget {
  final String courseId;
  
  const CourseDetailPage({super.key, required this.courseId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Course Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // TODO: Edit course
            },
          ),
        ],
      ),
      body: Center(
        child: Text(
          'Course ID: $courseId',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
      ),
    );
  }
}