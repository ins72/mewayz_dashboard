import 'package:flutter/material.dart';
import '../../../../core/utils/app_constants.dart';

class DealDetailPage extends StatelessWidget {
  final String dealId;
  
  const DealDetailPage({super.key, required this.dealId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Deal Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // TODO: Edit deal
            },
          ),
        ],
      ),
      body: Center(
        child: Text(
          'Deal ID: $dealId',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
      ),
    );
  }
}