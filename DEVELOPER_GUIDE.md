# 👨‍💻 **Mewayz Developer Guide**

**Version**: 1.0.0  
**Last Updated**: January 15, 2025  
**Platform**: mewayz.com

---

## 📋 **Table of Contents**

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Backend Development](#backend-development)
4. [Frontend Development](#frontend-development)
5. [Database Management](#database-management)
6. [API Development](#api-development)
7. [Authentication & Security](#authentication--security)
8. [Testing Guidelines](#testing-guidelines)
9. [Deployment Procedures](#deployment-procedures)
10. [Code Standards](#code-standards)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)

---

## 🏗️ **Development Environment Setup**

### **Prerequisites**

#### **System Requirements**
- **Operating System**: macOS 11+, Ubuntu 20.04+, Windows 10+
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space
- **Network**: Stable internet connection

#### **Required Software**
- **Node.js**: 18.x or higher
- **PHP**: 8.2 or higher
- **Composer**: 2.x or higher
- **Yarn**: 1.22.x or higher
- **Git**: 2.x or higher
- **MariaDB/MySQL**: 10.x or 8.x

### **Installation Steps**

#### **1. Clone Repository**
```bash
git clone https://github.com/mewayz/mewayz-platform.git
cd mewayz-platform
```

#### **2. Backend Setup**
```bash
# Navigate to backend directory
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Run database migrations
php artisan migrate

# Start backend server
php artisan serve --host=0.0.0.0 --port=8001
```

#### **3. Frontend Setup**
```bash
# Navigate to root directory
cd /

# Install Node.js dependencies
yarn install

# Copy environment file
cp .env.example .env

# Start development server
yarn dev
```

#### **4. Database Setup**
```bash
# Create database
mysql -u root -p
CREATE DATABASE mewayz_local;
CREATE USER 'mewayz'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON mewayz_local.* TO 'mewayz'@'localhost';
FLUSH PRIVILEGES;
```

### **Development Tools**

#### **Recommended IDE Extensions**
- **PHP**: PHP Intelephense, Laravel Extension Pack
- **JavaScript**: ES7+ React/Redux/React-Native snippets
- **CSS**: Tailwind CSS IntelliSense
- **Git**: GitLens
- **Database**: MySQL Extension

#### **Code Quality Tools**
- **PHP CS Fixer**: Code formatting
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **PHPStan**: Static analysis
- **Laravel Telescope**: Debug assistant

---

## 📁 **Project Structure**

### **Root Directory Structure**
```
/app/
├── backend/                    # Laravel Backend
│   ├── app/                   # Application logic
│   ├── bootstrap/             # Framework bootstrap
│   ├── config/               # Configuration files
│   ├── database/             # Migrations and seeders
│   ├── public/               # Public assets
│   ├── resources/            # Views and assets
│   ├── routes/               # Route definitions
│   ├── storage/              # File storage
│   ├── tests/                # PHP tests
│   └── vendor/               # Composer dependencies
├── src/                      # React Frontend
│   ├── components/           # React components
│   ├── contexts/             # React contexts
│   ├── pages/                # Page components
│   ├── utils/                # Utility functions
│   └── styles/               # CSS styles
├── public/                   # Static assets
├── node_modules/             # npm dependencies
├── documentation/            # Project documentation
└── tests/                    # End-to-end tests
```

### **Backend Directory Structure**
```
backend/app/
├── Console/                  # Artisan commands
├── Exceptions/               # Exception handlers
├── Http/
│   ├── Controllers/          # API controllers
│   ├── Middleware/           # Custom middleware
│   ├── Requests/             # Form requests
│   └── Resources/            # API resources
├── Models/                   # Eloquent models
├── Providers/                # Service providers
└── Services/                 # Business logic services
```

### **Frontend Directory Structure**
```
src/
├── components/
│   ├── ui/                   # UI components
│   ├── dashboard/            # Dashboard components
│   ├── onboarding/           # Onboarding wizard
│   └── AppIcon.jsx           # Icon component
├── contexts/
│   ├── AuthContext.jsx       # Authentication context
│   └── WorkspaceContext.jsx  # Workspace context
├── pages/                    # Page components
├── utils/                    # Utility functions
└── styles/                   # CSS files
```

---

## 🔧 **Backend Development**

### **Laravel Framework**

#### **Core Components**
- **Framework**: Laravel 12.x
- **PHP Version**: 8.2+
- **Authentication**: Laravel Sanctum
- **Database**: Eloquent ORM
- **Queue System**: Redis/Database
- **File Storage**: Local/S3 compatible

#### **Key Features**
- **API Routes**: RESTful API endpoints
- **Middleware**: Authentication and CORS
- **Models**: Eloquent relationships
- **Controllers**: Resource controllers
- **Services**: Business logic layer

### **Database Models**

#### **User Model**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class User extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'role',
        'status',
        'preferences',
        'google_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'preferences' => 'json',
    ];
}
```

#### **Workspace Model**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Workspace extends Model
{
    use HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'logo',
        'branding',
        'owner_id',
        'settings',
        'status',
    ];

    protected $casts = [
        'branding' => 'json',
        'settings' => 'json',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members()
    {
        return $this->hasMany(WorkspaceMember::class);
    }
}
```

### **API Controllers**

#### **AuthController Structure**
```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user,
            'message' => 'Login successful'
        ]);
    }

    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user,
            'message' => 'User registered successfully'
        ]);
    }
}
```

#### **Resource Controller Pattern**
```php
<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SocialMediaPost;
use Illuminate\Http\Request;

class SocialMediaPostController extends Controller
{
    public function index(Request $request)
    {
        $posts = SocialMediaPost::where('workspace_id', $request->user()->workspace_id)
            ->with(['account', 'workspace'])
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $posts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id' => 'required|uuid|exists:social_media_accounts,id',
            'content' => 'required|string',
            'media_urls' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'status' => 'required|in:draft,scheduled,published',
        ]);

        $post = SocialMediaPost::create([
            'workspace_id' => $request->user()->workspace_id,
            'created_by' => $request->user()->id,
            ...$validated
        ]);

        return response()->json([
            'success' => true,
            'data' => $post,
            'message' => 'Post created successfully'
        ]);
    }
}
```

### **Database Migrations**

#### **UUID Migration Pattern**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->enum('role', ['user', 'admin'])->default('user');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->json('preferences')->nullable();
            $table->string('google_id')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
};
```

#### **Relationship Migration**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('workspace_members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->uuid('user_id');
            $table->enum('role', ['owner', 'admin', 'editor', 'contributor', 'viewer'])->default('member');
            $table->enum('status', ['active', 'inactive', 'pending'])->default('pending');
            $table->json('permissions')->nullable();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('joined_at')->nullable();
            $table->timestamps();

            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->unique(['workspace_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('workspace_members');
    }
};
```

### **Services Layer**

#### **Business Logic Services**
```php
<?php

namespace App\Services;

use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceMember;
use Illuminate\Support\Str;

class WorkspaceService
{
    public function createWorkspace(User $user, array $data)
    {
        $workspace = Workspace::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'description' => $data['description'] ?? '',
            'owner_id' => $user->id,
            'branding' => $data['branding'] ?? [],
            'settings' => $data['settings'] ?? [],
        ]);

        // Add owner as workspace member
        WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'status' => 'active',
            'joined_at' => now(),
        ]);

        return $workspace;
    }

    public function inviteUser(Workspace $workspace, string $email, string $role = 'member')
    {
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            // Create invitation for non-existing user
            return $this->createInvitation($workspace, $email, $role);
        }

        // Add existing user to workspace
        return WorkspaceMember::create([
            'workspace_id' => $workspace->id,
            'user_id' => $user->id,
            'role' => $role,
            'status' => 'active',
            'invited_at' => now(),
            'joined_at' => now(),
        ]);
    }
}
```

---

## ⚛️ **Frontend Development**

### **React Framework**

#### **Technology Stack**
- **Framework**: React 18.x
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API
- **Routing**: React Router DOM

#### **Project Configuration**
```javascript
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4028,
    host: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
```

### **Component Architecture**

#### **Component Structure**
```
src/components/
├── ui/                       # Base UI components
│   ├── Button.jsx           # Button component
│   ├── Input.jsx            # Input component
│   ├── Card.jsx             # Card component
│   └── UserMenu.jsx         # User menu component
├── dashboard/               # Dashboard-specific components
│   ├── DashboardHeader.jsx  # Header component
│   ├── MetricsGrid.jsx      # Metrics display
│   └── QuickActionsHub.jsx  # Quick actions
└── onboarding/             # Onboarding components
    ├── OnboardingWizard.jsx # Main wizard
    └── StepComponents/      # Individual steps
```

#### **UI Component Example**
```jsx
// src/components/ui/Button.jsx
import React from 'react';
import { cn } from '../../utils/cn';

const Button = React.forwardRef(({ 
  children, 
  className, 
  variant = 'default',
  size = 'default',
  loading = false,
  disabled = false,
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
```

### **Context Management**

#### **Authentication Context**
```jsx
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../utils/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const sessionResult = await authService.getSession();
        if (sessionResult?.success && sessionResult?.data?.session?.user) {
          setUser(sessionResult.data.session.user);
        }
      } catch (error) {
        setAuthError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      setAuthError(null);
      const result = await authService.signIn(email, password);
      
      if (result?.success) {
        setUser(result.data.session.user);
        return { success: true, data: result.data };
      }
      
      setAuthError(result?.error || 'Login failed');
      return { success: false, error: result?.error };
    } catch (error) {
      const errorMsg = 'Something went wrong during login';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      return { success: true };
    } catch (error) {
      setUser(null); // Clear user state even if API fails
      return { success: false, error: 'Logout failed' };
    }
  };

  const value = {
    user,
    loading,
    authError,
    signIn,
    signOut,
    clearError: () => setAuthError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### **API Integration**

#### **API Client Configuration**
```javascript
// src/utils/apiClient.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login-screen';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

#### **Service Layer Implementation**
```javascript
// src/utils/laravelAuthService.js
import apiClient from './apiClient';

const laravelAuthService = {
  signIn: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return { 
          success: true, 
          data: {
            session: {
              user: response.data.user,
              access_token: response.data.token
            }
          }
        };
      }
      
      return { success: false, error: response.data.message };
    } catch (error) {
      if (error.response?.data?.message) {
        return { success: false, error: error.response.data.message };
      }
      return { success: false, error: 'Login failed' };
    }
  },

  signOut: async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true };
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true };
    }
  },

  getSession: async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        return { success: true, data: { session: null } };
      }

      const response = await apiClient.get('/auth/user');
      if (response.data.success) {
        return { 
          success: true, 
          data: {
            session: {
              user: response.data.user,
              access_token: token
            }
          }
        };
      }
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true, data: { session: null } };
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      return { success: true, data: { session: null } };
    }
  }
};

export default laravelAuthService;
```

### **Routing & Navigation**

#### **Route Configuration**
```jsx
// src/Routes.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Page imports
import LandingPage from './pages/LandingPage';
import LoginScreen from './pages/login-screen';
import RegistrationScreen from './pages/registration-screen';
import DashboardScreen from './pages/dashboard-screen';
import InstagramManagement from './components/dashboard/InstagramManagement';
import LinkInBioBuilder from './components/dashboard/LinkInBioBuilder';
import PaymentDashboard from './components/dashboard/PaymentDashboard';
import EmailCampaignBuilder from './components/dashboard/EmailCampaignBuilder';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login-screen" element={<LoginScreen />} />
          <Route path="/registration-screen" element={<RegistrationScreen />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard-screen" element={
            <ProtectedRoute>
              <DashboardScreen />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/instagram" element={
            <ProtectedRoute>
              <InstagramManagement />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/link-builder" element={
            <ProtectedRoute>
              <LinkInBioBuilder />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/payments" element={
            <ProtectedRoute>
              <PaymentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/email-campaigns" element={
            <ProtectedRoute>
              <EmailCampaignBuilder />
            </ProtectedRoute>
          } />
          
          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
```

#### **Protected Route Component**
```jsx
// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login-screen" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

---

## 🗄️ **Database Management**

### **Database Schema Design**

#### **Core Tables**
```sql
-- Users table
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'inactive') DEFAULT 'active',
  preferences JSON,
  google_id VARCHAR(255),
  email_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Workspaces table
CREATE TABLE workspaces (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  logo VARCHAR(255),
  branding JSON,
  owner_id VARCHAR(36),
  settings JSON,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Workspace members table
CREATE TABLE workspace_members (
  id VARCHAR(36) PRIMARY KEY,
  workspace_id VARCHAR(36),
  user_id VARCHAR(36),
  role ENUM('owner', 'admin', 'editor', 'contributor', 'viewer') DEFAULT 'member',
  status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
  permissions JSON,
  invited_at TIMESTAMP,
  joined_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_workspace_user (workspace_id, user_id)
);
```

#### **Business Tables**
```sql
-- Social media accounts table
CREATE TABLE social_media_accounts (
  id VARCHAR(36) PRIMARY KEY,
  workspace_id VARCHAR(36),
  platform VARCHAR(50) NOT NULL,
  account_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  profile_picture VARCHAR(255),
  access_tokens JSON,
  status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
  connected_at TIMESTAMP,
  last_sync_at TIMESTAMP,
  account_info JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- CRM contacts table
CREATE TABLE crm_contacts (
  id VARCHAR(36) PRIMARY KEY,
  workspace_id VARCHAR(36),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  company VARCHAR(255),
  job_title VARCHAR(255),
  notes TEXT,
  tags JSON,
  status ENUM('active', 'inactive') DEFAULT 'active',
  lead_score INTEGER DEFAULT 0,
  custom_fields JSON,
  last_contacted_at TIMESTAMP,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### **Migration Management**

#### **Migration Commands**
```bash
# Create new migration
php artisan make:migration create_table_name

# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Reset database
php artisan migrate:reset

# Refresh migrations
php artisan migrate:refresh

# Check migration status
php artisan migrate:status
```

#### **Seeder Implementation**
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create test user
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@mewayz.com',
            'password' => Hash::make('password123'),
            'role' => 'user',
            'status' => 'active',
        ]);

        // Create personal workspace
        Workspace::create([
            'name' => 'Personal Workspace',
            'slug' => 'personal-workspace',
            'description' => 'Default personal workspace',
            'owner_id' => $user->id,
            'status' => 'active',
        ]);
    }
}
```

### **Query Optimization**

#### **Database Indexes**
```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_workspaces_owner_id ON workspaces(owner_id);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_social_media_accounts_workspace_id ON social_media_accounts(workspace_id);
CREATE INDEX idx_crm_contacts_workspace_id ON crm_contacts(workspace_id);
CREATE INDEX idx_crm_contacts_lead_score ON crm_contacts(lead_score);
```

#### **Query Optimization Examples**
```php
// Efficient relationship loading
$workspaces = Workspace::with(['owner', 'members.user'])
    ->where('status', 'active')
    ->get();

// Pagination with relationships
$contacts = CrmContact::with(['workspace', 'createdBy'])
    ->where('workspace_id', $workspaceId)
    ->where('status', 'active')
    ->orderBy('lead_score', 'desc')
    ->paginate(20);

// Optimized search query
$posts = SocialMediaPost::where('workspace_id', $workspaceId)
    ->where('status', 'published')
    ->whereDate('created_at', '>=', now()->subDays(30))
    ->with(['account', 'analytics'])
    ->orderBy('created_at', 'desc')
    ->get();
```

---

## 🔐 **Authentication & Security**

### **Laravel Sanctum Configuration**

#### **Sanctum Setup**
```php
// config/sanctum.php
return [
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
    ))),

    'guard' => ['web'],

    'expiration' => null,

    'middleware' => [
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];
```

#### **API Route Protection**
```php
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Workspace routes
    Route::apiResource('workspaces', WorkspaceController::class);
    
    // Social media routes
    Route::apiResource('social-media-accounts', SocialMediaAccountController::class);
    Route::apiResource('social-media-posts', SocialMediaPostController::class);
    
    // CRM routes
    Route::apiResource('crm-contacts', CrmContactController::class);
    
    // Course routes
    Route::apiResource('courses', CourseController::class);
    
    // Product routes
    Route::apiResource('products', ProductController::class);
});
```

### **Security Best Practices**

#### **Input Validation**
```php
// Form Request Validation
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateWorkspaceRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:workspaces',
            'description' => 'nullable|string|max:1000',
            'branding' => 'nullable|array',
            'branding.logo' => 'nullable|url',
            'branding.colors' => 'nullable|array',
            'settings' => 'nullable|array',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Workspace name is required',
            'slug.unique' => 'This workspace slug is already taken',
        ];
    }
}
```

#### **Rate Limiting**
```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'api' => [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];

