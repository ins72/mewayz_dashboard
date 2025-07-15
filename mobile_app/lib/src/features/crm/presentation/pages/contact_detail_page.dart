import 'package:flutter/material.dart';
import '../../../../core/utils/app_constants.dart';

class ContactDetailPage extends StatelessWidget {
  final String contactId;
  
  const ContactDetailPage({super.key, required this.contactId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Contact Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // TODO: Edit contact
            },
          ),
        ],
      ),
      body: Center(
        child: Text(
          'Contact ID: $contactId',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
      ),
    );
  }
}