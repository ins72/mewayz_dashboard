import 'package:flutter/material.dart';
import '../../../../core/utils/app_constants.dart';

class EcommercePage extends StatelessWidget {
  const EcommercePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('E-commerce'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Add new product
            },
          ),
        ],
      ),
      body: const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.shopping_cart_outlined,
              size: 80,
              color: AppConstants.darkTextSecondary,
            ),
            SizedBox(height: 16),
            Text(
              'No products yet',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: AppConstants.darkText,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Start building your online store',
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