import 'package:dio/dio.dart';
import 'package:hive/hive.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:internet_connection_checker/internet_connection_checker.dart';

import '../utils/app_constants.dart';
import '../network/dio_client.dart';
import '../network/network_info.dart';
import '../storage/storage_service.dart';

class DependencyInjection {
  static late final DioClient _dioClient;
  static late final StorageService _storageService;
  static late final NetworkInfo _networkInfo;
  static late final SharedPreferences _sharedPreferences;
  
  static DioClient get dioClient => _dioClient;
  static StorageService get storageService => _storageService;
  static NetworkInfo get networkInfo => _networkInfo;
  static SharedPreferences get sharedPreferences => _sharedPreferences;
  
  static Future<void> initialize() async {
    // Initialize SharedPreferences
    _sharedPreferences = await SharedPreferences.getInstance();
    
    // Initialize Hive boxes
    await Hive.openBox('app_storage');
    await Hive.openBox('user_data');
    await Hive.openBox('workspace_data');
    await Hive.openBox('cache_data');
    
    // Initialize NetworkInfo
    _networkInfo = NetworkInfo(
      connectivity: Connectivity(),
      connectionChecker: InternetConnectionChecker(),
    );
    
    // Initialize StorageService
    _storageService = StorageService(
      sharedPreferences: _sharedPreferences,
      appBox: Hive.box('app_storage'),
      userBox: Hive.box('user_data'),
      workspaceBox: Hive.box('workspace_data'),
      cacheBox: Hive.box('cache_data'),
    );
    
    // Initialize DioClient
    _dioClient = DioClient(
      baseUrl: AppConstants.baseUrl + AppConstants.apiPrefix,
      connectTimeout: AppConstants.apiTimeout,
      receiveTimeout: AppConstants.apiTimeout,
      storageService: _storageService,
      networkInfo: _networkInfo,
    );
  }
}