# 🚀 Mewayz Deployment Guide

![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Laravel](https://img.shields.io/badge/Laravel-12-red)
![React](https://img.shields.io/badge/React-18-blue)

Complete deployment guide for the Mewayz business management platform.

## 📋 **Table of Contents**

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Server Setup](#server-setup)
- [Application Deployment](#application-deployment)
- [Database Setup](#database-setup)
- [Web Server Configuration](#web-server-configuration)
- [SSL Certificate Setup](#ssl-certificate-setup)
- [Environment Configuration](#environment-configuration)
- [Production Optimization](#production-optimization)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

## 🔍 **Overview**

### **Deployment Architecture**
```
Internet → CDN → Load Balancer → Web Server → PHP-FPM → Laravel App
                                    ↓
                              Static Files (React Build)
                                    ↓
                            MySQL Database + Redis Cache
```

### **Production Requirements**
- **Server**: Linux (Ubuntu 22.04 LTS recommended)
- **Web Server**: Nginx 1.18+ or Apache 2.4+
- **PHP**: 8.2 or higher
- **Database**: MySQL 8.0+ or PostgreSQL 13+
- **Node.js**: 18.0+ (for build process)
- **SSL Certificate**: Required for HTTPS
- **Domain**: Configured domain name

## 🛠️ **Prerequisites**

### **System Requirements**
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB minimum, 50GB recommended
- **CPU**: 2 cores minimum, 4 cores recommended
- **Network**: Stable internet connection
- **Backup**: Regular backup solution

### **Required Software**
- **Operating System**: Ubuntu 22.04 LTS
- **PHP**: 8.2 with extensions
- **Composer**: 2.0+
- **Node.js**: 18.0+
- **Yarn**: 1.22+
- **MySQL**: 8.0+
- **Redis**: 6.0+ (optional, for caching)
- **Nginx**: 1.18+
- **Certbot**: For SSL certificates

## 🖥️ **Server Setup**

### **1. Update System**
```bash
sudo apt update && sudo apt upgrade -y
```

### **2. Install Required Packages**
```bash
# Install basic packages
sudo apt install -y curl wget git unzip software-properties-common

# Add PHP repository
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update

# Install PHP and extensions
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-xml php8.2-curl \
php8.2-zip php8.2-mbstring php8.2-tokenizer php8.2-bcmath php8.2-json \
php8.2-gd php8.2-redis php8.2-intl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js and Yarn
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
npm install -g yarn

# Install MySQL
sudo apt install -y mysql-server mysql-client

# Install Redis (optional)
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### **3. Configure MySQL**
```bash
# Secure MySQL installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p
```

```sql
-- Create database
CREATE DATABASE mewayz_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER 'mewayz_user'@'localhost' IDENTIFIED BY 'secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON mewayz_production.* TO 'mewayz_user'@'localhost';
FLUSH PRIVILEGES;

-- Exit MySQL
EXIT;
```

### **4. Configure PHP**
```bash
# Edit PHP configuration
sudo nano /etc/php/8.2/fpm/php.ini
```

Update the following settings:
```ini
max_execution_time = 300
max_input_vars = 3000
memory_limit = 256M
post_max_size = 64M
upload_max_filesize = 64M
max_file_uploads = 20
```

### **5. Create Application User**
```bash
# Create user for application
sudo adduser --disabled-password --gecos "" mewayz

# Add user to www-data group
sudo usermod -a -G www-data mewayz
```

## 📦 **Application Deployment**

### **1. Clone Repository**
```bash
# Switch to application user
sudo su - mewayz

# Clone repository
git clone <repository-url> /home/mewayz/app
cd /home/mewayz/app

# Set proper permissions
sudo chown -R mewayz:www-data /home/mewayz/app
sudo chmod -R 755 /home/mewayz/app
```

### **2. Install Dependencies**
```bash
# Install PHP dependencies
cd /home/mewayz/app/backend
composer install --no-dev --optimize-autoloader

# Install Node.js dependencies
cd /home/mewayz/app
yarn install --production
```

### **3. Configure Environment**
```bash
# Copy environment file
cd /home/mewayz/app/backend
cp .env.example .env

# Edit environment file
nano .env
```

### **4. Generate Application Key**
```bash
cd /home/mewayz/app/backend
php artisan key:generate
```

### **5. Set Permissions**
```bash
# Set storage permissions
sudo chmod -R 775 /home/mewayz/app/backend/storage
sudo chmod -R 775 /home/mewayz/app/backend/bootstrap/cache

# Set ownership
sudo chown -R mewayz:www-data /home/mewayz/app/backend/storage
sudo chown -R mewayz:www-data /home/mewayz/app/backend/bootstrap/cache
```

## 🗄️ **Database Setup**

### **1. Run Migrations**
```bash
cd /home/mewayz/app/backend
php artisan migrate --force
```

### **2. Seed Database (Optional)**
```bash
# Only for development/testing
php artisan db:seed --force
```

### **3. Create Database Indexes**
```bash
# Optimize database
php artisan db:optimize
```

## 🔧 **Web Server Configuration**

### **1. Build Frontend Assets**
```bash
cd /home/mewayz/app
yarn build
```

### **2. Configure Nginx**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/mewayz
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /home/mewayz/app/backend/public;
    index index.php index.html index.htm;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Handle React routing
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Handle API routes
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # PHP handling
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # Static files caching
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Deny access to sensitive files
    location ~ /\.(?!well-known).* {
        deny all;
    }

    # Laravel specific
    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }
}
```

### **3. Enable Site**
```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/mewayz /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### **4. Configure PHP-FPM**
```bash
# Edit PHP-FPM pool configuration
sudo nano /etc/php/8.2/fpm/pool.d/www.conf
```

Update the following settings:
```ini
user = mewayz
group = www-data
listen.owner = mewayz
listen.group = www-data
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
```

```bash
# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

## 🔒 **SSL Certificate Setup**

### **1. Install SSL Certificate**
```bash
# Install certificate with Certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

### **2. Configure SSL in Nginx**
The SSL configuration is automatically added by Certbot, but you can verify:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    
    # ... rest of configuration
}
```

## ⚙️ **Environment Configuration**

### **1. Production Environment File**
```bash
# Edit .env file
nano /home/mewayz/app/backend/.env
```

```env
APP_NAME=Mewayz
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_KEY_HERE
APP_DEBUG=false
APP_URL=https://yourdomain.com

LOG_CHANNEL=stack
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mewayz_production
DB_USERNAME=mewayz_user
DB_PASSWORD=secure_password_here

BROADCAST_DRIVER=log
CACHE_DRIVER=redis
FILESYSTEM_DRIVER=local
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis
SESSION_LIFETIME=120

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=your-mail-server
MAIL_PORT=587
MAIL_USERNAME=your-email@yourdomain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Mewayz"

# API Keys
STRIPE_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# ElasticMail
ELASTICMAIL_API_KEY=your_elasticmail_api_key
ELASTICMAIL_FROM_EMAIL=noreply@yourdomain.com
ELASTICMAIL_FROM_NAME="Mewayz"
```

### **2. React Environment Configuration**
```bash
# Create production .env file
nano /home/mewayz/app/.env.production
```

```env
REACT_APP_BACKEND_URL=https://yourdomain.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_public_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## 🚀 **Production Optimization**

### **1. Laravel Optimization**
```bash
cd /home/mewayz/app/backend

# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize

# Clear and cache everything
php artisan optimize
```

### **2. Frontend Optimization**
```bash
cd /home/mewayz/app

# Build optimized production assets
yarn build

# Verify build
ls -la build/
```

### **3. Database Optimization**
```bash
# Optimize database
php artisan db:optimize

# Add indexes for performance
php artisan db:show --counts
```

### **4. Configure Redis**
```bash
# Edit Redis configuration
sudo nano /etc/redis/redis.conf
```

```conf
# Security
requirepass your_redis_password

# Memory optimization
maxmemory 128mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000
```

```bash
# Restart Redis
sudo systemctl restart redis
```

## 🔄 **Process Management**

### **1. Configure Supervisor**
```bash
# Install Supervisor
sudo apt install -y supervisor

# Create queue worker configuration
sudo nano /etc/supervisor/conf.d/mewayz-worker.conf
```

```ini
[program:mewayz-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /home/mewayz/app/backend/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=mewayz
numprocs=2
redirect_stderr=true
stdout_logfile=/home/mewayz/app/backend/storage/logs/worker.log
```

```bash
# Update supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start mewayz-worker:*
```

### **2. Configure Cron Jobs**
```bash
# Edit crontab
sudo -u mewayz crontab -e
```

```cron
# Laravel scheduler
* * * * * cd /home/mewayz/app/backend && php artisan schedule:run >> /dev/null 2>&1

# SSL certificate renewal
0 3 * * * /usr/bin/certbot renew --quiet
```

## 📊 **Monitoring & Maintenance**

### **1. Log Monitoring**
```bash
# Laravel logs
tail -f /home/mewayz/app/backend/storage/logs/laravel.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# PHP-FPM logs
tail -f /var/log/php8.2-fpm.log
```

### **2. Performance Monitoring**
```bash
# Check system resources
htop
df -h
free -h

# Check database performance
mysql -u mewayz_user -p -e "SHOW PROCESSLIST;"

# Check Redis
redis-cli info memory
```

### **3. Backup Strategy**
```bash
# Create backup script
sudo nano /home/mewayz/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/mewayz/backups"
APP_DIR="/home/mewayz/app"
DB_NAME="mewayz_production"
DB_USER="mewayz_user"
DB_PASSWORD="secure_password_here"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz -C $APP_DIR .

# Backup uploads (if any)
tar -czf $BACKUP_DIR/storage_$DATE.tar.gz -C $APP_DIR/backend/storage .

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# Make script executable
chmod +x /home/mewayz/backup.sh

# Add to cron
sudo -u mewayz crontab -e
```

```cron
# Daily backup at 2 AM
0 2 * * * /home/mewayz/backup.sh
```

### **4. Security Monitoring**
```bash
# Check for failed login attempts
sudo tail -f /var/log/auth.log | grep "Failed password"

# Monitor file changes
sudo apt install -y aide
sudo aide --init
sudo mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db
```

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Permission Issues**
```bash
# Fix permissions
sudo chown -R mewayz:www-data /home/mewayz/app
sudo chmod -R 755 /home/mewayz/app
sudo chmod -R 775 /home/mewayz/app/backend/storage
sudo chmod -R 775 /home/mewayz/app/backend/bootstrap/cache
```

#### **2. PHP-FPM Issues**
```bash
# Check PHP-FPM status
sudo systemctl status php8.2-fpm

# Check PHP-FPM logs
sudo tail -f /var/log/php8.2-fpm.log

# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

#### **3. Database Connection Issues**
```bash
# Test database connection
mysql -u mewayz_user -p -e "SELECT 1;"

# Check Laravel database connection
cd /home/mewayz/app/backend
php artisan tinker
# In tinker: DB::connection()->getPdo();
```

#### **4. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### **Performance Issues**

#### **1. Slow Database Queries**
```bash
# Enable slow query log
sudo mysql -u root -p
```

```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
```

#### **2. High Memory Usage**
```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Optimize PHP memory
sudo nano /etc/php/8.2/fpm/php.ini
# memory_limit = 256M
```

#### **3. High CPU Usage**
```bash
# Check CPU usage
top
htop

# Check PHP processes
ps aux | grep php
```

### **Deployment Checklist**

#### **Pre-Deployment**
- [ ] Server requirements met
- [ ] SSL certificate configured
- [ ] Database created and configured
- [ ] Environment variables set
- [ ] DNS configured

#### **During Deployment**
- [ ] Application cloned
- [ ] Dependencies installed
- [ ] Database migrated
- [ ] Assets built
- [ ] Permissions set
- [ ] Services configured

#### **Post-Deployment**
- [ ] Application accessible
- [ ] SSL working
- [ ] Database connections working
- [ ] API endpoints responding
- [ ] Cron jobs configured
- [ ] Monitoring setup
- [ ] Backups configured

## 🎯 **Production URLs**

### **Application URLs**
- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Admin**: https://yourdomain.com/admin

### **Monitoring URLs**
- **System Status**: https://yourdomain.com/status
- **Health Check**: https://yourdomain.com/api/health

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Status**: Production Ready

For additional support, see the [Developer Guide](UPDATED_DEVELOPER_GUIDE.md) or contact the development team.