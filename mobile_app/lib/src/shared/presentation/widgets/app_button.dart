import 'package:flutter/material.dart';

import '../../../core/utils/app_constants.dart';

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final bool isExpanded;
  final EdgeInsets? padding;
  final double? width;
  final double? height;
  final Color? backgroundColor;
  final Color? textColor;
  final IconData? icon;
  final Widget? child;

  const AppButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.isExpanded = true,
    this.padding,
    this.width,
    this.height,
    this.backgroundColor,
    this.textColor,
    this.icon,
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    final button = isOutlined ? _buildOutlinedButton() : _buildElevatedButton();
    
    return isExpanded 
        ? SizedBox(
            width: width ?? double.infinity,
            height: height ?? 56,
            child: button,
          )
        : SizedBox(
            width: width,
            height: height ?? 56,
            child: button,
          );
  }

  Widget _buildElevatedButton() {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor ?? AppConstants.primaryColor,
        foregroundColor: textColor ?? Colors.white,
        padding: padding ?? const EdgeInsets.symmetric(
          horizontal: AppConstants.largePadding,
          vertical: AppConstants.defaultPadding,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadius),
        ),
        elevation: 0,
      ),
      child: _buildContent(),
    );
  }

  Widget _buildOutlinedButton() {
    return OutlinedButton(
      onPressed: isLoading ? null : onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: textColor ?? AppConstants.primaryColor,
        side: BorderSide(
          color: backgroundColor ?? AppConstants.primaryColor,
        ),
        padding: padding ?? const EdgeInsets.symmetric(
          horizontal: AppConstants.largePadding,
          vertical: AppConstants.defaultPadding,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppConstants.borderRadius),
        ),
      ),
      child: _buildContent(),
    );
  }

  Widget _buildContent() {
    if (child != null) {
      return child!;
    }

    if (isLoading) {
      return const SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          color: Colors.white,
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 20),
          const SizedBox(width: 8),
          Text(text),
        ],
      );
    }

    return Text(text);
  }
}