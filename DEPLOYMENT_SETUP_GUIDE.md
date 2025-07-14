# 🚀 Deployment & Setup Guide - Mewayz

## Overview

This guide covers the complete deployment and setup process for the Mewayz Enterprise Business Suite, including development, staging, and production environments.

## 📋 Prerequisites

### System Requirements
- **Operating System**: Linux (Ubuntu 20.04+ recommended)
- **Node.js**: v18.0 or higher
- **PHP**: 8.2 or higher
- **Database**: MariaDB 10.11 or MySQL 8.0+
- **Web Server**: Nginx (recommended) or Apache
- **Process Manager**: Supervisor
- **SSL Certificate**: Let's Encrypt or commercial SSL

### Development Tools
- **Git**: Version control
- **Composer**: PHP dependency manager
- **Yarn**: Node.js package manager
- **Docker**: Containerization (optional)

---

## 🛠️ Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/mewayz.git
cd mewayz
```

### 2. Backend Setup (Laravel)
```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database in .env file
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mewayz_local
DB_USERNAME=mewayz
DB_PASSWORD=password

# Run database migrations
php artisan migrate

# Seed initial data (optional)
php artisan db:seed

# Start Laravel development server
php artisan serve --host=0.0.0.0 --port=8001
```

### 3. Frontend Setup (React)
```bash
# Navigate to root directory
cd ../

# Install Node.js dependencies
yarn install

# Configure environment variables
echo "REACT_APP_BACKEND_URL=http://localhost:8001/api" > .env

# Start React development server
yarn start
```

### 4. Database Setup
```bash
# Install MariaDB
sudo apt update
sudo apt install mariadb-server

# Secure MariaDB installation
sudo mysql_secure_installation

# Create database and user
sudo mysql -u root -p

CREATE DATABASE mewayz_local;
CREATE USER 'mewayz'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON mewayz_local.* TO 'mewayz'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 5. Development Tools Setup
```bash
# Install Supervisor
sudo apt install supervisor

# Create supervisor configuration
sudo tee /etc/supervisor/conf.d/mewayz.conf > /dev/null <<EOF
[program:mewayz-backend]
command=php artisan serve --host=0.0.0.0 --port=8001
directory=/path/to/mewayz/backend
autostart=true
autorestart=true
user=www-data
stdout_logfile=/var/log/mewayz-backend.log
redirect_stderr=true

[program:mewayz-frontend]
command=yarn start
directory=/path/to/mewayz
autostart=true
autorestart=true
user=www-data
stdout_logfile=/var/log/mewayz-frontend.log
redirect_stderr=true
EOF

# Start supervisor services
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

---

## 🌐 Production Deployment

### 1. Server Preparation
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y \
    nginx \
    php8.2-fpm \
    php8.2-cli \
    php8.2-mysql \
    php8.2-xml \
    php8.2-curl \
    php8.2-mbstring \
    php8.2-zip \
    php8.2-gd \
    php8.2-bcmath \
    mariadb-server \
    nodejs \
    npm \
    supervisor \
    certbot \
    python3-certbot-nginx

# Install Yarn
npm install -g yarn

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer
```

### 2. Database Configuration
```bash
# Secure MariaDB
sudo mysql_secure_installation

# Create production database
sudo mysql -u root -p

CREATE DATABASE mewayz_production;
CREATE USER 'mewayz_prod'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT ALL PRIVILEGES ON mewayz_production.* TO 'mewayz_prod'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Application Deployment
```bash
# Create application directory
sudo mkdir -p /var/www/mewayz
sudo chown -R www-data:www-data /var/www/mewayz

# Clone repository
cd /var/www/mewayz
sudo -u www-data git clone https://github.com/your-org/mewayz.git .

# Backend deployment
cd backend
sudo -u www-data composer install --no-dev --optimize-autoloader

# Copy and configure environment
sudo -u www-data cp .env.example .env

