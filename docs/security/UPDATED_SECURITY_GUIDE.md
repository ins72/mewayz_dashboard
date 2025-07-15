# 🔐 Mewayz Security Guide

![Security](https://img.shields.io/badge/Security-Enterprise%20Level-brightgreen)
![Laravel](https://img.shields.io/badge/Laravel-12%20Sanctum-red)
![Authentication](https://img.shields.io/badge/Authentication-JWT-blue)

Comprehensive security guide for the Mewayz business management platform.

## 📋 **Table of Contents**

- [Security Overview](#security-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [API Security](#api-security)
- [Database Security](#database-security)
- [Infrastructure Security](#infrastructure-security)
- [Frontend Security](#frontend-security)
- [File Upload Security](#file-upload-security)
- [Monitoring & Logging](#monitoring--logging)
- [Compliance](#compliance)
- [Security Best Practices](#security-best-practices)
- [Incident Response](#incident-response)

## 🔍 **Security Overview**

### **Security Architecture**
```
User Request → HTTPS → WAF → Load Balancer → Web Server → Application → Database
     ↓              ↓         ↓              ↓            ↓            ↓
Rate Limiting → SSL Cert → Firewall → Auth Middleware → JWT Tokens → Encryption
```

### **Security Layers**
1. **Network Security** - Firewall, DDoS protection
2. **Transport Security** - HTTPS, SSL certificates
3. **Application Security** - Authentication, authorization
4. **Data Security** - Encryption, access controls
5. **Infrastructure Security** - Server hardening, monitoring

### **Security Standards**
- **OWASP Top 10** compliance
- **ISO 27001** security practices
- **GDPR** data protection compliance
- **SOC 2** security controls
- **PCI DSS** for payment processing

## 🔐 **Authentication & Authorization**

### **Authentication Methods**

#### **1. JWT Authentication (Laravel Sanctum)**
```php
// Token generation
$token = $user->createToken('auth_token')->plainTextToken;

// Token validation
$user = auth('sanctum')->user();
```

**Security Features:**
- Stateless authentication
- Token expiration
- Secure token storage
- Refresh token mechanism

#### **2. OAuth Integration**
```php
// Google OAuth
Route::get('/auth/google', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);
```

**Security Features:**
- Industry-standard OAuth 2.0
- Secure token exchange
- User consent management
- Revocation support

### **Authorization (Role-Based Access Control)**

#### **Workspace-Level Permissions**
```php
// Middleware protection
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('workspaces', WorkspaceController::class);
});

// Role-based authorization
if (!$workspace->members()->where('user_id', auth()->id())->exists()) {
    return response()->json(['error' => 'Unauthorized'], 403);
}
```

**Permission Levels:**
- **Owner**: Full workspace control
- **Admin**: Workspace management
- **Editor**: Content management
- **Contributor**: Content creation
- **Viewer**: Read-only access
- **Guest**: Limited access

### **Password Security**

#### **Password Requirements**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

#### **Password Hashing**
```php
// Bcrypt hashing (Laravel default)
$hashedPassword = bcrypt($password);

// Verification
if (Hash::check($password, $hashedPassword)) {
    // Password is correct
}
```

#### **Password Reset**
```php
// Secure password reset
Route::post('/auth/password/reset', [AuthController::class, 'resetPassword']);
```

**Security Features:**
- Secure token generation
- Time-limited reset tokens
- Email verification
- Password strength validation

## 🛡️ **Data Protection**

### **Data Encryption**

#### **Database Encryption**
```php
// Laravel encryption
$encrypted = encrypt($data);
$decrypted = decrypt($encrypted);

// Database column encryption
protected $casts = [
    'sensitive_data' => 'encrypted',
];
```

#### **File Encryption**
```php
// Encrypt files before storage
$encryptedFile = encrypt(file_get_contents($file));
Storage::put('encrypted_files/'.$filename, $encryptedFile);
```

### **Data Privacy**

#### **Personal Data Protection**
- **Data Minimization**: Only collect necessary data
- **Purpose Limitation**: Use data only for stated purposes
- **Retention Limits**: Delete data when no longer needed
- **Access Controls**: Restrict data access to authorized users

#### **GDPR Compliance**
```php
// Data export (Right to portability)
Route::get('/user/export', [UserController::class, 'exportData']);

// Data deletion (Right to erasure)
Route::delete('/user/delete', [UserController::class, 'deleteAccount']);
```

### **Data Masking**

#### **Sensitive Data Masking**
```php
// Mask sensitive data in logs
Log::info('User login', [
    'user_id' => $user->id,
    'email' => mask_email($user->email),
    'ip' => mask_ip($request->ip())
]);
```

#### **API Response Masking**
```php
// Hide sensitive fields in API responses
protected $hidden = [
    'password',
    'remember_token',
    'google_id',
    'access_tokens'
];
```

## 🔒 **API Security**

### **API Authentication**

#### **Bearer Token Authentication**
```javascript
// Frontend API client
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
```

#### **API Rate Limiting**
```php
// Laravel rate limiting
Route::middleware('throttle:60,1')->group(function () {
    // API routes
});
```

**Rate Limits:**
- **Authentication**: 5 requests/minute
- **General API**: 100 requests/minute
- **File Upload**: 10 requests/minute
- **Public API**: 1000 requests/hour

### **API Validation**

#### **Input Validation**
```php
// Request validation
public function rules()
{
    return [
        'email' => 'required|email|max:255',
        'password' => 'required|min:8|confirmed',
        'name' => 'required|string|max:255',
    ];
}
```

#### **SQL Injection Prevention**
```php
// Use Eloquent ORM (parameterized queries)
$users = User::where('email', $email)->get();

// Avoid raw queries
// $users = DB::raw("SELECT * FROM users WHERE email = '$email'"); // DANGEROUS
```

### **API Response Security**

#### **Error Handling**
```php
// Secure error responses
public function render($request, Throwable $exception)
{
    if ($exception instanceof ValidationException) {
        return response()->json([
            'success' => false,
            'errors' => $exception->errors()
        ], 422);
    }
    
    // Don't expose sensitive error details in production
    if (app()->environment('production')) {
        return response()->json([
            'success' => false,
            'message' => 'Server error'
        ], 500);
    }
}
```

#### **CORS Configuration**
```php
// Configure CORS
'paths' => ['api/*'],
'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE'],
'allowed_origins' => [env('FRONTEND_URL')],
'allowed_headers' => ['*'],
'exposed_headers' => [],
'max_age' => 0,
'supports_credentials' => false,
```

## 🗄️ **Database Security**

### **Database Access Control**

#### **User Privileges**
```sql
-- Create dedicated database user
CREATE USER 'mewayz_app'@'localhost' IDENTIFIED BY 'secure_password';

-- Grant minimal required privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON mewayz_production.* TO 'mewayz_app'@'localhost';

-- Revoke unnecessary privileges
REVOKE CREATE, DROP, ALTER ON mewayz_production.* FROM 'mewayz_app'@'localhost';
```

#### **Connection Security**
```php
// Database connection encryption
'mysql' => [
    'driver' => 'mysql',
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '3306'),
    'database' => env('DB_DATABASE', 'forge'),
    'username' => env('DB_USERNAME', 'forge'),
    'password' => env('DB_PASSWORD', ''),
    'options' => [
        PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
        PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false,
    ],
],
```

### **Data Integrity**

#### **UUID Primary Keys**
```php
// Non-sequential primary keys
public $incrementing = false;
protected $keyType = 'string';

protected static function booted(): void
{
    static::creating(function ($model) {
        if (empty($model->id)) {
            $model->id = (string) Str::uuid();
        }
    });
}
```

#### **Database Constraints**
```php
// Foreign key constraints
$table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
$table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
```

### **Database Auditing**

#### **Activity Logging**
```php
// Log all database activities
class ActivityLog extends Model
{
    protected $fillable = [
        'workspace_id',
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'changes',
        'ip_address',
        'user_agent'
    ];
}
```

#### **Change Tracking**
```php
// Track model changes
protected static function booted()
{
    static::updated(function ($model) {
        ActivityLog::create([
            'user_id' => auth()->id(),
            'action' => 'updated',
            'entity_type' => get_class($model),
            'entity_id' => $model->id,
            'changes' => $model->getChanges(),
        ]);
    });
}
```

## 🌐 **Infrastructure Security**

### **Server Security**

#### **Operating System Hardening**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Configure firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Disable unnecessary services
sudo systemctl disable apache2
sudo systemctl disable sendmail
```

#### **SSH Security**
```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config
```

```config
# Disable root login
PermitRootLogin no

# Use key-based authentication
PasswordAuthentication no
PubkeyAuthentication yes

# Change default port
Port 2222

# Limit login attempts
MaxAuthTries 3
MaxSessions 2
```

### **Web Server Security**

#### **Nginx Security Configuration**
```nginx
server {
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
    
    # Hide server information
    server_tokens off;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    # Block common attacks
    location ~ /\. { deny all; }
    location ~ ~$ { deny all; }
    location ~* \.(env|log|htaccess)$ { deny all; }
}
```

#### **SSL/TLS Configuration**
```nginx
# SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA256;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### **Network Security**

#### **Firewall Rules**
```bash
# Configure UFW firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### **Fail2Ban Configuration**
```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure jail
sudo nano /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-req-limit]
enabled = true
filter = nginx-req-limit
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
maxretry = 10
```

## 🎨 **Frontend Security**

### **Content Security Policy (CSP)**

#### **CSP Headers**
```javascript
// CSP configuration
const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", process.env.REACT_APP_BACKEND_URL],
    fontSrc: ["'self'", "https:"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"],
  },
};
```

### **XSS Prevention**

#### **Input Sanitization**
```javascript
// Sanitize user input
import DOMPurify from 'dompurify';

const sanitizeInput = (input) => {
  return DOMPurify.sanitize(input);
};

// Use sanitized content
const cleanContent = sanitizeInput(userInput);
```

#### **Output Encoding**
```javascript
// Encode output
const encodeHTML = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};
```

### **Authentication Security**

#### **Token Management**
```javascript
// Secure token storage
const tokenManager = {
  setToken(token) {
    localStorage.setItem('auth_token', token);
    this.setTokenExpiry();
  },
  
  getToken() {
    if (this.isTokenExpired()) {
      this.removeToken();
      return null;
    }
    return localStorage.getItem('auth_token');
  },
  
  removeToken() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token_expiry');
  },
  
  setTokenExpiry() {
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    localStorage.setItem('token_expiry', expiry.toISOString());
  },
  
  isTokenExpired() {
    const expiry = localStorage.getItem('token_expiry');
    if (!expiry) return true;
    return new Date() > new Date(expiry);
  }
};
```

## 📁 **File Upload Security**

### **File Upload Validation**

#### **File Type Validation**
```php
// Validate file types
public function rules()
{
    return [
        'file' => 'required|file|mimes:jpg,jpeg,png,pdf,doc,docx|max:10240',
        'image' => 'required|image|mimes:jpg,jpeg,png|max:2048',
    ];
}
```

#### **File Size Limits**
```php
// Configure file size limits
'max_filesize' => 10 * 1024 * 1024, // 10MB
'allowed_types' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
```

### **File Storage Security**

#### **Secure File Storage**
```php
// Store files outside web root
$path = $request->file('upload')->store('uploads', 'secure');

// Generate unique filenames
$filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
```

#### **File Access Control**
```php
// Controlled file access
Route::middleware('auth')->get('/files/{file}', function ($file) {
    $path = storage_path('app/secure/' . $file);
    
    if (!file_exists($path)) {
        abort(404);
    }
    
    return response()->file($path);
});
```

## 📊 **Monitoring & Logging**

### **Security Monitoring**

#### **Log Configuration**
```php
// Laravel logging configuration
'channels' => [
    'security' => [
        'driver' => 'daily',
        'path' => storage_path('logs/security.log'),
        'level' => 'info',
        'days' => 30,
    ],
    
    'audit' => [
        'driver' => 'daily',
        'path' => storage_path('logs/audit.log'),
        'level' => 'info',
        'days' => 90,
    ],
],
```

#### **Security Event Logging**
```php
// Log security events
Log::channel('security')->info('Failed login attempt', [
    'email' => $email,
    'ip' => $request->ip(),
    'user_agent' => $request->userAgent(),
    'timestamp' => now(),
]);

Log::channel('security')->warning('Suspicious activity detected', [
    'user_id' => $user->id,
    'activity' => 'multiple_failed_attempts',
    'ip' => $request->ip(),
]);
```

### **Intrusion Detection**

#### **Suspicious Activity Detection**
```php
// Monitor for suspicious patterns
class SecurityMonitor
{
    public function checkSuspiciousActivity(Request $request)
    {
        $ip = $request->ip();
        $recentAttempts = $this->getRecentFailedAttempts($ip);
        
        if ($recentAttempts > 5) {
            $this->triggerAlert('Multiple failed login attempts', $ip);
            return true;
        }
        
        return false;
    }
    
    private function triggerAlert($message, $ip)
    {
        Log::channel('security')->alert($message, [
            'ip' => $ip,
            'timestamp' => now(),
        ]);
        
        // Send notification to security team
        // Mail::to('security@mewayz.com')->send(new SecurityAlert($message, $ip));
    }
}
```

## 📜 **Compliance**

### **GDPR Compliance**

#### **Data Rights Implementation**
```php
// Data portability
public function exportUserData(User $user)
{
    $data = [
        'personal_data' => $user->only(['name', 'email', 'created_at']),
        'workspaces' => $user->workspaces()->get(),
        'social_posts' => $user->socialMediaPosts()->get(),
        'crm_contacts' => $user->crmContacts()->get(),
    ];
    
    return response()->json($data);
}

// Data erasure
public function deleteUserData(User $user)
{
    // Anonymize instead of hard delete for audit trail
    $user->update([
        'name' => 'Deleted User',
        'email' => 'deleted_' . $user->id . '@example.com',
        'deleted_at' => now(),
    ]);
    
    // Delete associated data
    $user->socialMediaPosts()->delete();
    $user->crmContacts()->delete();
}
```

### **PCI DSS Compliance**

#### **Payment Data Security**
```php
// Never store sensitive payment data
class PaymentController extends Controller
{
    public function processPayment(Request $request)
    {
        // Use Stripe for payment processing
        $stripe = new \Stripe\StripeClient(env('STRIPE_SECRET'));
        
        $paymentIntent = $stripe->paymentIntents->create([
            'amount' => $request->amount,
            'currency' => 'usd',
            'metadata' => [
                'workspace_id' => $request->workspace_id,
                'user_id' => auth()->id(),
            ],
        ]);
        
        // Store only non-sensitive data
        PaymentTransaction::create([
            'user_id' => auth()->id(),
            'workspace_id' => $request->workspace_id,
            'amount' => $request->amount,
            'currency' => 'usd',
            'stripe_payment_intent_id' => $paymentIntent->id,
            'status' => 'pending',
        ]);
        
        return response()->json([
            'client_secret' => $paymentIntent->client_secret,
        ]);
    }
}
```

## 🚨 **Incident Response**

### **Incident Response Plan**

#### **1. Detection**
- Automated monitoring alerts
- User reports
- Security log analysis
- Performance anomalies

#### **2. Assessment**
- Determine incident severity
- Identify affected systems
- Assess potential impact
- Document findings

#### **3. Containment**
- Isolate affected systems
- Prevent further damage
- Preserve evidence
- Notify stakeholders

#### **4. Recovery**
- Restore systems from backups
- Apply security patches
- Verify system integrity
- Resume normal operations

#### **5. Post-Incident**
- Conduct incident review
- Update security measures
- Improve monitoring
- Update response procedures

### **Security Incident Types**

#### **Data Breach Response**
```php
// Immediate response actions
class DataBreachResponse
{
    public function handleBreach($incident)
    {
        // 1. Stop the breach
        $this->containThreat($incident);
        
        // 2. Assess the damage
        $affectedData = $this->assessDamage($incident);
        
        // 3. Notify authorities (within 72 hours for GDPR)
        $this->notifyAuthorities($affectedData);
        
        // 4. Notify affected users
        $this->notifyUsers($affectedData);
        
        // 5. Document everything
        $this->documentIncident($incident, $affectedData);
    }
}
```

## 🔧 **Security Best Practices**

### **Development Security**

#### **Secure Coding Practices**
1. **Input Validation**: Validate all user inputs
2. **Output Encoding**: Encode all outputs
3. **Authentication**: Implement strong authentication
4. **Authorization**: Use principle of least privilege
5. **Error Handling**: Don't expose sensitive information
6. **Logging**: Log security events
7. **Testing**: Regular security testing

#### **Code Review Checklist**
- [ ] All user inputs validated
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Authentication implemented
- [ ] Authorization checked
- [ ] Error handling secure
- [ ] Logging implemented
- [ ] No hardcoded secrets

### **Deployment Security**

#### **Production Security Checklist**
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Database secured
- [ ] File permissions set
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Incident response plan ready
- [ ] Security testing completed

### **Ongoing Security**

#### **Regular Security Tasks**
- **Weekly**: Review security logs
- **Monthly**: Update dependencies
- **Quarterly**: Security assessment
- **Annually**: Security audit

#### **Security Updates**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update PHP packages
composer update

# Update Node.js packages
yarn upgrade

# Update SSL certificates
sudo certbot renew
```

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Enterprise Security Ready

For additional security information, see the [Developer Guide](UPDATED_DEVELOPER_GUIDE.md) or contact the security team.