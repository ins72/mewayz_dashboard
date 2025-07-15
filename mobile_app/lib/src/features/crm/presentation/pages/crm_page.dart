import 'package:flutter/material.dart';

import '../../../../core/utils/app_constants.dart';

class CrmPage extends StatefulWidget {
  const CrmPage({super.key});

  @override
  State<CrmPage> createState() => _CrmPageState();
}

class _CrmPageState extends State<CrmPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('CRM'),
        bottom: TabBar(
          controller: _tabController,
          tabs: const [
            Tab(text: 'Contacts'),
            Tab(text: 'Deals'),
            Tab(text: 'Tasks'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Add new contact/deal/task based on current tab
            },
          ),
        ],
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildContactsTab(),
          _buildDealsTab(),
          _buildTasksTab(),
        ],
      ),
    );
  }

  Widget _buildContactsTab() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.people_outline,
            size: 80,
            color: AppConstants.darkTextSecondary,
          ),
          SizedBox(height: 16),
          Text(
            'No contacts yet',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppConstants.darkText,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Start building your customer relationships',
            style: TextStyle(
              color: AppConstants.darkTextSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDealsTab() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.handshake_outlined,
            size: 80,
            color: AppConstants.darkTextSecondary,
          ),
          SizedBox(height: 16),
          Text(
            'No deals yet',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppConstants.darkText,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Track your sales opportunities',
            style: TextStyle(
              color: AppConstants.darkTextSecondary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTasksTab() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.task_outlined,
            size: 80,
            color: AppConstants.darkTextSecondary,
          ),
          SizedBox(height: 16),
          Text(
            'No tasks yet',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: AppConstants.darkText,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Stay organized with your to-do list',
            style: TextStyle(
              color: AppConstants.darkTextSecondary,
            ),
          ),
        ],
      ),
    );
  }
}