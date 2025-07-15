import 'dart:convert';
import 'package:hive/hive.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../utils/app_constants.dart';

class StorageService {
  final SharedPreferences _sharedPreferences;
  final Box _appBox;
  final Box _userBox;
  final Box _workspaceBox;
  final Box _cacheBox;
  
  StorageService({
    required SharedPreferences sharedPreferences,
    required Box appBox,
    required Box userBox,
    required Box workspaceBox,
    required Box cacheBox,
  }) : _sharedPreferences = sharedPreferences,
       _appBox = appBox,
       _userBox = userBox,
       _workspaceBox = workspaceBox,
       _cacheBox = cacheBox;
  
  // Token Management
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _sharedPreferences.setString(AppConstants.accessTokenKey, accessToken);
    await _sharedPreferences.setString(AppConstants.refreshTokenKey, refreshToken);
  }
  
  Future<String?> getAccessToken() async {
    return _sharedPreferences.getString(AppConstants.accessTokenKey);
  }
  
  Future<String?> getRefreshToken() async {
    return _sharedPreferences.getString(AppConstants.refreshTokenKey);
  }
  
  Future<void> clearTokens() async {
    await _sharedPreferences.remove(AppConstants.accessTokenKey);
    await _sharedPreferences.remove(AppConstants.refreshTokenKey);
  }
  
  // User Data Management
  Future<void> saveUserData(Map<String, dynamic> userData) async {
    await _userBox.put('current_user', userData);
    await _sharedPreferences.setString(
      AppConstants.userDataKey,
      json.encode(userData),
    );
  }
  
  Future<Map<String, dynamic>?> getUserData() async {
    final data = _userBox.get('current_user');
    if (data != null) {
      return Map<String, dynamic>.from(data);
    }
    
    // Fallback to SharedPreferences
    final jsonString = _sharedPreferences.getString(AppConstants.userDataKey);
    if (jsonString != null) {
      return Map<String, dynamic>.from(json.decode(jsonString));
    }
    
    return null;
  }
  
  Future<void> clearUserData() async {
    await _userBox.clear();
    await _sharedPreferences.remove(AppConstants.userDataKey);
  }
  
  // Workspace Management
  Future<void> saveWorkspaceData(Map<String, dynamic> workspaceData) async {
    await _workspaceBox.put('current_workspace', workspaceData);
    await _sharedPreferences.setString(
      AppConstants.workspaceDataKey,
      json.encode(workspaceData),
    );
  }
  
  Future<Map<String, dynamic>?> getWorkspaceData() async {
    final data = _workspaceBox.get('current_workspace');
    if (data != null) {
      return Map<String, dynamic>.from(data);
    }
    
    // Fallback to SharedPreferences
    final jsonString = _sharedPreferences.getString(AppConstants.workspaceDataKey);
    if (jsonString != null) {
      return Map<String, dynamic>.from(json.decode(jsonString));
    }
    
    return null;
  }
  
  Future<String?> getCurrentWorkspaceId() async {
    final workspaceData = await getWorkspaceData();
    return workspaceData?['id'] as String?;
  }
  
  Future<void> clearWorkspaceData() async {
    await _workspaceBox.clear();
    await _sharedPreferences.remove(AppConstants.workspaceDataKey);
  }
  
  // Cache Management
  Future<void> cacheData(String key, dynamic data, {Duration? ttl}) async {
    final cacheItem = {
      'data': data,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
      'ttl': ttl?.inMilliseconds,
    };
    
    await _cacheBox.put(key, cacheItem);
  }
  
  Future<T?> getCachedData<T>(String key) async {
    final cacheItem = _cacheBox.get(key);
    if (cacheItem == null) return null;
    
    final timestamp = cacheItem['timestamp'] as int;
    final ttl = cacheItem['ttl'] as int?;
    
    if (ttl != null) {
      final now = DateTime.now().millisecondsSinceEpoch;
      final expiry = timestamp + ttl;
      
      if (now > expiry) {
        await _cacheBox.delete(key);
        return null;
      }
    }
    
    return cacheItem['data'] as T?;
  }
  
  Future<void> clearCache() async {
    await _cacheBox.clear();
  }
  
  // App Settings
  Future<void> saveAppSetting(String key, dynamic value) async {
    await _appBox.put(key, value);
  }
  
  Future<T?> getAppSetting<T>(String key) async {
    return _appBox.get(key) as T?;
  }
  
  Future<void> removeAppSetting(String key) async {
    await _appBox.delete(key);
  }
  
  // Theme Management
  Future<void> saveThemePreference(String theme) async {
    await _sharedPreferences.setString(AppConstants.themeKey, theme);
  }
  
  Future<String?> getThemePreference() async {
    return _sharedPreferences.getString(AppConstants.themeKey);
  }
  
  // Language Management
  Future<void> saveLanguagePreference(String language) async {
    await _sharedPreferences.setString(AppConstants.languageKey, language);
  }
  
  Future<String?> getLanguagePreference() async {
    return _sharedPreferences.getString(AppConstants.languageKey);
  }
  
  // Biometric Settings
  Future<void> setBiometricEnabled(bool enabled) async {
    await _sharedPreferences.setBool('biometric_enabled', enabled);
  }
  
  Future<bool> isBiometricEnabled() async {
    return _sharedPreferences.getBool('biometric_enabled') ?? false;
  }
  
  // Notification Settings
  Future<void> setNotificationsEnabled(bool enabled) async {
    await _sharedPreferences.setBool('notifications_enabled', enabled);
  }
  
  Future<bool> areNotificationsEnabled() async {
    return _sharedPreferences.getBool('notifications_enabled') ?? true;
  }
  
  // Onboarding
  Future<void> setOnboardingCompleted(bool completed) async {
    await _sharedPreferences.setBool('onboarding_completed', completed);
  }
  
  Future<bool> isOnboardingCompleted() async {
    return _sharedPreferences.getBool('onboarding_completed') ?? false;
  }
  
  // First Launch
  Future<void> setFirstLaunch(bool isFirstLaunch) async {
    await _sharedPreferences.setBool('first_launch', isFirstLaunch);
  }
  
  Future<bool> isFirstLaunch() async {
    return _sharedPreferences.getBool('first_launch') ?? true;
  }
  
  // Clear All Data
  Future<void> clearAll() async {
    await clearTokens();
    await clearUserData();
    await clearWorkspaceData();
    await clearCache();
    await _appBox.clear();
    await _sharedPreferences.clear();
  }
  
  // Bulk Operations
  Future<void> saveUserSession({
    required String accessToken,
    required String refreshToken,
    required Map<String, dynamic> userData,
    required Map<String, dynamic> workspaceData,
  }) async {
    await Future.wait([
      saveTokens(accessToken: accessToken, refreshToken: refreshToken),
      saveUserData(userData),
      saveWorkspaceData(workspaceData),
    ]);
  }
  
  Future<bool> hasValidSession() async {
    final accessToken = await getAccessToken();
    final userData = await getUserData();
    return accessToken != null && userData != null;
  }
  
  Future<Map<String, dynamic>?> getCompleteUserSession() async {
    final accessToken = await getAccessToken();
    final refreshToken = await getRefreshToken();
    final userData = await getUserData();
    final workspaceData = await getWorkspaceData();
    
    if (accessToken == null || userData == null) {
      return null;
    }
    
    return {
      'access_token': accessToken,
      'refresh_token': refreshToken,
      'user_data': userData,
      'workspace_data': workspaceData,
    };
  }
}