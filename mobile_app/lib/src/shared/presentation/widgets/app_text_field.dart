import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../core/utils/app_constants.dart';

class AppTextField extends StatelessWidget {
  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final String? helperText;
  final String? errorText;
  final bool obscureText;
  final bool readOnly;
  final bool enabled;
  final int? maxLines;
  final int? minLines;
  final int? maxLength;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final FocusNode? focusNode;
  final String? Function(String?)? validator;
  final List<TextInputFormatter>? inputFormatters;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  final Widget? prefix;
  final Widget? suffix;
  final EdgeInsets? contentPadding;
  final Color? fillColor;
  final Color? borderColor;
  final double? borderRadius;
  final bool autofocus;
  final bool autocorrect;
  final bool enableSuggestions;
  final TextStyle? style;
  final TextStyle? labelStyle;
  final TextStyle? hintStyle;
  final FloatingLabelBehavior? floatingLabelBehavior;

  const AppTextField({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.helperText,
    this.errorText,
    this.obscureText = false,
    this.readOnly = false,
    this.enabled = true,
    this.maxLines = 1,
    this.minLines,
    this.maxLength,
    this.keyboardType,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.focusNode,
    this.validator,
    this.inputFormatters,
    this.prefixIcon,
    this.suffixIcon,
    this.prefix,
    this.suffix,
    this.contentPadding,
    this.fillColor,
    this.borderColor,
    this.borderRadius,
    this.autofocus = false,
    this.autocorrect = true,
    this.enableSuggestions = true,
    this.style,
    this.labelStyle,
    this.hintStyle,
    this.floatingLabelBehavior,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: obscureText,
      readOnly: readOnly,
      enabled: enabled,
      maxLines: maxLines,
      minLines: minLines,
      maxLength: maxLength,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      textCapitalization: textCapitalization,
      onChanged: onChanged,
      onFieldSubmitted: onSubmitted,
      onTap: onTap,
      focusNode: focusNode,
      validator: validator,
      inputFormatters: inputFormatters,
      autofocus: autofocus,
      autocorrect: autocorrect,
      enableSuggestions: enableSuggestions,
      style: style ?? Theme.of(context).textTheme.bodyLarge,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        helperText: helperText,
        errorText: errorText,
        prefixIcon: prefixIcon != null 
            ? Icon(prefixIcon, color: AppConstants.darkTextSecondary)
            : null,
        suffixIcon: suffixIcon,
        prefix: prefix,
        suffix: suffix,
        contentPadding: contentPadding ?? const EdgeInsets.symmetric(
          horizontal: AppConstants.defaultPadding,
          vertical: AppConstants.defaultPadding,
        ),
        filled: true,
        fillColor: fillColor ?? AppConstants.darkSurface,
        labelStyle: labelStyle ?? TextStyle(
          color: AppConstants.darkTextSecondary,
          fontSize: 16,
          fontFamily: 'Inter',
        ),
        hintStyle: hintStyle ?? TextStyle(
          color: AppConstants.darkTextSecondary,
          fontSize: 16,
          fontFamily: 'Inter',
        ),
        floatingLabelBehavior: floatingLabelBehavior ?? FloatingLabelBehavior.auto,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius ?? AppConstants.borderRadius),
          borderSide: BorderSide(
            color: borderColor ?? AppConstants.darkBorder,
          ),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius ?? AppConstants.borderRadius),
          borderSide: BorderSide(
            color: borderColor ?? AppConstants.darkBorder,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius ?? AppConstants.borderRadius),
          borderSide: const BorderSide(
            color: AppConstants.primaryColor,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius ?? AppConstants.borderRadius),
          borderSide: const BorderSide(
            color: AppConstants.errorColor,
          ),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(borderRadius ?? AppConstants.borderRadius),
          borderSide: const BorderSide(
            color: AppConstants.errorColor,
          ),
        ),
      ),
    );
  }
}