# Configure production environment
sudo -u www-data nano .env
```

### 4. Production Environment Configuration
```bash
# Backend .env configuration
APP_NAME=Mewayz
APP_ENV=production
APP_KEY=base64:generated_key_here
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database configuration
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mewayz_production
DB_USERNAME=mewayz_prod
DB_PASSWORD=secure_password_here

# Cache configuration
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis configuration
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail configuration
MAIL_MAILER=smtp
MAIL_HOST=smtp.elasticemail.com
MAIL_PORT=2525
MAIL_USERNAME=your-email@yourdomain.com
MAIL_PASSWORD=your_elasticmail_api_key
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="Mewayz"

# ElasticMail API
ELASTICMAIL_API_KEY=your_elasticmail_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
```

### 5. Laravel Optimization
```bash
# Generate application key
sudo -u www-data php artisan key:generate

# Cache configuration
sudo -u www-data php artisan config:cache

# Cache routes
sudo -u www-data php artisan route:cache

# Cache views
sudo -u www-data php artisan view:cache

# Run migrations
sudo -u www-data php artisan migrate --force

# Link storage
sudo -u www-data php artisan storage:link
```

### 6. Frontend Build
```bash
# Navigate to frontend directory
cd /var/www/mewayz

# Install dependencies
sudo -u www-data yarn install

# Create frontend environment
sudo -u www-data tee .env > /dev/null <<EOF
REACT_APP_BACKEND_URL=https://your-domain.com/api
REACT_APP_FRONTEND_URL=https://your-domain.com
EOF

