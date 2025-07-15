# 🚀 **Mewayz Deployment Guide**

**Version**: 1.0.0  
**Last Updated**: January 15, 2025  
**Target Domain**: mewayz.com

---

## 📋 **Table of Contents**

1. [Deployment Overview](#deployment-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Database Configuration](#database-configuration)
5. [Backend Deployment](#backend-deployment)
6. [Frontend Deployment](#frontend-deployment)
7. [Server Configuration](#server-configuration)
8. [SSL Certificate Setup](#ssl-certificate-setup)
9. [Monitoring & Logging](#monitoring--logging)
10. [Backup & Recovery](#backup--recovery)
11. [Performance Optimization](#performance-optimization)
12. [Security Hardening](#security-hardening)

---

## 🏗️ **Deployment Overview**

### **Architecture Overview**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Web Server    │    │   Database      │
│   (CloudFlare)  │◄──►│   (Nginx)       │◄──►│   (MariaDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Application   │
                       │   (Laravel +    │
                       │    React)       │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Cache & Queue │
                       │   (Redis)       │
                       └─────────────────┘
```

### **Deployment Targets**
- **Production**: mewayz.com
- **Staging**: staging.mewayz.com
- **Development**: dev.mewayz.com

### **Technology Stack**
- **Web Server**: Nginx 1.18+
- **PHP**: PHP 8.2 + PHP-FPM
- **Database**: MariaDB 10.6+
- **Cache**: Redis 6.0+
- **Queue**: Laravel Queue with Redis
- **Process Manager**: Supervisor
- **SSL**: Let's Encrypt
- **CDN**: CloudFlare

---

## 📋 **Prerequisites**

### **Server Requirements**

#### **Production Server Specifications**
- **CPU**: 4+ cores (8+ recommended)
- **RAM**: 8GB minimum (16GB+ recommended)
- **Storage**: 100GB SSD minimum
- **Network**: 1Gbps connection
- **OS**: Ubuntu 20.04 LTS or CentOS 8+

#### **Software Requirements**
- **Web Server**: Nginx 1.18+
- **PHP**: 8.2+ with required extensions
- **Database**: MariaDB 10.6+ or MySQL 8.0+
- **Cache**: Redis 6.0+
- **Node.js**: 18.x LTS
- **Composer**: 2.x
- **Yarn**: 1.22.x

### **Domain & DNS Setup**

#### **Domain Configuration**
```bash
# Main domain
mewayz.com → A record → Production IP

# Subdomains
www.mewayz.com → CNAME → mewayz.com
api.mewayz.com → CNAME → mewayz.com
staging.mewayz.com → A record → Staging IP
```

#### **CloudFlare Configuration**
```bash
# DNS Records
A     mewayz.com         Production IP    Proxied
CNAME www.mewayz.com     mewayz.com      Proxied
CNAME api.mewayz.com     mewayz.com      Proxied

# SSL Settings
SSL Mode: Full (strict)
Always Use HTTPS: On
Minimum TLS Version: 1.2
```

---

## 🔧 **Environment Setup**

### **Server Preparation**

#### **System Updates**
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates

# Add required repositories
sudo add-apt-repository ppa:ondrej/php -y
sudo add-apt-repository ppa:nginx/stable -y
```

#### **PHP Installation**
```bash
# Install PHP 8.2 and extensions
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-redis php8.2-xml php8.2-gd php8.2-curl php8.2-zip php8.2-mbstring php8.2-bcmath php8.2-intl php8.2-json php8.2-tokenizer

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
sudo chmod +x /usr/local/bin/composer
```

#### **Node.js Installation**
```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Yarn
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install -y yarn
```

#### **Database Installation**
```bash
# Install MariaDB
sudo apt install -y mariadb-server mariadb-client

# Secure MariaDB installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
CREATE DATABASE mewayz_production;
CREATE USER 'mewayz_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON mewayz_production.* TO 'mewayz_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### **Redis Installation**
```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: supervised systemd
# Set: maxmemory 256mb
# Set: maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

---

## 🗄️ **Database Configuration**

### **Database Setup**

#### **MariaDB Configuration**
```sql
-- /etc/mysql/mariadb.conf.d/50-server.cnf
[mysqld]
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
query_cache_size = 0
query_cache_type = 0
tmp_table_size = 64M
max_heap_table_size = 64M
max_connections = 200
thread_cache_size = 8
table_open_cache = 2000
```

#### **Database Initialization**
```bash
# Create production database
mysql -u mewayz_user -p mewayz_production

# Import initial schema (if available)
mysql -u mewayz_user -p mewayz_production < database/schema.sql

# Or run Laravel migrations
cd /var/www/mewayz
php artisan migrate --force
```

#### **Database Optimization**
```sql
-- Performance tuning
OPTIMIZE TABLE users;
OPTIMIZE TABLE workspaces;
OPTIMIZE TABLE workspace_members;

-- Add indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
```

### **Database Backup Configuration**
```bash
# Create backup script
sudo nano /usr/local/bin/mewayz-backup.sh

#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/mewayz"
DB_NAME="mewayz_production"
DB_USER="mewayz_user"
DB_PASS="secure_password_here"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

# Make executable
sudo chmod +x /usr/local/bin/mewayz-backup.sh

# Add to crontab
sudo crontab -e
0 2 * * * /usr/local/bin/mewayz-backup.sh
```

---

## 🔧 **Backend Deployment**

### **Application Deployment**

#### **Repository Setup**
```bash
# Create application directory
sudo mkdir -p /var/www/mewayz
sudo chown -R www-data:www-data /var/www/mewayz

# Clone repository
cd /var/www/mewayz
sudo -u www-data git clone https://github.com/mewayz/mewayz-platform.git .

# Set permissions
sudo chown -R www-data:www-data /var/www/mewayz
sudo chmod -R 755 /var/www/mewayz
sudo chmod -R 775 /var/www/mewayz/storage
sudo chmod -R 775 /var/www/mewayz/bootstrap/cache
```

#### **Backend Configuration**
```bash
# Navigate to backend directory
cd /var/www/mewayz/backend

# Install dependencies
sudo -u www-data composer install --no-dev --optimize-autoloader

# Create environment file
sudo -u www-data cp .env.example .env
sudo -u www-data nano .env
```

#### **Environment Configuration**
```env
# /var/www/mewayz/backend/.env

# Application
APP_NAME=Mewayz
APP_ENV=production
APP_KEY=base64:YOUR_APP_KEY_HERE
APP_DEBUG=false
APP_URL=https://mewayz.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mewayz_production
DB_USERNAME=mewayz_user
DB_PASSWORD=secure_password_here

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Cache
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.elasticemail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@mewayz.com
MAIL_PASSWORD=your_elastic_mail_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@mewayz.com
MAIL_FROM_NAME="Mewayz"

# Third-party Services
STRIPE_KEY=pk_live_your_stripe_key
STRIPE_SECRET=sk_live_your_stripe_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://mewayz.com/auth/google/callback

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=warning
```

#### **Application Setup**
```bash
# Generate application key
sudo -u www-data php artisan key:generate

# Cache configuration
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache

# Run database migrations
sudo -u www-data php artisan migrate --force

# Create storage symlink
sudo -u www-data php artisan storage:link

# Set up queue workers
sudo -u www-data php artisan queue:restart
```

### **Process Management**

#### **Supervisor Configuration**
```ini
# /etc/supervisor/conf.d/mewayz-worker.conf
[program:mewayz-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/mewayz/backend/artisan queue:work redis --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/mewayz/backend/storage/logs/worker.log
stopwaitsecs=3600
```

```bash
# Update supervisor configuration
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start mewayz-worker:*
```

#### **Cron Jobs**
```bash
# Add Laravel scheduler
sudo crontab -e -u www-data
* * * * * cd /var/www/mewayz/backend && php artisan schedule:run >> /dev/null 2>&1
```

---

## 🎨 **Frontend Deployment**

### **Build Process**

#### **Frontend Environment**
```bash
# Navigate to frontend directory
cd /var/www/mewayz

# Create frontend environment file
sudo -u www-data nano .env
```

```env
# /var/www/mewayz/.env

# API Configuration
VITE_API_URL=https://mewayz.com/api
VITE_BACKEND_URL=https://mewayz.com

# Authentication
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Payment
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_key

# Analytics
VITE_GOOGLE_ANALYTICS_ID=your_google_analytics_id
VITE_ADSENSE_ID=your_adsense_id
```

#### **Build & Deploy**
```bash
# Install dependencies
sudo -u www-data yarn install --frozen-lockfile

# Build for production
sudo -u www-data yarn build

# Verify build
ls -la dist/

# Set permissions
sudo chown -R www-data:www-data /var/www/mewayz/dist
sudo chmod -R 755 /var/www/mewayz/dist
```

### **Static Asset Management**

#### **Asset Optimization**
```bash
# Install optimization tools
sudo npm install -g imagemin-cli
sudo npm install -g svgo

# Optimize images
find /var/www/mewayz/dist -name "*.png" -exec imagemin {} --out-dir=/var/www/mewayz/dist/optimized \;
find /var/www/mewayz/dist -name "*.jpg" -exec imagemin {} --out-dir=/var/www/mewayz/dist/optimized \;

# Optimize SVGs
find /var/www/mewayz/dist -name "*.svg" -exec svgo {} \;
```

#### **CDN Configuration**
```nginx
# Nginx configuration for static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    access_log off;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/css application/javascript application/json image/svg+xml;
}
```

---

## 🌐 **Server Configuration**

### **Nginx Configuration**

#### **Main Nginx Configuration**
```nginx
# /etc/nginx/nginx.conf
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss application/atom+xml image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: ws: wss: data: blob: 'unsafe-inline'; frame-ancestors 'self';" always;

    # Hide Nginx version
    server_tokens off;

    # Include virtual host configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

#### **Virtual Host Configuration**
```nginx
# /etc/nginx/sites-available/mewayz.com
server {
    listen 80;
    server_name mewayz.com www.mewayz.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mewayz.com www.mewayz.com;
    root /var/www/mewayz/dist;
    index index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mewayz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mewayz.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/mewayz.com/chain.pem;

    # SSL Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API routes
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
        
        # PHP-FPM configuration
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME /var/www/mewayz/backend/public$fastcgi_script_name;
            include fastcgi_params;
            
            # Security
            fastcgi_param HTTP_PROXY "";
            fastcgi_param SERVER_NAME $server_name;
            fastcgi_param HTTPS on;
        }
    }

    # Static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Favicon
    location = /favicon.ico {
        log_not_found off;
        access_log off;
    }

    # Robots
    location = /robots.txt {
        log_not_found off;
        access_log off;
    }
}
```

#### **PHP-FPM Configuration**
```ini
# /etc/php/8.2/fpm/pool.d/mewayz.conf
[mewayz]
user = www-data
group = www-data
listen = /var/run/php/php8.2-fpm-mewayz.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0666

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 1000

php_value[upload_max_filesize] = 100M
php_value[post_max_size] = 100M
php_value[max_execution_time] = 300
php_value[max_input_time] = 300
php_value[memory_limit] = 256M
```

### **Service Management**

#### **Enable Services**
```bash
# Enable and start services
sudo systemctl enable nginx
sudo systemctl enable php8.2-fpm
sudo systemctl enable mariadb
sudo systemctl enable redis-server
sudo systemctl enable supervisor

# Start services
sudo systemctl start nginx
sudo systemctl start php8.2-fpm
sudo systemctl start mariadb
sudo systemctl start redis-server
sudo systemctl start supervisor
```

#### **Service Status Check**
```bash
# Check service status
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
sudo systemctl status mariadb
sudo systemctl status redis-server
sudo systemctl status supervisor

# Check Nginx configuration
sudo nginx -t

# Check PHP-FPM configuration
sudo php-fpm8.2 -t
```

---

## 🔐 **SSL Certificate Setup**

### **Let's Encrypt Configuration**

#### **Certbot Installation**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d mewayz.com -d www.mewayz.com

# Verify certificate
sudo certbot certificates
```

#### **Certificate Renewal**
```bash
# Test renewal
sudo certbot renew --dry-run

# Set up automatic renewal
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

### **SSL Configuration**

#### **SSL Security Headers**
```nginx
# Additional SSL security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

#### **SSL Test**
```bash
# Test SSL configuration
curl -I https://mewayz.com
openssl s_client -connect mewayz.com:443 -servername mewayz.com

# Online SSL test
https://www.ssllabs.com/ssltest/analyze.html?d=mewayz.com
```

---

## 📊 **Monitoring & Logging**

### **Application Monitoring**

#### **Log Configuration**
```php
// config/logging.php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['single', 'slack'],
        'ignore_exceptions' => false,
    ],
    
    'single' => [
        'driver' => 'single',
        'path' => storage_path('logs/laravel.log'),
        'level' => env('LOG_LEVEL', 'warning'),
    ],
    
    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => 'Mewayz Monitor',
        'emoji' => ':warning:',
        'level' => 'error',
    ],
],
```

#### **System Monitoring**
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Create monitoring script
sudo nano /usr/local/bin/system-monitor.sh

#!/bin/bash
LOG_FILE="/var/log/system-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')

# Memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", ($3/$2) * 100.0}')

# Disk usage
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

echo "[$DATE] CPU: $CPU_USAGE% | Memory: $MEMORY_USAGE% | Disk: $DISK_USAGE%" >> $LOG_FILE

# Make executable
sudo chmod +x /usr/local/bin/system-monitor.sh

# Add to crontab
sudo crontab -e
*/5 * * * * /usr/local/bin/system-monitor.sh
```

### **Log Management**

#### **Log Rotation**
```bash
# Configure log rotation
sudo nano /etc/logrotate.d/mewayz

/var/www/mewayz/backend/storage/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload php8.2-fpm
    endscript
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        systemctl reload nginx
    endscript
}
```

#### **Application Monitoring**
```bash
# Install monitoring tools
sudo apt install -y monit

# Configure Monit
sudo nano /etc/monit/monitrc

# Basic configuration
set daemon 120
set logfile /var/log/monit.log
set httpd port 2812 and use address localhost

check system localhost
    if loadavg (5min) > 2 then alert
    if memory usage > 80% then alert
    if cpu usage (user) > 80% then alert

check process nginx with pidfile /var/run/nginx.pid
    start program = "/bin/systemctl start nginx"
    stop program = "/bin/systemctl stop nginx"
    if failed host localhost port 80 then restart

check process php8.2-fpm with pidfile /var/run/php/php8.2-fpm.pid
    start program = "/bin/systemctl start php8.2-fpm"
    stop program = "/bin/systemctl stop php8.2-fpm"

check process mariadb with pidfile /var/run/mysqld/mysqld.pid
    start program = "/bin/systemctl start mariadb"
    stop program = "/bin/systemctl stop mariadb"
    if failed host localhost port 3306 then restart

check process redis with pidfile /var/run/redis/redis-server.pid
    start program = "/bin/systemctl start redis-server"
    stop program = "/bin/systemctl stop redis-server"
    if failed host localhost port 6379 then restart

# Enable Monit
sudo systemctl enable monit
sudo systemctl start monit
```

---

## 💾 **Backup & Recovery**

### **Database Backup Strategy**

#### **Automated Database Backups**
```bash
# Enhanced backup script
sudo nano /usr/local/bin/mewayz-backup.sh

#!/bin/bash
set -e

# Configuration
DB_NAME="mewayz_production"
DB_USER="mewayz_user"
DB_PASS="secure_password_here"
BACKUP_DIR="/var/backups/mewayz"
APP_DIR="/var/www/mewayz"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# Create backup directory
mkdir -p $BACKUP_DIR/database
mkdir -p $BACKUP_DIR/files

# Database backup
echo "Starting database backup..."
mysqldump -u $DB_USER -p$DB_PASS --single-transaction --routines --triggers $DB_NAME > $BACKUP_DIR/database/db_backup_$DATE.sql

# Application files backup
echo "Starting application files backup..."
tar -czf $BACKUP_DIR/files/app_backup_$DATE.tar.gz -C $APP_DIR .

# Storage backup
echo "Starting storage backup..."
tar -czf $BACKUP_DIR/files/storage_backup_$DATE.tar.gz -C $APP_DIR/backend/storage .

# Compress database backup
gzip $BACKUP_DIR/database/db_backup_$DATE.sql

# Upload to remote storage (optional)
# aws s3 cp $BACKUP_DIR/database/db_backup_$DATE.sql.gz s3://mewayz-backups/database/
# aws s3 cp $BACKUP_DIR/files/app_backup_$DATE.tar.gz s3://mewayz-backups/files/

# Clean old backups
echo "Cleaning old backups..."
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully!"

# Make executable
sudo chmod +x /usr/local/bin/mewayz-backup.sh

# Test backup
sudo /usr/local/bin/mewayz-backup.sh
```

#### **Backup Verification**
```bash
# Create verification script
sudo nano /usr/local/bin/verify-backup.sh

#!/bin/bash
BACKUP_DIR="/var/backups/mewayz"
LATEST_DB_BACKUP=$(ls -t $BACKUP_DIR/database/*.gz | head -1)
LATEST_APP_BACKUP=$(ls -t $BACKUP_DIR/files/app_backup_*.tar.gz | head -1)

echo "Verifying database backup..."
if [ -f "$LATEST_DB_BACKUP" ]; then
    SIZE=$(stat -c%s "$LATEST_DB_BACKUP")
    if [ $SIZE -gt 1000000 ]; then
        echo "Database backup verification: PASSED"
    else
        echo "Database backup verification: FAILED (file too small)"
    fi
else
    echo "Database backup verification: FAILED (file not found)"
fi

echo "Verifying application backup..."
if [ -f "$LATEST_APP_BACKUP" ]; then
    SIZE=$(stat -c%s "$LATEST_APP_BACKUP")
    if [ $SIZE -gt 10000000 ]; then
        echo "Application backup verification: PASSED"
    else
        echo "Application backup verification: FAILED (file too small)"
    fi
else
    echo "Application backup verification: FAILED (file not found)"
fi

sudo chmod +x /usr/local/bin/verify-backup.sh
```

### **Recovery Procedures**

#### **Database Recovery**
```bash
# Stop application
sudo systemctl stop nginx
sudo systemctl stop php8.2-fpm

# Create recovery database
mysql -u root -p
CREATE DATABASE mewayz_recovery;
GRANT ALL PRIVILEGES ON mewayz_recovery.* TO 'mewayz_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Restore database
gunzip -c /var/backups/mewayz/database/db_backup_YYYYMMDD_HHMMSS.sql.gz | mysql -u mewayz_user -p mewayz_recovery

# Update application configuration
sudo nano /var/www/mewayz/backend/.env
# Change DB_DATABASE to mewayz_recovery

# Clear cache
cd /var/www/mewayz/backend
sudo -u www-data php artisan config:clear
sudo -u www-data php artisan cache:clear

# Start application
sudo systemctl start php8.2-fpm
sudo systemctl start nginx
```

#### **Application Recovery**
```bash
# Stop services
sudo systemctl stop nginx
sudo systemctl stop php8.2-fpm

# Backup current application
sudo mv /var/www/mewayz /var/www/mewayz.backup

# Restore application
sudo mkdir -p /var/www/mewayz
sudo tar -xzf /var/backups/mewayz/files/app_backup_YYYYMMDD_HHMMSS.tar.gz -C /var/www/mewayz

# Restore permissions
sudo chown -R www-data:www-data /var/www/mewayz
sudo chmod -R 755 /var/www/mewayz
sudo chmod -R 775 /var/www/mewayz/backend/storage

# Restore configuration
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache

# Start services
sudo systemctl start php8.2-fpm
sudo systemctl start nginx
```

---

## ⚡ **Performance Optimization**

### **Database Performance**

#### **MySQL/MariaDB Optimization**
```ini
# /etc/mysql/mariadb.conf.d/99-mewayz.cnf
[mysqld]
# Memory settings
innodb_buffer_pool_size = 2G
innodb_log_buffer_size = 64M
innodb_log_file_size = 512M
key_buffer_size = 256M
tmp_table_size = 128M
max_heap_table_size = 128M

# Connection settings
max_connections = 300
max_connect_errors = 10000
thread_cache_size = 50
table_open_cache = 4000

# Performance settings
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_file_per_table = 1
innodb_read_io_threads = 4
innodb_write_io_threads = 4

# Query cache (disabled for better performance)
query_cache_type = 0
query_cache_size = 0

# Slow query log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1
log_queries_not_using_indexes = 1
```

#### **Database Indexing**
```sql
-- Performance indexes
CREATE INDEX idx_users_email_status ON users(email, status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_workspaces_owner_status ON workspaces(owner_id, status);
CREATE INDEX idx_workspace_members_composite ON workspace_members(workspace_id, user_id, status);
CREATE INDEX idx_social_media_accounts_workspace_platform ON social_media_accounts(workspace_id, platform);
CREATE INDEX idx_crm_contacts_workspace_score ON crm_contacts(workspace_id, lead_score);
CREATE INDEX idx_crm_contacts_last_contacted ON crm_contacts(last_contacted_at);
```

### **PHP Performance**

#### **PHP-FPM Optimization**
```ini
# /etc/php/8.2/fpm/pool.d/mewayz.conf
[mewayz]
user = www-data
group = www-data
listen = /var/run/php/php8.2-fpm-mewayz.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0666

# Process management
pm = dynamic
pm.max_children = 100
pm.start_servers = 20
pm.min_spare_servers = 10
pm.max_spare_servers = 30
pm.max_requests = 1000

# Performance settings
php_value[memory_limit] = 256M
php_value[max_execution_time] = 300
php_value[max_input_time] = 300
php_value[upload_max_filesize] = 100M
php_value[post_max_size] = 100M
php_value[max_file_uploads] = 20

# OPcache settings
php_value[opcache.enable] = 1
php_value[opcache.memory_consumption] = 128
php_value[opcache.interned_strings_buffer] = 16
php_value[opcache.max_accelerated_files] = 10000
php_value[opcache.validate_timestamps] = 0
php_value[opcache.revalidate_freq] = 0
php_value[opcache.fast_shutdown] = 1
```

#### **Laravel Performance**
```php
// Optimize Laravel configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize

// Queue optimization
php artisan queue:restart
```

### **Web Server Performance**

#### **Nginx Optimization**
```nginx
# /etc/nginx/conf.d/performance.conf
# Worker processes
worker_processes auto;
worker_rlimit_nofile 65535;

# Event handling
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

# HTTP settings
http {
    # Connection handling
    keepalive_timeout 65;
    keepalive_requests 1000;
    
    # File handling
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    
    # Buffers
    client_body_buffer_size 128k;
    client_max_body_size 100M;
    client_header_buffer_size 4k;
    large_client_header_buffers 4 32k;
    
    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1000;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/rss+xml
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/svg+xml
        image/x-icon
        text/css
        text/javascript
        text/plain
        text/x-component;
    
    # Cache
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

### **Redis Performance**

#### **Redis Configuration**
```ini
# /etc/redis/redis.conf
# Memory management
maxmemory 512mb
maxmemory-policy allkeys-lru

# Performance
tcp-keepalive 60
timeout 0
save 900 1
save 300 10
save 60 10000

# Networking
bind 127.0.0.1
port 6379
tcp-backlog 511

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log
```

---

## 🔒 **Security Hardening**

### **Server Security**

#### **Firewall Configuration**
```bash
# Install UFW
sudo apt install -y ufw

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow specific IPs for admin access
sudo ufw allow from YOUR_ADMIN_IP to any port 22

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status verbose
```

#### **SSH Hardening**
```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Disable root login
PermitRootLogin no

# Change default port
Port 2222

# Disable password authentication (use keys)
PasswordAuthentication no
PubkeyAuthentication yes

# Limit login attempts
MaxAuthTries 3
MaxStartups 10:30:60

# Disable X11 forwarding
X11Forwarding no

# Enable logging
LogLevel INFO

# Restart SSH
sudo systemctl restart sshd
```

#### **Fail2Ban Configuration**
```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure Fail2Ban
sudo nano /etc/fail2ban/jail.local

[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = 2222
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log

# Start Fail2Ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### **Application Security**

#### **PHP Security**
```ini
# /etc/php/8.2/fpm/conf.d/99-security.ini
# Disable dangerous functions
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source

# Hide PHP version
expose_php = Off

# Session security
session.cookie_httponly = On
session.cookie_secure = On
session.use_strict_mode = On
session.cookie_samesite = Strict

# File upload security
file_uploads = On
upload_max_filesize = 100M
max_file_uploads = 20

# Information disclosure
display_errors = Off
display_startup_errors = Off
log_errors = On
error_reporting = E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED
```

#### **Application Security Headers**
```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self' https:; frame-src https://js.stripe.com;" always;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### **Database Security**

#### **Database Hardening**
```sql
-- Remove default accounts
DELETE FROM mysql.user WHERE User='';
DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');

-- Remove test database
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test_%';

-- Secure configuration
UPDATE mysql.user SET authentication_string=PASSWORD('new_root_password') WHERE User='root';
FLUSH PRIVILEGES;
```

#### **Database Access Control**
```sql
-- Create application-specific user
CREATE USER 'mewayz_app'@'localhost' IDENTIFIED BY 'secure_app_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON mewayz_production.* TO 'mewayz_app'@'localhost';

-- Create read-only user for backups
CREATE USER 'mewayz_backup'@'localhost' IDENTIFIED BY 'secure_backup_password';
GRANT SELECT, LOCK TABLES ON mewayz_production.* TO 'mewayz_backup'@'localhost';

FLUSH PRIVILEGES;
```

---

## 📈 **Post-Deployment Verification**

### **Health Check Scripts**

#### **Application Health Check**
```bash
#!/bin/bash
# /usr/local/bin/health-check.sh

echo "=== Mewayz Health Check ==="
DATE=$(date '+%Y-%m-%d %H:%M:%S')
echo "Check time: $DATE"

# Check web server
echo "Checking web server..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost | grep -q "200"; then
    echo "✓ Web server is running"
else
    echo "✗ Web server is not responding"
    exit 1
fi

# Check HTTPS
echo "Checking HTTPS..."
if curl -s -o /dev/null -w "%{http_code}" https://mewayz.com | grep -q "200"; then
    echo "✓ HTTPS is working"
else
    echo "✗ HTTPS is not working"
    exit 1
fi

# Check database
echo "Checking database..."
if mysql -u mewayz_user -p'secure_password_here' -e "SELECT 1" mewayz_production >/dev/null 2>&1; then
    echo "✓ Database is accessible"
else
    echo "✗ Database is not accessible"
    exit 1
fi

# Check Redis
echo "Checking Redis..."
if redis-cli ping | grep -q "PONG"; then
    echo "✓ Redis is responding"
else
    echo "✗ Redis is not responding"
    exit 1
fi

# Check queue workers
echo "Checking queue workers..."
if supervisorctl status mewayz-worker | grep -q "RUNNING"; then
    echo "✓ Queue workers are running"
else
    echo "✗ Queue workers are not running"
    exit 1
fi

echo "=== Health Check Complete ==="
```

#### **API Health Check**
```bash
#!/bin/bash
# /usr/local/bin/api-health-check.sh

BASE_URL="https://mewayz.com/api"

# Test API endpoints
echo "Testing API endpoints..."

# Health endpoint
if curl -s "$BASE_URL/health" | grep -q "success"; then
    echo "✓ Health endpoint is working"
else
    echo "✗ Health endpoint is not working"
fi

# Auth endpoint
if curl -s -X POST "$BASE_URL/auth/login" -H "Content-Type: application/json" -d '{}' | grep -q "error"; then
    echo "✓ Auth endpoint is responding"
else
    echo "✗ Auth endpoint is not responding"
fi

echo "API health check complete"
```

### **Performance Verification**

#### **Load Testing**
```bash
# Install Apache Bench
sudo apt install -y apache2-utils

# Basic load test
ab -n 1000 -c 10 https://mewayz.com/

# API load test
ab -n 500 -c 5 -H "Content-Type: application/json" https://mewayz.com/api/health

# Database connection test
ab -n 100 -c 5 https://mewayz.com/api/auth/login
```

#### **SSL Certificate Verification**
```bash
# Check SSL certificate
openssl s_client -connect mewayz.com:443 -servername mewayz.com

# Check certificate expiry
echo | openssl s_client -connect mewayz.com:443 -servername mewayz.com 2>/dev/null | openssl x509 -noout -dates

# Online SSL test
curl -I https://mewayz.com
```

---

## 🎯 **Deployment Checklist**

### **Pre-Deployment Checklist**

#### **Server Preparation**
- [ ] Server provisioned with required specifications
- [ ] Operating system updated and secured
- [ ] Required software installed (Nginx, PHP, MariaDB, Redis, Node.js)
- [ ] Firewall configured and enabled
- [ ] SSH hardened and secured
- [ ] SSL certificates obtained and configured
- [ ] Monitoring tools installed and configured

#### **Application Preparation**
- [ ] Code repository cloned and configured
- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] Application dependencies installed
- [ ] Frontend built and optimized
- [ ] File permissions set correctly
- [ ] Cron jobs configured
- [ ] Queue workers configured

#### **Security Preparation**
- [ ] Security headers configured
- [ ] Fail2Ban installed and configured
- [ ] Database secured
- [ ] PHP security settings configured
- [ ] Application security measures implemented
- [ ] Backup procedures tested

### **Deployment Steps**

#### **1. Final Preparation**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Restart services
sudo systemctl restart nginx
sudo systemctl restart php8.2-fpm
sudo systemctl restart mariadb
sudo systemctl restart redis-server
```

#### **2. Application Deployment**
```bash
# Deploy application
cd /var/www/mewayz
sudo -u www-data git pull origin main
sudo -u www-data composer install --no-dev --optimize-autoloader
sudo -u www-data yarn install --frozen-lockfile
sudo -u www-data yarn build
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache
sudo -u www-data php artisan queue:restart
```

#### **3. Post-Deployment Verification**
```bash
# Run health checks
/usr/local/bin/health-check.sh
/usr/local/bin/api-health-check.sh

# Test application
curl -I https://mewayz.com
curl -s https://mewayz.com/api/health

# Check logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/www/mewayz/backend/storage/logs/laravel.log
```

### **Post-Deployment Checklist**

#### **Functionality Testing**
- [ ] Landing page loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard loads after login
- [ ] API endpoints respond correctly
- [ ] Database connections work
- [ ] Queue jobs process correctly
- [ ] Email sending works
- [ ] File uploads work
- [ ] Social media integrations work

#### **Performance Testing**
- [ ] Page load times under 3 seconds
- [ ] API response times under 200ms
- [ ] Database queries optimized
- [ ] Caching working correctly
- [ ] CDN functioning properly
- [ ] Mobile responsiveness verified

#### **Security Testing**
- [ ] SSL certificate valid and working
- [ ] Security headers present
- [ ] Firewall rules effective
- [ ] Database access restricted
- [ ] File permissions secure
- [ ] No sensitive information exposed

#### **Monitoring Setup**
- [ ] System monitoring active
- [ ] Application monitoring configured
- [ ] Log rotation working
- [ ] Backup procedures tested
- [ ] Alert systems functional
- [ ] Performance metrics collected

---

## 📞 **Support & Maintenance**

### **Ongoing Maintenance**

#### **Regular Tasks**
- **Daily**: Check system health and logs
- **Weekly**: Update system packages and security patches
- **Monthly**: Review performance metrics and optimize
- **Quarterly**: Update application dependencies and conduct security audit

#### **Monitoring Commands**
```bash
# System health
sudo systemctl status nginx php8.2-fpm mariadb redis-server

# Resource usage
htop
df -h
free -h

# Application logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/www/mewayz/backend/storage/logs/laravel.log

# Queue monitoring
sudo supervisorctl status mewayz-worker
```

### **Troubleshooting**

#### **Common Issues**
- **502 Bad Gateway**: Check PHP-FPM status and logs
- **Database Connection**: Verify database credentials and service status
- **High Memory Usage**: Check for memory leaks and optimize queries
- **Slow Response**: Analyze database queries and enable caching

#### **Emergency Procedures**
- **Service Restart**: `sudo systemctl restart nginx php8.2-fpm`
- **Database Recovery**: Restore from latest backup
- **Application Rollback**: Restore previous version from backup
- **Emergency Contact**: alert@mewayz.com

---

**© 2025 Mewayz Technologies Inc. All rights reserved.**

*This deployment guide is regularly updated. For the latest version, visit the repository documentation.*

---

*Need deployment assistance? Contact our DevOps team at devops@mewayz.com*