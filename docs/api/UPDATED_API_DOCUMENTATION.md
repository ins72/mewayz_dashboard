# 🔗 Mewayz API Documentation

![API Status](https://img.shields.io/badge/API-124%2B%20Endpoints-brightgreen)
![Success Rate](https://img.shields.io/badge/Success%20Rate-88.6%25-brightgreen)
![Laravel](https://img.shields.io/badge/Laravel-12-red)

Complete API reference for the Mewayz business management platform.

## 📋 **Table of Contents**

- [Authentication](#authentication)
- [Workspace Management](#workspace-management)
- [Social Media Management](#social-media-management)
- [Link-in-Bio Builder](#link-in-bio-builder)
- [CRM System](#crm-system)
- [Course Management](#course-management)
- [Product Management](#product-management)
- [Payment Processing](#payment-processing)
- [Email Marketing](#email-marketing)
- [Dashboard Analytics](#dashboard-analytics)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🔐 **Authentication**

### **Base URL**
```
https://api.mewayz.com/api
```

### **Authentication Methods**
- **JWT Tokens**: Laravel Sanctum implementation
- **OAuth**: Google OAuth integration
- **API Keys**: For server-to-server communication

### **Authentication Endpoints**

#### **POST /auth/login**
User login with email and password.

```javascript
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "status": "active"
  },
  "token": "jwt_token_here"
}
```

#### **POST /auth/register**
User registration with email and password.

```javascript
// Request
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}

// Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "status": "active"
  },
  "token": "jwt_token_here"
}
```

#### **POST /auth/logout**
User logout (requires authentication).

```javascript
// Response
{
  "success": true,
  "message": "Successfully logged out"
}
```

#### **GET /auth/user**
Get current authenticated user.

```javascript
// Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "preferences": {}
  }
}
```

#### **POST /auth/password/reset**
Reset user password.

```javascript
// Request
{
  "email": "user@example.com"
}

// Response
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### **GET /auth/google**
Redirect to Google OAuth.

#### **GET /auth/google/callback**
Handle Google OAuth callback.

## 🏢 **Workspace Management**

### **Workspace Endpoints**

#### **GET /workspaces**
Get all workspaces for authenticated user.

```javascript
// Response
{
  "success": true,
  "workspaces": [
    {
      "id": "uuid",
      "name": "My Business",
      "slug": "my-business",
      "description": "Business description",
      "logo": "logo_url",
      "status": "active",
      "owner_id": "uuid",
      "branding": {},
      "settings": {},
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **POST /workspaces**
Create a new workspace.

```javascript
// Request
{
  "name": "My Business",
  "description": "Business description",
  "logo": "logo_url"
}

// Response
{
  "success": true,
  "workspace": {
    "id": "uuid",
    "name": "My Business",
    "slug": "my-business",
    "description": "Business description",
    "logo": "logo_url",
    "status": "active",
    "owner_id": "uuid"
  }
}
```

#### **GET /workspaces/{id}**
Get workspace by ID.

#### **PUT /workspaces/{id}**
Update workspace.

#### **DELETE /workspaces/{id}**
Delete workspace.

### **Workspace Invitation Endpoints**

#### **GET /workspaces/{workspace}/invitations**
Get workspace invitations.

#### **POST /workspaces/{workspace}/invitations**
Send workspace invitation.

```javascript
// Request
{
  "email": "user@example.com",
  "role": "editor",
  "message": "Join my workspace"
}

// Response
{
  "success": true,
  "invitation": {
    "id": "uuid",
    "workspace_id": "uuid",
    "email": "user@example.com",
    "role": "editor",
    "token": "invitation_token",
    "status": "pending",
    "expires_at": "2024-01-08T00:00:00Z"
  }
}
```

#### **POST /workspaces/{workspace}/invitations/bulk**
Send bulk invitations.

#### **GET /workspaces/{workspace}/invitations/analytics**
Get invitation analytics.

#### **POST /invitations/{token}/accept**
Accept invitation.

#### **POST /invitations/{token}/decline**
Decline invitation.

#### **POST /invitations/{invitation}/resend**
Resend invitation.

#### **DELETE /invitations/{invitation}**
Cancel invitation.

## 📱 **Social Media Management**

### **Social Media Account Endpoints**

#### **GET /social-media-accounts**
Get social media accounts.

```javascript
// Response
{
  "success": true,
  "accounts": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "platform": "instagram",
      "username": "mybusiness",
      "display_name": "My Business",
      "profile_picture": "profile_url",
      "status": "active",
      "connected_at": "2024-01-01T00:00:00Z",
      "last_sync_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **POST /social-media-accounts**
Connect social media account.

```javascript
// Request
{
  "platform": "instagram",
  "username": "mybusiness",
  "access_token": "access_token"
}

// Response
{
  "success": true,
  "account": {
    "id": "uuid",
    "workspace_id": "uuid",
    "platform": "instagram",
    "username": "mybusiness",
    "status": "active"
  }
}
```

#### **PUT /social-media-accounts/{id}**
Update social media account.

#### **DELETE /social-media-accounts/{id}**
Disconnect social media account.

#### **POST /social-media-accounts/{id}/refresh-tokens**
Refresh account tokens.

### **Social Media Post Endpoints**

#### **GET /social-media-posts**
Get social media posts.

```javascript
// Query Parameters
{
  "workspace_id": "uuid",
  "account_id": "uuid",
  "status": "published",
  "page": 1,
  "limit": 10
}

// Response
{
  "success": true,
  "posts": {
    "data": [
      {
        "id": "uuid",
        "workspace_id": "uuid",
        "social_media_account_id": "uuid",
        "title": "Post Title",
        "content": "Post content",
        "media_urls": ["image_url"],
        "hashtags": ["#business", "#growth"],
        "status": "published",
        "scheduled_at": "2024-01-01T00:00:00Z",
        "published_at": "2024-01-01T00:00:00Z",
        "engagement_metrics": {
          "likes": 100,
          "comments": 25,
          "shares": 10
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 10,
      "total": 100
    }
  }
}
```

#### **POST /social-media-posts**
Create social media post.

```javascript
// Request
{
  "social_media_account_id": "uuid",
  "title": "Post Title",
  "content": "Post content",
  "media_urls": ["image_url"],
  "hashtags": ["#business", "#growth"],
  "status": "draft",
  "scheduled_at": "2024-01-01T00:00:00Z"
}

// Response
{
  "success": true,
  "post": {
    "id": "uuid",
    "workspace_id": "uuid",
    "social_media_account_id": "uuid",
    "title": "Post Title",
    "content": "Post content",
    "status": "draft"
  }
}
```

#### **PUT /social-media-posts/{id}**
Update social media post.

#### **DELETE /social-media-posts/{id}**
Delete social media post.

#### **POST /social-media-posts/{id}/publish**
Publish social media post.

#### **POST /social-media-posts/{id}/duplicate**
Duplicate social media post.

#### **GET /social-media/analytics**
Get social media analytics.

```javascript
// Query Parameters
{
  "workspace_id": "uuid",
  "account_id": "uuid",
  "start_date": "2024-01-01",
  "end_date": "2024-01-31"
}

// Response
{
  "success": true,
  "analytics": {
    "totalPosts": 50,
    "publishedPosts": 45,
    "draftPosts": 5,
    "totalLikes": 2500,
    "totalComments": 350,
    "totalShares": 120,
    "averageEngagement": 4.2,
    "postsByPlatform": [
      {
        "platform": "instagram",
        "count": 30
      }
    ]
  }
}
```

## 🔗 **Link-in-Bio Builder**

### **Link-in-Bio Endpoints**

#### **GET /link-in-bio-pages**
Get link-in-bio pages.

```javascript
// Response
{
  "success": true,
  "pages": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "title": "My Bio Page",
      "slug": "my-bio-page",
      "bio": "Welcome to my page",
      "profile_picture": "profile_url",
      "is_active": true,
      "theme": {
        "background_color": "#ffffff",
        "text_color": "#000000",
        "button_style": "rounded"
      },
      "links": [
        {
          "id": "uuid",
          "title": "My Website",
          "url": "https://example.com",
          "is_active": true,
          "clicks": 150,
          "order": 1
        }
      ],
      "total_views": 1250,
      "total_clicks": 350
    }
  ]
}
```

#### **POST /link-in-bio-pages**
Create link-in-bio page.

```javascript
// Request
{
  "title": "My Bio Page",
  "bio": "Welcome to my page",
  "profile_picture": "profile_url",
  "theme": {
    "background_color": "#ffffff",
    "text_color": "#000000"
  },
  "links": [
    {
      "title": "My Website",
      "url": "https://example.com",
      "is_active": true,
      "order": 1
    }
  ]
}

// Response
{
  "success": true,
  "page": {
    "id": "uuid",
    "workspace_id": "uuid",
    "title": "My Bio Page",
    "slug": "my-bio-page",
    "is_active": true
  }
}
```

#### **GET /link-in-bio/{slug}** (Public)
Get public link-in-bio page.

#### **PUT /link-in-bio-pages/{id}**
Update link-in-bio page.

#### **DELETE /link-in-bio-pages/{id}**
Delete link-in-bio page.

#### **POST /link-in-bio-pages/{id}/track-click**
Track link click.

#### **GET /link-in-bio-pages/{id}/analytics**
Get page analytics.

#### **POST /link-in-bio-pages/{id}/duplicate**
Duplicate page.

## 👥 **CRM System**

### **CRM Contact Endpoints**

#### **GET /crm-contacts**
Get CRM contacts.

```javascript
// Response
{
  "success": true,
  "contacts": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Example Corp",
      "position": "CEO",
      "status": "lead",
      "lead_score": 85,
      "tags": ["hot-lead", "enterprise"],
      "last_contacted": "2024-01-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **POST /crm-contacts**
Create CRM contact.

```javascript
// Request
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Example Corp",
  "position": "CEO",
  "status": "lead",
  "tags": ["hot-lead", "enterprise"]
}

// Response
{
  "success": true,
  "contact": {
    "id": "uuid",
    "workspace_id": "uuid",
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "status": "lead",
    "lead_score": 0
  }
}
```

#### **PUT /crm-contacts/{id}**
Update CRM contact.

#### **DELETE /crm-contacts/{id}**
Delete CRM contact.

#### **POST /crm-contacts/{id}/mark-contacted**
Mark contact as contacted.

#### **POST /crm-contacts/{id}/update-lead-score**
Update lead score.

#### **POST /crm-contacts/{id}/add-tags**
Add tags to contact.

#### **POST /crm-contacts/{id}/remove-tags**
Remove tags from contact.

#### **GET /crm-contacts-follow-up**
Get contacts that need follow-up.

#### **GET /crm-analytics**
Get CRM analytics.

## 🎓 **Course Management**

### **Course Endpoints**

#### **GET /courses**
Get courses.

```javascript
// Response
{
  "success": true,
  "courses": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "title": "Business Growth Course",
      "slug": "business-growth-course",
      "description": "Learn to grow your business",
      "price": 99.99,
      "currency": "USD",
      "status": "published",
      "modules_count": 5,
      "lessons_count": 25,
      "students_count": 150,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **POST /courses**
Create course.

```javascript
// Request
{
  "title": "Business Growth Course",
  "slug": "business-growth-course",
  "description": "Learn to grow your business",
  "price": 99.99,
  "currency": "USD",
  "status": "draft"
}

// Response
{
  "success": true,
  "course": {
    "id": "uuid",
    "workspace_id": "uuid",
    "title": "Business Growth Course",
    "slug": "business-growth-course",
    "status": "draft"
  }
}
```

#### **PUT /courses/{id}**
Update course.

#### **DELETE /courses/{id}**
Delete course.

#### **POST /courses/{id}/modules**
Create course module.

#### **POST /courses/{id}/lessons**
Create course lesson.

#### **GET /courses/{id}/analytics**
Get course analytics.

#### **POST /courses/{id}/duplicate**
Duplicate course.

## 🛍️ **Product Management**

### **Product Endpoints**

#### **GET /products**
Get products.

```javascript
// Response
{
  "success": true,
  "products": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "name": "Business Toolkit",
      "slug": "business-toolkit",
      "description": "Essential tools for business",
      "price": 49.99,
      "currency": "USD",
      "stock": 100,
      "status": "active",
      "images": ["image_url"],
      "category": "tools",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **POST /products**
Create product.

```javascript
// Request
{
  "name": "Business Toolkit",
  "slug": "business-toolkit",
  "description": "Essential tools for business",
  "price": 49.99,
  "currency": "USD",
  "stock": 100,
  "status": "active",
  "category": "tools"
}

// Response
{
  "success": true,
  "product": {
    "id": "uuid",
    "workspace_id": "uuid",
    "name": "Business Toolkit",
    "slug": "business-toolkit",
    "status": "active"
  }
}
```

#### **PUT /products/{id}**
Update product.

#### **DELETE /products/{id}**
Delete product.

#### **POST /products/{id}/update-stock**
Update product stock.

#### **POST /products/{id}/duplicate**
Duplicate product.

#### **GET /products-analytics**
Get product analytics.

## 💳 **Payment Processing**

### **Payment Endpoints**

#### **GET /payments/packages**
Get available packages.

```javascript
// Response
{
  "success": true,
  "packages": {
    "basic": {
      "name": "Basic Plan",
      "price": 29.99,
      "currency": "USD",
      "features": ["5 Workspaces", "Basic Support", "Social Media Tools"]
    },
    "professional": {
      "name": "Professional Plan",
      "price": 79.99,
      "currency": "USD",
      "features": ["15 Workspaces", "Priority Support", "Advanced Analytics"]
    },
    "enterprise": {
      "name": "Enterprise Plan",
      "price": 199.99,
      "currency": "USD",
      "features": ["Unlimited Workspaces", "24/7 Support", "Custom Integrations"]
    }
  }
}
```

#### **POST /payments/checkout/session**
Create checkout session.

```javascript
// Request
{
  "package_id": "professional",
  "workspace_id": "uuid"
}

// Response
{
  "success": true,
  "session_id": "stripe_session_id",
  "url": "https://checkout.stripe.com/session_id"
}
```

#### **GET /payments/checkout/status/{sessionId}**
Get checkout status.

#### **GET /payments/transactions**
Get payment transactions.

#### **GET /payments/subscription/{workspaceId}**
Get workspace subscription.

#### **GET /payments/stats/{workspaceId}**
Get payment statistics.

#### **GET /payments/subscriptions/{workspaceId}**
Get all subscriptions.

#### **POST /webhook/stripe** (Public)
Handle Stripe webhooks.

## 📧 **Email Marketing**

### **Email Campaign Endpoints**

#### **GET /email/campaigns**
Get email campaigns.

```javascript
// Response
{
  "success": true,
  "campaigns": [
    {
      "id": "uuid",
      "workspace_id": "uuid",
      "subject": "Welcome to Our Service",
      "sender": "hello@example.com",
      "template": "welcome",
      "audience": "all",
      "status": "sent",
      "sent_count": 1000,
      "delivered_count": 980,
      "opened_count": 450,
      "clicked_count": 85,
      "open_rate": 45.9,
      "click_rate": 8.7,
      "sent_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### **POST /email/campaigns**
Create email campaign.

```javascript
// Request
{
  "subject": "Welcome to Our Service",
  "sender": "hello@example.com",
  "template": "welcome",
  "audience": "all",
  "content": "Email content here",
  "schedule_at": "2024-01-01T00:00:00Z"
}

// Response
{
  "success": true,
  "campaign": {
    "id": "uuid",
    "workspace_id": "uuid",
    "subject": "Welcome to Our Service",
    "status": "scheduled"
  }
}
```

#### **PUT /email/campaigns/{id}**
Update email campaign.

#### **DELETE /email/campaigns/{id}**
Delete email campaign.

#### **POST /email/campaigns/{id}/send**
Send email campaign.

#### **GET /email/campaigns/{id}/analytics**
Get campaign analytics.

#### **GET /email/templates**
Get email templates.

#### **POST /email/templates**
Create email template.

#### **GET /email/audiences**
Get email audiences.

#### **POST /email/audiences**
Create email audience.

#### **GET /email/stats/{workspaceId}**
Get email statistics.

## 📊 **Dashboard Analytics**

### **Dashboard Endpoints**

#### **GET /dashboard/stats/{workspaceId}**
Get dashboard statistics.

```javascript
// Response
{
  "success": true,
  "stats": {
    "totalRevenue": 25000.00,
    "totalPosts": 150,
    "activeLinks": 12,
    "emailCampaigns": 8,
    "crmContacts": 245,
    "courses": 3,
    "products": 15,
    "monthlyRevenue": 5000.00,
    "totalViews": 8500,
    "totalClicks": 1200
  }
}
```

#### **GET /dashboard/recent-activity/{workspaceId}**
Get recent activity.

#### **GET /dashboard/quick-stats/{workspaceId}**
Get quick stats.

#### **GET /dashboard/workspace-overview/{workspaceId}**
Get workspace overview.

#### **POST /dashboard/activity**
Log activity.

## ⚠️ **Error Handling**

### **Error Response Format**
```javascript
{
  "success": false,
  "error": "Error message",
  "errors": {
    "field": ["Validation error message"]
  },
  "code": "ERROR_CODE"
}
```

### **HTTP Status Codes**
- **200**: Success
- **201**: Created
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **422**: Validation Error
- **429**: Rate Limit Exceeded
- **500**: Internal Server Error

### **Common Error Codes**
- **AUTH_FAILED**: Authentication failed
- **WORKSPACE_NOT_FOUND**: Workspace not found
- **INSUFFICIENT_PERMISSIONS**: Insufficient permissions
- **VALIDATION_ERROR**: Validation failed
- **RATE_LIMIT_EXCEEDED**: Rate limit exceeded

## 🔒 **Rate Limiting**

### **Rate Limits**
- **Authentication**: 5 requests per minute
- **API Calls**: 100 requests per minute
- **Webhooks**: 1000 requests per minute

### **Rate Limit Headers**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔑 **Authentication Headers**

### **Required Headers**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
Accept: application/json
```

### **Optional Headers**
```
X-Workspace-ID: {workspace_id}
X-User-Agent: {user_agent}
```

## 📝 **Request/Response Examples**

### **Authentication Example**
```bash
curl -X POST https://api.mewayz.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

### **Authenticated Request Example**
```bash
curl -X GET https://api.mewayz.com/api/workspaces \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json"
```

---

**API Version**: v1  
**Last Updated**: January 2025  
**Status**: Production Ready (88.6% success rate)

For more information, visit the [Developer Guide](DEVELOPER_GUIDE.md).