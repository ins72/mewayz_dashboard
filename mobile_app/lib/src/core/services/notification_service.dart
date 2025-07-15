import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:permission_handler/permission_handler.dart';

import '../utils/app_constants.dart';

class NotificationService {
  static final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();
  static final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  
  static Future<void> initialize() async {
    // Initialize local notifications
    await _initializeLocalNotifications();
    
    // Initialize Firebase messaging
    await _initializeFirebaseMessaging();
  }
  
  static Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const DarwinInitializationSettings initializationSettingsIOS =
        DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const InitializationSettings initializationSettings =
        InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsIOS,
    );
    
    await _localNotifications.initialize(
      initializationSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
  }
  
  static Future<void> _initializeFirebaseMessaging() async {
    // Request permission for iOS
    await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      announcement: false,
    );
    
    // Get FCM token
    final token = await _firebaseMessaging.getToken();
    if (kDebugMode) {
      debugPrint('FCM Token: $token');
    }
    
    // Listen for token refresh
    _firebaseMessaging.onTokenRefresh.listen((token) {
      if (kDebugMode) {
        debugPrint('FCM Token refreshed: $token');
      }
      // TODO: Send token to server
    });
    
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    
    // Handle background messages
    FirebaseMessaging.onMessageOpenedApp.listen(_handleBackgroundMessage);
    
    // Handle notification when app is launched from notification
    final initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _handleBackgroundMessage(initialMessage);
    }
  }
  
  static Future<void> _handleForegroundMessage(RemoteMessage message) async {
    if (kDebugMode) {
      debugPrint('Received foreground message: ${message.messageId}');
    }
    
    // Show local notification for foreground messages
    await showNotification(
      title: message.notification?.title ?? 'Mewayz',
      body: message.notification?.body ?? 'You have a new notification',
      payload: message.data.toString(),
    );
  }
  
  static Future<void> _handleBackgroundMessage(RemoteMessage message) async {
    if (kDebugMode) {
      debugPrint('Handled background message: ${message.messageId}');
    }
    
    // Handle navigation based on message data
    final data = message.data;
    if (data.isNotEmpty) {
      // TODO: Navigate to appropriate screen based on notification data
      _handleNotificationNavigation(data);
    }
  }
  
  static void _onNotificationTapped(NotificationResponse response) {
    if (kDebugMode) {
      debugPrint('Notification tapped: ${response.payload}');
    }
    
    // TODO: Handle notification tap navigation
    if (response.payload != null) {
      _handleNotificationNavigation(response.payload!);
    }
  }
  
  static void _handleNotificationNavigation(dynamic data) {
    // Parse notification data and navigate accordingly
    // This will be implemented when we have the navigation context
  }
  
  // Public methods
  static Future<bool> requestPermission() async {
    final status = await Permission.notification.request();
    return status == PermissionStatus.granted;
  }
  
  static Future<bool> areNotificationsEnabled() async {
    final status = await Permission.notification.status;
    return status == PermissionStatus.granted;
  }
  
  static Future<void> showNotification({
    int id = 0,
    required String title,
    required String body,
    String? payload,
    String? channelId,
    String? channelName,
    String? channelDescription,
    String? sound,
    AndroidNotificationDetails? androidDetails,
    DarwinNotificationDetails? iosDetails,
  }) async {
    final androidNotificationDetails = androidDetails ?? AndroidNotificationDetails(
      channelId ?? 'default_channel',
      channelName ?? 'Default',
      channelDescription: channelDescription ?? 'Default notification channel',
      importance: Importance.high,
      priority: Priority.high,
      sound: sound != null ? RawResourceAndroidNotificationSound(sound) : null,
      playSound: sound != null,
      enableVibration: true,
      enableLights: true,
      ledColor: AppConstants.primaryColor,
      ledOnMs: 1000,
      ledOffMs: 500,
    );
    
    final iosNotificationDetails = iosDetails ?? DarwinNotificationDetails(
      sound: sound,
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    
    final notificationDetails = NotificationDetails(
      android: androidNotificationDetails,
      iOS: iosNotificationDetails,
    );
    
    await _localNotifications.show(
      id,
      title,
      body,
      notificationDetails,
      payload: payload,
    );
  }
  
  static Future<void> showScheduledNotification({
    required int id,
    required String title,
    required String body,
    required DateTime scheduledDate,
    String? payload,
    String? channelId,
    String? channelName,
    String? channelDescription,
  }) async {
    await _localNotifications.zonedSchedule(
      id,
      title,
      body,
      scheduledDate,
      NotificationDetails(
        android: AndroidNotificationDetails(
          channelId ?? 'scheduled_channel',
          channelName ?? 'Scheduled',
          channelDescription: channelDescription ?? 'Scheduled notification channel',
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: const DarwinNotificationDetails(),
      ),
      payload: payload,
      uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
    );
  }
  
  static Future<void> cancelNotification(int id) async {
    await _localNotifications.cancel(id);
  }
  
  static Future<void> cancelAllNotifications() async {
    await _localNotifications.cancelAll();
  }
  
  static Future<List<PendingNotificationRequest>> getPendingNotifications() async {
    return await _localNotifications.pendingNotificationRequests();
  }
  
  static Future<String?> getFCMToken() async {
    return await _firebaseMessaging.getToken();
  }
  
  static Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }
  
  static Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }
  
  // Notification channels for different types
  static const String generalChannelId = 'general';
  static const String crmChannelId = 'crm';
  static const String ecommerceChannelId = 'ecommerce';
  static const String marketingChannelId = 'marketing';
  static const String coursesChannelId = 'courses';
  
  // Notification types
  static const String typeGeneral = 'general';
  static const String typeCrmContact = 'crm_contact';
  static const String typeCrmDeal = 'crm_deal';
  static const String typeCrmTask = 'crm_task';
  static const String typeEcommerceOrder = 'ecommerce_order';
  static const String typeEcommerceProduct = 'ecommerce_product';
  static const String typeMarketingCampaign = 'marketing_campaign';
  static const String typeCoursesEnrollment = 'courses_enrollment';
  
  // Convenience methods for specific notification types
  static Future<void> showCrmNotification({
    required String title,
    required String body,
    required String type,
    String? entityId,
  }) async {
    await showNotification(
      title: title,
      body: body,
      channelId: crmChannelId,
      channelName: 'CRM',
      channelDescription: 'CRM related notifications',
      payload: '$type:$entityId',
    );
  }
  
  static Future<void> showEcommerceNotification({
    required String title,
    required String body,
    required String type,
    String? entityId,
  }) async {
    await showNotification(
      title: title,
      body: body,
      channelId: ecommerceChannelId,
      channelName: 'E-commerce',
      channelDescription: 'E-commerce related notifications',
      payload: '$type:$entityId',
    );
  }
  
  static Future<void> showMarketingNotification({
    required String title,
    required String body,
    required String type,
    String? entityId,
  }) async {
    await showNotification(
      title: title,
      body: body,
      channelId: marketingChannelId,
      channelName: 'Marketing',
      channelDescription: 'Marketing related notifications',
      payload: '$type:$entityId',
    );
  }
  
  static Future<void> showCoursesNotification({
    required String title,
    required String body,
    required String type,
    String? entityId,
  }) async {
    await showNotification(
      title: title,
      body: body,
      channelId: coursesChannelId,
      channelName: 'Courses',
      channelDescription: 'Courses related notifications',
      payload: '$type:$entityId',
    );
  }
}