# Build production assets
sudo -u www-data yarn build
```

---

## 🔧 Nginx Configuration

### 1. Main Nginx Configuration
```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/mewayz > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    root /var/www/mewayz/build;
    index index.html;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Frontend Routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # API Routes
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }

    # Health Check
    location /health {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Static Assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Security
    location ~ /\. {
        deny all;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/mewayz /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 2. SSL Certificate Setup
```bash
# Generate SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal cron job
sudo crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🔄 Process Management

### 1. Supervisor Configuration
```bash
# Create supervisor configuration
sudo tee /etc/supervisor/conf.d/mewayz.conf > /dev/null <<EOF
[program:mewayz-backend]
command=php artisan serve --host=127.0.0.1 --port=8001
directory=/var/www/mewayz/backend
autostart=true
autorestart=true
user=www-data
numprocs=1
stdout_logfile=/var/log/mewayz-backend.log
stderr_logfile=/var/log/mewayz-backend-error.log
redirect_stderr=false

[program:mewayz-queue]
command=php artisan queue:work --sleep=3 --tries=3 --timeout=60
directory=/var/www/mewayz/backend
autostart=true
autorestart=true
user=www-data
numprocs=1
stdout_logfile=/var/log/mewayz-queue.log
stderr_logfile=/var/log/mewayz-queue-error.log
redirect_stderr=false

[program:mewayz-schedule]
command=php artisan schedule:work
directory=/var/www/mewayz/backend
autostart=true
autorestart=true
user=www-data
numprocs=1
stdout_logfile=/var/log/mewayz-schedule.log
stderr_logfile=/var/log/mewayz-schedule-error.log
redirect_stderr=false
EOF

# Update supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start all
```

### 2. Systemd Service (Alternative)
```bash
# Create systemd service
sudo tee /etc/systemd/system/mewayz-backend.service > /dev/null <<EOF
[Unit]
Description=Mewayz Backend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/mewayz/backend
ExecStart=/usr/bin/php artisan serve --host=127.0.0.1 --port=8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable mewayz-backend
sudo systemctl start mewayz-backend
```

---

## 📊 Monitoring & Logging

### 1. Log Configuration
```bash
# Create log directories
sudo mkdir -p /var/log/mewayz
sudo chown -R www-data:www-data /var/log/mewayz

# Configure logrotate
sudo tee /etc/logrotate.d/mewayz > /dev/null <<EOF
/var/log/mewayz/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 www-data www-data
}
EOF
```

### 2. Health Check Endpoint
```bash
# Test health endpoint
curl -I https://your-domain.com/health

# Expected response:
HTTP/2 200 
content-type: application/json
```

### 3. Performance Monitoring
```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Monitor system resources
htop

# Monitor Laravel logs
tail -f /var/www/mewayz/backend/storage/logs/laravel.log

# Monitor Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🔐 Security Configuration

### 1. Firewall Setup
```bash
# Configure UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Check status
sudo ufw status
```

### 2. Security Headers
```bash
# Add security headers to Nginx (already included in config above)
# - X-Frame-Options
# - X-Content-Type-Options
# - X-XSS-Protection
# - Referrer-Policy
# - Content-Security-Policy
```

### 3. File Permissions
```bash
# Set proper permissions
sudo chown -R www-data:www-data /var/www/mewayz
sudo chmod -R 755 /var/www/mewayz
sudo chmod -R 775 /var/www/mewayz/backend/storage
sudo chmod -R 775 /var/www/mewayz/backend/bootstrap/cache
```

---

## 🔄 Backup Strategy

### 1. Database Backup
```bash
# Create backup script
sudo tee /usr/local/bin/backup-mewayz.sh > /dev/null <<'EOF'
#!/bin/bash

# Configuration
DB_NAME="mewayz_production"
DB_USER="mewayz_prod"
DB_PASSWORD="secure_password_here"
BACKUP_DIR="/var/backups/mewayz"
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create database backup
mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > $BACKUP_DIR/database_$(date +%Y%m%d_%H%M%S).sql

# Compress backup
gzip $BACKUP_DIR/database_$(date +%Y%m%d_%H%M%S).sql

# Remove old backups
find $BACKUP_DIR -name "database_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Create application backup
tar -czf $BACKUP_DIR/application_$(date +%Y%m%d_%H%M%S).tar.gz -C /var/www mewayz

# Remove old application backups
find $BACKUP_DIR -name "application_*.tar.gz" -mtime +$RETENTION_DAYS -delete
EOF

# Make executable
sudo chmod +x /usr/local/bin/backup-mewayz.sh

# Schedule backup
sudo crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup-mewayz.sh
```

### 2. File Backup
```bash
# Backup important files
sudo rsync -avz --delete /var/www/mewayz/ /backup/location/mewayz/
```

---

## 🚀 CI/CD Pipeline

### 1. GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.2'
    
    - name: Install dependencies
      run: |
        yarn install
        cd backend && composer install --no-dev --optimize-autoloader
    
    - name: Build frontend
      run: yarn build
    
    - name: Deploy to server
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.HOST }}
        username: ${{ secrets.USERNAME }}
        key: ${{ secrets.PRIVATE_KEY }}
        script: |
          cd /var/www/mewayz
          git pull origin main
          cd backend
          composer install --no-dev --optimize-autoloader
          php artisan migrate --force
          php artisan config:cache
          php artisan route:cache
          php artisan view:cache
          cd ..
          yarn install
          yarn build
          sudo supervisorctl restart mewayz-backend
```

### 2. Deployment Script
```bash
# Create deployment script
sudo tee /usr/local/bin/deploy-mewayz.sh > /dev/null <<'EOF'
#!/bin/bash

# Configuration
APP_DIR="/var/www/mewayz"
BACKUP_DIR="/var/backups/mewayz"

# Create backup before deployment
/usr/local/bin/backup-mewayz.sh

# Navigate to application directory
cd $APP_DIR

# Pull latest code
sudo -u www-data git pull origin main

# Backend deployment
cd backend
sudo -u www-data composer install --no-dev --optimize-autoloader
sudo -u www-data php artisan migrate --force
sudo -u www-data php artisan config:cache
sudo -u www-data php artisan route:cache
sudo -u www-data php artisan view:cache

# Frontend deployment
cd ..
sudo -u www-data yarn install
sudo -u www-data yarn build

# Restart services
sudo supervisorctl restart mewayz-backend
sudo supervisorctl restart mewayz-queue

# Clear application cache
cd backend
sudo -u www-data php artisan cache:clear
sudo -u www-data php artisan config:cache

