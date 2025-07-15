import 'package:flutter/material.dart';
import '../../../../core/utils/app_constants.dart';

class ProductDetailPage extends StatelessWidget {
  final String productId;
  
  const ProductDetailPage({super.key, required this.productId});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Product Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {
              // TODO: Edit product
            },
          ),
        ],
      ),
      body: Center(
        child: Text(
          'Product ID: $productId',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
      ),
    );
  }
}