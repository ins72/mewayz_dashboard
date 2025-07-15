import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:internet_connection_checker/internet_connection_checker.dart';

class NetworkInfo {
  final Connectivity _connectivity;
  final InternetConnectionChecker _connectionChecker;
  
  NetworkInfo({
    required Connectivity connectivity,
    required InternetConnectionChecker connectionChecker,
  }) : _connectivity = connectivity, _connectionChecker = connectionChecker;
  
  Future<bool> get isConnected async {
    final connectivityResult = await _connectivity.checkConnectivity();
    
    if (connectivityResult == ConnectivityResult.none) {
      return false;
    }
    
    // Check if we have actual internet access
    return await _connectionChecker.hasConnection;
  }
  
  Stream<bool> get onConnectivityChanged {
    return _connectivity.onConnectivityChanged.asyncMap(
      (connectivityResult) async {
        if (connectivityResult == ConnectivityResult.none) {
          return false;
        }
        return await _connectionChecker.hasConnection;
      },
    );
  }
  
  Future<ConnectivityResult> get connectionType async {
    return await _connectivity.checkConnectivity();
  }
}