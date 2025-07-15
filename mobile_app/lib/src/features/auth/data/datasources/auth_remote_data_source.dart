import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/auth_response_model.dart';

part 'auth_remote_data_source.g.dart';

@RestApi()
abstract class AuthRemoteDataSource {
  factory AuthRemoteDataSource(Dio dio) = _AuthRemoteDataSource;
  
  @POST('/auth/login')
  Future<AuthResponseModel> login(@Body() Map<String, dynamic> body);
  
  @POST('/auth/register')
  Future<AuthResponseModel> register(@Body() Map<String, dynamic> body);
  
  @POST('/auth/refresh')
  Future<AuthResponseModel> refresh(@Body() Map<String, dynamic> body);
  
  @POST('/auth/logout')
  Future<Map<String, dynamic>> logout();
  
  @POST('/auth/forgot-password')
  Future<Map<String, dynamic>> forgotPassword(@Body() Map<String, dynamic> body);
  
  @POST('/auth/reset-password')
  Future<Map<String, dynamic>> resetPassword(@Body() Map<String, dynamic> body);
  
  @POST('/auth/verify-email')
  Future<Map<String, dynamic>> verifyEmail(@Body() Map<String, dynamic> body);
  
  @POST('/auth/resend-verification')
  Future<Map<String, dynamic>> resendVerification(@Body() Map<String, dynamic> body);
  
  @GET('/auth/me')
  Future<AuthResponseModel> getCurrentUser();
  
  @PUT('/auth/profile')
  Future<AuthResponseModel> updateProfile(@Body() Map<String, dynamic> body);
  
  @PUT('/auth/change-password')
  Future<Map<String, dynamic>> changePassword(@Body() Map<String, dynamic> body);
  
  @POST('/auth/two-factor/enable')
  Future<Map<String, dynamic>> enableTwoFactor(@Body() Map<String, dynamic> body);
  
  @POST('/auth/two-factor/disable')
  Future<Map<String, dynamic>> disableTwoFactor(@Body() Map<String, dynamic> body);
  
  @POST('/auth/two-factor/verify')
  Future<Map<String, dynamic>> verifyTwoFactor(@Body() Map<String, dynamic> body);
  
  @DELETE('/auth/account')
  Future<Map<String, dynamic>> deleteAccount(@Body() Map<String, dynamic> body);
}