protected $routeMiddleware = [
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
];
```

#### **CORS Configuration**
```php
// config/cors.php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

### **Frontend Security**

#### **Secure Token Storage**
```javascript
// Token management utility
class TokenManager {
  static setToken(token) {
    localStorage.setItem('authToken', token);
  }

  static getToken() {
    return localStorage.getItem('authToken');
  }

  static removeToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  static isTokenValid() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }
}
```

#### **Protected Route Implementation**
```jsx
// Enhanced protected route with role checking
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login-screen" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
```

---

## 🧪 **Testing Guidelines**

### **Backend Testing**

#### **Unit Testing**
```php
<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WorkspaceTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_workspace()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/workspaces', [
                'name' => 'Test Workspace',
                'slug' => 'test-workspace',
                'description' => 'Test workspace description',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'name',
                    'slug',
                    'description',
                    'owner_id',
                ],
                'message'
            ]);

        $this->assertDatabaseHas('workspaces', [
            'name' => 'Test Workspace',
            'slug' => 'test-workspace',
            'owner_id' => $user->id,
        ]);
    }

    public function test_workspace_requires_name()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/workspaces', [
                'slug' => 'test-workspace',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }
}
```

#### **Feature Testing**
```php
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@mewayz.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'test@mewayz.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'token',
                'user' => [
                    'id',
                    'name',
                    'email',
                ],
                'message'
            ]);
    }

    public function test_user_cannot_login_with_invalid_credentials()
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'wrong@email.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Invalid credentials'
            ]);
    }
}
```

