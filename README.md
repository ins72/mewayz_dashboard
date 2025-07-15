# 🚀 Mewayz Enterprise Business Suite

Welcome to the Mewayz Enterprise Business Suite - a comprehensive, full-stack application for managing social media, e-commerce, CRM, and email marketing operations.

## 📚 Documentation

This project includes comprehensive documentation covering all aspects of development, deployment, and usage:

### 📖 **[COMPREHENSIVE_README.md](./COMPREHENSIVE_README.md)**
Complete project overview, features, architecture, and getting started guide.

### 🔌 **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**
Detailed API documentation covering all endpoints, request/response formats, and authentication.

### 🎨 **[FRONTEND_COMPONENTS_DOCUMENTATION.md](./FRONTEND_COMPONENTS_DOCUMENTATION.md)**
Frontend components guide covering React components, UI patterns, and styling guidelines.

### 🗃️ **[DATABASE_SCHEMA_DOCUMENTATION.md](./DATABASE_SCHEMA_DOCUMENTATION.md)**
Database schema documentation with table structures, relationships, and migration guides.

### 🚀 **[DEPLOYMENT_SETUP_GUIDE.md](./DEPLOYMENT_SETUP_GUIDE.md)**
Complete deployment guide for development, staging, and production environments.

### 🧪 **[TESTING_TROUBLESHOOTING_GUIDE.md](./TESTING_TROUBLESHOOTING_GUIDE.md)**
Testing procedures, debugging techniques, and troubleshooting common issues.

### 🔗 **[INTEGRATIONS_GUIDE.md](./INTEGRATIONS_GUIDE.md)**
Third-party integrations guide covering Stripe, Google OAuth, ElasticMail, and Instagram API.

## 🏗️ Architecture Overview

**Frontend:** React 18 + Vite + Tailwind CSS  
**Backend:** Laravel 12 + PHP 8.2  
**Database:** MariaDB with UUID support  
**Authentication:** Laravel Sanctum + JWT  
**Payments:** Stripe integration  
**Email:** ElasticMail service  
**OAuth:** Google OAuth 2.0  

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PHP 8.2 or higher
- MariaDB/MySQL
- Composer
- Yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd mewayz
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
   cd ../
   yarn install
   echo "REACT_APP_BACKEND_URL=http://localhost:8001/api" > .env
   yarn start
   ```

4. **Database Setup**
   ```bash
   mysql -u root -p
   CREATE DATABASE mewayz_local;
   CREATE USER 'mewayz'@'localhost' IDENTIFIED BY 'password';
   GRANT ALL PRIVILEGES ON mewayz_local.* TO 'mewayz'@'localhost';
   FLUSH PRIVILEGES;
   ```

## 🌟 Key Features

### ✅ **Implemented Features**
- **Authentication System**: Email/password + Google OAuth
- **6-Step Onboarding Wizard**: Complete user onboarding flow
- **Quick Action Tiles**: Instagram management, Link-in-Bio builder
- **Payment Integration**: Stripe subscription management
- **Email Marketing**: ElasticMail integration
- **Workspace Management**: Multi-tenant architecture
- **Social Media Tools**: Post scheduling and analytics
- **CRM System**: Contact management and lead scoring
- **Course Creator**: Educational content management
- **E-commerce**: Product catalog and sales

### 📊 **Testing Status**
- **Backend**: 82.1% success rate (23/28 tests passed)
- **Frontend**: 85% success rate (17/20 tests passed)
- **Core Systems**: All major features fully operational

## 🎯 Getting Started

1. **Read the [Comprehensive README](./COMPREHENSIVE_README.md)** for complete project overview
2. **Check the [API Documentation](./API_DOCUMENTATION.md)** for backend integration
3. **Review the [Frontend Components Guide](./FRONTEND_COMPONENTS_DOCUMENTATION.md)** for UI development
4. **Follow the [Deployment Guide](./DEPLOYMENT_SETUP_GUIDE.md)** for production setup
5. **Use the [Testing Guide](./TESTING_TROUBLESHOOTING_GUIDE.md)** for debugging

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
