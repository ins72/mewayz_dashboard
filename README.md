# 🚀 **Mewayz - Complete Enterprise Business Suite**

**Version**: 1.0.0  
**Company**: Mewayz Technologies Inc.  
**Domain**: mewayz.com  
**Status**: Production Ready ✅

---

## 🏢 **Platform Overview**

Mewayz is a comprehensive **enterprise business suite** that consolidates essential business operations into a single, powerful platform. Built with modern technology and designed for scalability, Mewayz empowers businesses to manage social media, CRM, e-commerce, email marketing, and more from one centralized dashboard.

### **🎯 Key Features**
- **Social Media Management**: Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube
- **CRM & Sales Pipeline**: Lead management, contact tracking, sales analytics
- **E-commerce Suite**: Product management, inventory tracking, order processing
- **Link-in-Bio Builder**: Custom landing pages with analytics
- **Email Marketing**: Campaign builder with templates and automation
- **Course Management**: Educational content creation and delivery
- **Team Collaboration**: Multi-user workspaces with role-based permissions
- **Payment Processing**: Stripe integration with subscription management

---

## 🏗️ **Technical Architecture**

### **Technology Stack**
```
Frontend:    React 18 + Vite + Tailwind CSS
Backend:     Laravel 12 + PHP 8.2
Database:    MariaDB/MySQL + SQLite (development)
Auth:        Laravel Sanctum + JWT
UI:          Tailwind CSS + Radix UI + Lucide Icons
Payments:    Stripe Integration
Email:       ElasticMail Service
OAuth:       Google OAuth 2.0
```

### **System Requirements**
- **Node.js**: 18.x or higher
- **PHP**: 8.2 or higher
- **Database**: MariaDB 10.x or MySQL 8.x
- **Web Server**: Nginx or Apache
- **SSL Certificate**: Required for production

---

## 🚀 **Quick Start Guide**

### **Development Setup**

1. **Clone Repository**
   ```bash
   git clone https://github.com/mewayz/mewayz-platform.git
   cd mewayz-platform
   ```

2. **Backend Setup**
   ```bash
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   php artisan migrate
   php artisan serve --host=0.0.0.0 --port=8001
   ```

3. **Frontend Setup**
   ```bash
   cd /
   yarn install
   yarn dev
   ```

4. **Access Application**
   - Frontend: http://localhost:4028
   - Backend API: http://localhost:8001/api

### **Production Deployment**

1. **Configure Environment Variables**
   ```env
   # Backend (.env)
   APP_NAME=Mewayz
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://mewayz.com
   
   # Frontend (.env)
   VITE_API_URL=https://mewayz.com/api
   VITE_BACKEND_URL=https://mewayz.com
   ```

2. **Build for Production**
   ```bash
   # Backend
   composer install --no-dev --optimize-autoloader
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   
   # Frontend
   yarn build
   ```

3. **Deploy to Production Server**
   - Configure web server (Nginx/Apache)
   - Set up SSL certificates
   - Configure supervisor for queue workers
   - Set up automated backups

---

## 📚 **Documentation Structure**

### **User Documentation**
- [User Guide](./USER_GUIDE.md) - Complete user manual
- [Feature Documentation](./FEATURE_DOCUMENTATION.md) - Detailed feature guides
- [FAQ](./FAQ.md) - Frequently asked questions

### **Developer Documentation**
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Developer Guide](./DEVELOPER_GUIDE.md) - Development guidelines
- [Component Library](./COMPONENT_LIBRARY.md) - UI component reference

### **Admin Documentation**
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Production deployment
- [Security Guide](./SECURITY_GUIDE.md) - Security best practices
- [Maintenance Guide](./MAINTENANCE_GUIDE.md) - System maintenance

## 🔧 Development Workflow

### Backend Development
```bash
cd backend
php artisan serve --host=0.0.0.0 --port=8001
php artisan migrate
php artisan tinker
```

### Frontend Development  
```bash
yarn start
yarn build
yarn test
```

### Database Operations
```bash
php artisan migrate
php artisan db:seed
php artisan tinker
```

## 🚀 Deployment

### Production Deployment
1. Follow the [Deployment Setup Guide](./DEPLOYMENT_SETUP_GUIDE.md)
2. Configure environment variables
3. Set up SSL certificates
4. Configure Nginx/Apache
5. Set up monitoring and backups

### Production Environment
Production domain: **mewayz.com**

```env
# Backend (.env)
APP_URL=https://mewayz.com
FRONTEND_URL=https://mewayz.com

# Frontend (.env)
REACT_APP_BACKEND_URL=https://mewayz.com/api
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
php artisan test
```

### Frontend Testing
```bash
yarn test
```

### Integration Testing
See [Testing & Troubleshooting Guide](./TESTING_TROUBLESHOOTING_GUIDE.md) for comprehensive testing procedures.

## 🔐 Security

- JWT token authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- CSRF protection
- Rate limiting

## 📞 Support

For technical support:
1. Check the relevant documentation file
2. Review the [troubleshooting guide](./TESTING_TROUBLESHOOTING_GUIDE.md)
3. Check application logs
4. Test individual components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add tests for new features
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

---

**Built with ❤️ by Mewayz Technologies Inc.**  
*For complete documentation, see the individual guide files listed above.*

**Last updated: January 2025**