echo "Deployment completed successfully!"
EOF

# Make executable
sudo chmod +x /usr/local/bin/deploy-mewayz.sh
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Check database status
sudo systemctl status mariadb

# Check credentials
mysql -u mewayz_prod -p mewayz_production

# Check Laravel database connection
cd /var/www/mewayz/backend
php artisan tinker
DB::connection()->getPdo();
```

**2. Permission Issues**
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/mewayz
sudo chmod -R 755 /var/www/mewayz
sudo chmod -R 775 /var/www/mewayz/backend/storage
sudo chmod -R 775 /var/www/mewayz/backend/bootstrap/cache
```

**3. Frontend Build Issues**
```bash
# Clear Node.js cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules yarn.lock
yarn install

# Check build logs
yarn build --verbose
```

**4. SSL Certificate Issues**
```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew

# Test SSL configuration
openssl s_client -connect your-domain.com:443
```

**5. Performance Issues**
```bash
# Monitor system resources
htop
iotop
nethogs

# Check Laravel performance
cd /var/www/mewayz/backend
php artisan route:cache
php artisan config:cache
php artisan view:cache
```

### Log Locations
- **Application Logs**: `/var/www/mewayz/backend/storage/logs/laravel.log`
- **Nginx Logs**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **Supervisor Logs**: `/var/log/supervisor/`
- **System Logs**: `/var/log/syslog`

---

## 📈 Performance Optimization

### 1. Database Optimization
```sql
-- Add indexes for frequently queried columns
ALTER TABLE social_media_posts ADD INDEX idx_workspace_status (workspace_id, status);
ALTER TABLE crm_contacts ADD INDEX idx_workspace_status (workspace_id, status);

-- Optimize table
OPTIMIZE TABLE social_media_posts;
OPTIMIZE TABLE crm_contacts;
```

### 2. PHP-FPM Configuration
```bash
# Edit PHP-FPM pool configuration
sudo nano /etc/php/8.2/fpm/pool.d/www.conf

# Recommended settings:
pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 500

# Restart PHP-FPM
sudo systemctl restart php8.2-fpm
```

### 3. Redis Configuration
```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Set memory limit
maxmemory 256mb
maxmemory-policy allkeys-lru

# Restart Redis
sudo systemctl restart redis-server
```

### 4. Nginx Optimization
```bash
# Edit Nginx configuration
sudo nano /etc/nginx/nginx.conf

# Add these settings:
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 100M;

# Enable caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;
```

---

## 🔍 Maintenance Tasks

### Daily Tasks
```bash
# Check system health
sudo systemctl status nginx
sudo systemctl status mariadb
sudo systemctl status php8.2-fpm
sudo supervisorctl status

# Monitor logs
tail -f /var/log/nginx/error.log
tail -f /var/www/mewayz/backend/storage/logs/laravel.log
```

### Weekly Tasks
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up logs
sudo journalctl --vacuum-time=1week

# Check disk usage
df -h
du -sh /var/www/mewayz
du -sh /var/backups/mewayz
```

### Monthly Tasks
```bash
# Review security updates
sudo apt list --upgradable

# Check SSL certificate expiry
sudo certbot certificates

# Review backup integrity
ls -la /var/backups/mewayz/

# Database optimization
mysql -u mewayz_prod -p mewayz_production -e "OPTIMIZE TABLE social_media_posts, crm_contacts, users;"
```

---

## 📞 Support

### Getting Help
1. Check application logs first
2. Review this deployment guide
3. Test individual components
4. Check system resource usage
5. Contact technical support with:
   - Error messages
   - System information
   - Steps to reproduce
   - Log files

### Useful Commands
```bash
# Check service status
sudo systemctl status mewayz-backend

# Restart services
sudo supervisorctl restart all

# Check logs
sudo tail -f /var/log/supervisor/mewayz-backend.log

# Test database connection
php artisan tinker
DB::connection()->getPdo();

# Clear caches
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

**Last updated: January 2025**
**Deployment Guide Version: 1.0.0**