### **Frontend Testing**

#### **Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/index.js',
    '!src/setupTests.js',
  ],
};
```

#### **Component Testing**
```jsx
// src/components/__tests__/Button.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../ui/Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('shows loading state', () => {
    render(<Button loading>Loading...</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('applies variant styles', () => {
    render(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('border');
  });
});
```

#### **Integration Testing**
```jsx
// src/pages/__tests__/LoginScreen.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import LoginScreen from '../login-screen';

const MockedLoginScreen = () => (
  <BrowserRouter>
    <AuthProvider>
      <LoginScreen />
    </AuthProvider>
  </BrowserRouter>
);

describe('LoginScreen', () => {
  test('renders login form', () => {
    render(<MockedLoginScreen />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('validates required fields', async () => {
    render(<MockedLoginScreen />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });
});
```

### **End-to-End Testing**

#### **Playwright Configuration**
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:4028',
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
};
```

#### **E2E Test Example**
```javascript
// tests/e2e/login.spec.js
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/login-screen');
    
    await page.fill('input[type="email"]', 'test@mewayz.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard-screen');
    await expect(page.locator('text=Good morning, test!')).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login-screen');
    
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

---

## 🚀 **Deployment Procedures**

### **Environment Configuration**

#### **Production Environment Variables**
```env
# Backend (.env)
APP_NAME=Mewayz
APP_ENV=production
APP_DEBUG=false
APP_URL=https://mewayz.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=mewayz_production
DB_USERNAME=mewayz_user
DB_PASSWORD=secure_password

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.elasticemail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@mewayz.com
MAIL_PASSWORD=your_elastic_mail_password

# Stripe
STRIPE_KEY=pk_live_...
STRIPE_SECRET=sk_live_...

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

```env
# Frontend (.env)
VITE_API_URL=https://mewayz.com/api
VITE_BACKEND_URL=https://mewayz.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### **Build Process**

#### **Backend Build**
```bash
# Install dependencies
composer install --no-dev --optimize-autoloader

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Generate application key
php artisan key:generate

# Link storage
php artisan storage:link

# Queue worker setup
php artisan queue:restart
```

#### **Frontend Build**
```bash
# Install dependencies
yarn install --frozen-lockfile

# Build for production
yarn build

# Copy build files to server
rsync -av dist/ /var/www/mewayz/public/
```

### **Server Configuration**

#### **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name mewayz.com www.mewayz.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mewayz.com www.mewayz.com;
    root /var/www/mewayz/public;

    ssl_certificate /etc/letsencrypt/live/mewayz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mewayz.com/privkey.pem;

    index index.html index.php;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

#### **Supervisor Configuration**
```ini
[program:mewayz-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/mewayz/artisan queue:work redis --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=8
redirect_stderr=true
stdout_logfile=/var/www/mewayz/storage/logs/worker.log
```

### **Monitoring & Logging**

#### **Application Monitoring**
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
        'level' => env('LOG_LEVEL', 'debug'),
    ],
    
    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => 'Laravel Log',
        'emoji' => ':boom:',
        'level' => 'critical',
    ],
];
```

#### **Performance Monitoring**
```php
// Install Laravel Telescope for production debugging
composer require laravel/telescope

// Configure Telescope
php artisan telescope:install
php artisan migrate
```

---

## 📏 **Code Standards**

### **PHP Standards**

#### **PSR-12 Compliance**
```php
<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::query()
            ->when($request->has('search'), function ($query) use ($request) {
                return $query->where('name', 'like', '%' . $request->search . '%');
            })
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create($validatedData);

        return response()->json([
            'success' => true,
            'data' => $user,
            'message' => 'User created successfully',
        ], 201);
    }
}
```

#### **Naming Conventions**
```php
// Class names: PascalCase
class UserController extends Controller

// Method names: camelCase
public function getUserProfile()

// Variable names: camelCase
$userName = 'John Doe';

// Constant names: UPPER_CASE
const MAX_LOGIN_ATTEMPTS = 5;

// Database table names: snake_case
users, workspace_members, social_media_accounts

// Model relationships: camelCase
public function workspaceMembers()
```

### **JavaScript Standards**

#### **ESLint Configuration**
```json
{
  "extends": [
    "eslint:recommended",
    "@eslint/js",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "parserOptions": {
    "ecmaVersion": 2021,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "rules": {
    "indent": ["error", 2],
    "quotes": ["error", "single"],
    "semi": ["error", "always"],
    "no-unused-vars": "warn",
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

#### **React Component Standards**
```jsx
// Component naming: PascalCase
const UserProfile = ({ user, onUpdate }) => {
  // Hook declarations at the top
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Event handlers: handle prefix
  const handleUpdateProfile = useCallback(async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      await onUpdate(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [onUpdate]);
  
  // Early returns for loading/error states
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  // Main component JSX
  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <Button onClick={() => handleUpdateProfile(user)}>
        Update Profile
      </Button>
    </div>
  );
};

// PropTypes for better documentation
UserProfile.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default UserProfile;
```

### **CSS Standards**

#### **Tailwind CSS Guidelines**
```jsx
// Consistent spacing scale
<div className="p-4 m-2 gap-3">

// Responsive design
<div className="w-full md:w-1/2 lg:w-1/3">

// Component-specific styles
<button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md">

// Conditional classes
<div className={cn(
  "base-styles",
  isActive && "active-styles",
  size === 'lg' && "large-styles"
)}>
```

#### **Custom CSS Organization**
```css
/* Variables */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --spacing-unit: 0.25rem;
}

/* Base styles */
.btn {
  @apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors;
}

/* Component variants */
.btn-primary {
  @apply bg-primary text-primary-foreground hover:bg-primary/90;
}

.btn-secondary {
  @apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
}

/* Responsive utilities */
.container {
  @apply mx-auto px-4 sm:px-6 lg:px-8;
}
```

---

## ⚡ **Performance Optimization**

### **Backend Performance**

#### **Database Optimization**
```php
// Use eager loading to prevent N+1 queries
$workspaces = Workspace::with(['owner', 'members.user'])
    ->get();

// Use select to limit columns
$users = User::select('id', 'name', 'email')
    ->where('status', 'active')
    ->get();

// Use indexes for frequently queried columns
Schema::table('users', function (Blueprint $table) {
    $table->index('email');
    $table->index('status');
    $table->index(['status', 'created_at']);
});

// Use database transactions for multiple operations
DB::transaction(function () {
    $user = User::create($userData);
    $workspace = Workspace::create($workspaceData);
    WorkspaceMember::create($memberData);
});
```

#### **Caching Strategy**
```php
// Cache configuration
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),
    'options' => [
        'cluster' => env('REDIS_CLUSTER', 'redis'),
        'prefix' => env('REDIS_PREFIX', Str::slug(env('APP_NAME', 'laravel'), '_').'_database_'),
    ],
    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD', null),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
    ],
],

// Cache implementation
class WorkspaceService
{
    public function getUserWorkspaces(User $user)
    {
        return Cache::remember(
            "user_workspaces_{$user->id}",
            now()->addMinutes(30),
            function () use ($user) {
                return $user->workspaces()->with('members')->get();
            }
        );
    }
}
```

#### **Queue System**
```php
// Queue configuration
'redis' => [
    'driver' => 'redis',
    'connection' => 'default',
    'queue' => env('REDIS_QUEUE', 'default'),
    'retry_after' => 90,
    'block_for' => null,
],

// Job implementation
class SendWelcomeEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        // Send welcome email
        Mail::to($this->user->email)->send(new WelcomeEmail($this->user));
    }
}

