import 'package:flutter/material.dart';
import '../../../../core/utils/app_constants.dart';

class OrderDetailPage extends StatelessWidget {
  final String orderId;
  
  const OrderDetailPage({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Order Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // TODO: Edit order
            },
          ),
        ],
      ),
      body: Center(
        child: Text(
          'Order ID: $orderId',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
      ),
    );
  }
}