// Dispatching jobs
SendWelcomeEmail::dispatch($user);
```

### **Frontend Performance**

#### **Code Splitting**
```jsx
// Route-based code splitting
import { lazy, Suspense } from 'react';

const DashboardScreen = lazy(() => import('./pages/dashboard-screen'));
const InstagramManagement = lazy(() => import('./components/dashboard/InstagramManagement'));

// Use Suspense for loading states
<Suspense fallback={<LoadingSpinner />}>
  <Routes>
    <Route path="/dashboard" element={<DashboardScreen />} />
    <Route path="/instagram" element={<InstagramManagement />} />
  </Routes>
</Suspense>
```

#### **Memoization**
```jsx
// Component memoization
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  return (
    <div>
      {data.map(item => (
        <Item key={item.id} item={item} onUpdate={onUpdate} />
      ))}
    </div>
  );
});

// Callback memoization
const ParentComponent = () => {
  const [items, setItems] = useState([]);
  
  const handleUpdate = useCallback((id, newData) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...newData } : item
    ));
  }, []);
  
  return <ExpensiveComponent data={items} onUpdate={handleUpdate} />;
};

// Value memoization
const DataProcessor = ({ rawData }) => {
  const processedData = useMemo(() => {
    return rawData.map(item => ({
      ...item,
      processed: expensiveCalculation(item)
    }));
  }, [rawData]);
  
  return <DataDisplay data={processedData} />;
};
```

#### **Image Optimization**
```jsx
// Image lazy loading
const LazyImage = ({ src, alt, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className={className}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
};
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

#### **Database Connection Issues**
```bash
# Check database connection
php artisan tinker
DB::connection()->getPdo();

# Clear configuration cache
php artisan config:clear
php artisan cache:clear

# Check database credentials
cat .env | grep DB_

# Test database connection
mysql -u username -p -h localhost database_name
```

#### **Authentication Problems**
```bash
# Clear authentication cache
php artisan auth:clear-resets
php artisan cache:clear

# Check Sanctum configuration
php artisan route:list | grep sanctum

# Verify token storage
localStorage.getItem('authToken')
```

#### **Build Issues**
```bash
# Frontend build problems
rm -rf node_modules
rm yarn.lock
yarn install

# Backend dependency issues
composer clear-cache
composer install
php artisan optimize:clear
```

### **Debugging Tools**

#### **Laravel Telescope**
```bash
# Install Telescope
composer require laravel/telescope
php artisan telescope:install
php artisan migrate

# View in browser
https://mewayz.com/telescope
```

#### **React Developer Tools**
```bash
# Install React DevTools browser extension
# Enable profiler for performance debugging
# Use React DevTools Profiler tab
```

#### **Database Debugging**
```php
// Enable query logging
DB::enableQueryLog();

// Get executed queries
$queries = DB::getQueryLog();
dd($queries);

// Use Laravel Debugbar
composer require barryvdh/laravel-debugbar
```

### **Performance Monitoring**

#### **Application Performance**
```php
// Monitor response times
Log::info('API Response Time', [
    'endpoint' => $request->path(),
    'method' => $request->method(),
    'duration' => $duration,
    'memory' => memory_get_peak_usage(true),
]);

// Database query monitoring
DB::listen(function ($query) {
    if ($query->time > 1000) {
        Log::warning('Slow Query Detected', [
            'sql' => $query->sql,
            'time' => $query->time,
            'bindings' => $query->bindings,
        ]);
    }
});
```

#### **Frontend Performance**
```javascript
// Performance monitoring
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`${entry.name}: ${entry.duration}ms`);
  }
});

observer.observe({ entryTypes: ['measure', 'navigation'] });

// Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

---

## 📞 **Support & Resources**

### **Development Support**

#### **Documentation**
- **Laravel Documentation**: https://laravel.com/docs
- **React Documentation**: https://reactjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vite Documentation**: https://vitejs.dev/guide/

#### **Community Resources**
- **Laravel Community**: https://laracasts.com
- **React Community**: https://reactjs.org/community
- **Stack Overflow**: Tag questions with `laravel`, `react`, `mewayz`
- **GitHub Issues**: Report bugs and request features

#### **Internal Resources**
- **API Documentation**: `/app/API_DOCUMENTATION.md`
- **Component Library**: `/app/COMPONENT_LIBRARY.md`
- **User Guide**: `/app/USER_GUIDE.md`
- **Deployment Guide**: `/app/DEPLOYMENT_GUIDE.md`

### **Getting Help**

#### **Development Team**
- **Lead Developer**: dev@mewayz.com
- **Frontend Team**: frontend@mewayz.com
- **Backend Team**: backend@mewayz.com
- **DevOps Team**: devops@mewayz.com

#### **Issue Reporting**
- **Bug Reports**: Create GitHub issue with reproduction steps
- **Feature Requests**: Use GitHub feature request template
- **Security Issues**: Email security@mewayz.com
- **Performance Issues**: Include profiling data

### **Contributing**

#### **Development Process**
1. **Fork Repository**: Create personal fork
2. **Create Branch**: Feature/bugfix branch
3. **Make Changes**: Follow code standards
4. **Write Tests**: Add test coverage
5. **Submit PR**: Pull request with description

#### **Code Review Process**
- **Automated Checks**: CI/CD pipeline validation
- **Peer Review**: Senior developer review
- **Testing**: Manual and automated testing
- **Deployment**: Staging environment testing
- **Production**: Monitored production deployment

---

**© 2025 Mewayz Technologies Inc. All rights reserved.**

*This developer guide is continuously updated. For the latest version, visit the repository documentation.*

---

*Need development help? Contact our development team at dev@mewayz.com*