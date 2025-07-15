# 📚 API Documentation - Mewayz Enterprise Business Suite

## Base URL
```
Development: http://localhost:8001/api
Production: https://mewayz.com/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Common Response Format
```json
{
  "success": true,
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2025-01-21T12:00:00Z"
}
```

## Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "code": 400,
  "details": {...}
}
```

---

## 🔐 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2025-01-21T12:00:00Z"
    },
    "token": "jwt_token_here"
  },
  "message": "User registered successfully"
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": null,
      "google_id": null
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

### Get Authenticated User
**GET** `/auth/user`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "google_id": "google_user_id",
    "created_at": "2025-01-21T12:00:00Z"
  }
}
```

### Logout User
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

### Google OAuth
**GET** `/auth/google`

Redirects to Google OAuth consent screen.

**GET** `/auth/google/callback`

Handles Google OAuth callback and returns JWT token.

---

## 🏢 Workspace Management

### List User Workspaces
**GET** `/workspaces`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "My Company",
      "description": "Company workspace",
      "logo": null,
      "created_at": "2025-01-21T12:00:00Z",
      "members_count": 5,
      "user_role": "owner"
    }
  ]
}
```

### Create Workspace
**POST** `/workspaces`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "New Workspace",
  "description": "Workspace description",
  "logo": "base64_encoded_image_or_url"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Workspace",
    "description": "Workspace description",
    "logo": "logo_url",
    "created_at": "2025-01-21T12:00:00Z",
    "members_count": 1,
    "user_role": "owner"
  },
  "message": "Workspace created successfully"
}
```

### Get Workspace Details
**GET** `/workspaces/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Workspace Name",
    "description": "Description",
    "logo": "logo_url",
    "created_at": "2025-01-21T12:00:00Z",
    "members": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "owner",
        "joined_at": "2025-01-21T12:00:00Z"
      }
    ]
  }
}
```

### Update Workspace
**PUT** `/workspaces/{id}`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Workspace Name",
  "description": "Updated description"
}
```

### Delete Workspace
**DELETE** `/workspaces/{id}`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Workspace deleted successfully"
}
```

---

## 📱 Social Media Management

### List Social Media Accounts
**GET** `/social-media-accounts`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `workspace_id` (optional): Filter by workspace
- `platform` (optional): Filter by platform (instagram, facebook, twitter, etc.)
- `status` (optional): Filter by status (active, inactive, expired)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "platform": "instagram",
      "account_name": "@my_instagram",
      "account_info": {
        "followers_count": 10000,
        "profile_picture": "https://example.com/profile.jpg"
      },
      "status": "active",
      "connected_at": "2025-01-21T12:00:00Z"
    }
  ]
}
```

### Add Social Media Account
**POST** `/social-media-accounts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "workspace_id": "uuid",
  "platform": "instagram",
  "account_name": "@my_instagram",
  "access_token": "platform_access_token",
  "refresh_token": "platform_refresh_token",
  "account_info": {
    "followers_count": 10000,
    "profile_picture": "https://example.com/profile.jpg"
  }
}
```

### List Social Media Posts
**GET** `/social-media-posts`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `workspace_id` (optional): Filter by workspace
- `account_id` (optional): Filter by social media account
- `status` (optional): Filter by status (draft, scheduled, published, failed)
- `scheduled_from` (optional): Filter by scheduled date from
- `scheduled_to` (optional): Filter by scheduled date to
- `page` (optional): Page number for pagination
- `per_page` (optional): Items per page (default: 15)

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": "uuid",
        "title": "Post Title",
        "content": "Post content here...",
        "media_urls": ["https://example.com/image1.jpg"],
        "hashtags": ["#marketing", "#business"],
        "status": "published",
        "scheduled_at": "2025-01-21T15:00:00Z",
        "published_at": "2025-01-21T15:00:00Z",
        "engagement_metrics": {
          "likes": 150,
          "comments": 25,
          "shares": 10
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 100,
      "total_pages": 7
    }
  }
}
```

### Create Social Media Post
**POST** `/social-media-posts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "workspace_id": "uuid",
  "social_media_account_id": "uuid",
  "title": "Post Title",
  "content": "Post content here...",
  "media_urls": ["https://example.com/image1.jpg"],
  "hashtags": ["#marketing", "#business"],
  "scheduled_at": "2025-01-21T15:00:00Z",
  "status": "scheduled"
}
```

### Publish Post
**POST** `/social-media-posts/{id}/publish`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "post_id": "uuid",
    "status": "published",
    "published_at": "2025-01-21T12:00:00Z"
  },
  "message": "Post published successfully"
}
```

### Duplicate Post
**POST** `/social-media-posts/{id}/duplicate`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "original_post_id": "uuid",
    "duplicated_post": {
      "id": "new_uuid",
      "title": "Post Title (Copy)",
      "content": "Post content here...",
      "status": "draft"
    }
  },
  "message": "Post duplicated successfully"
}
```

---

## 🔗 Link in Bio Management

### List Link in Bio Pages
**GET** `/link-in-bio-pages`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `workspace_id` (optional): Filter by workspace
- `active` (optional): Filter by active status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "My Bio Page",
      "slug": "my-bio-page",
      "theme": {
        "background_color": "#ffffff",
        "text_color": "#000000",
        "button_color": "#007bff"
      },
      "links": [
        {
          "id": "uuid",
          "title": "Visit Website",
          "url": "https://example.com",
          "icon": "globe",
          "active": true,
          "order": 1
        }
      ],
      "view_count": 1250,
      "click_count": 340,
      "active": true,
      "created_at": "2025-01-21T12:00:00Z"
    }
  ]
}
```

### Create Link in Bio Page
**POST** `/link-in-bio-pages`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "workspace_id": "uuid",
  "title": "My Bio Page",
  "slug": "my-bio-page",
  "description": "Welcome to my bio page",
  "theme": {
    "background_color": "#ffffff",
    "text_color": "#000000",
    "button_color": "#007bff",
    "font_family": "Arial"
  },
  "links": [
    {
      "title": "Visit Website",
      "url": "https://example.com",
      "icon": "globe",
      "active": true,
      "order": 1
    }
  ]
}
```

### Get Public Bio Page
**GET** `/link-in-bio/{slug}`

**No authentication required**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "My Bio Page",
    "description": "Welcome to my bio page",
    "theme": {
      "background_color": "#ffffff",
      "text_color": "#000000",
      "button_color": "#007bff"
    },
    "links": [
      {
        "id": "uuid",
        "title": "Visit Website",
        "url": "https://example.com",
        "icon": "globe",
        "active": true,
        "order": 1
      }
    ]
  }
}
```

### Track Link Click
**POST** `/link-in-bio-pages/{id}/track-click`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "link_id": "uuid",
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1",
  "referrer": "https://instagram.com"
}
```

### Get Bio Page Analytics
**GET** `/link-in-bio-pages/{id}/analytics`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` (optional): time period (7d, 30d, 90d, 1y)

**Response:**
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_views": 1250,
      "total_clicks": 340,
      "click_through_rate": 27.2,
      "unique_visitors": 980
    },
    "link_performance": [
      {
        "link_id": "uuid",
        "title": "Visit Website",
        "clicks": 150,
        "click_rate": 44.1
      }
    ],
    "traffic_sources": [
      {
        "source": "instagram",
        "visitors": 600,
        "percentage": 61.2
      }
    ],
    "daily_stats": [
      {
        "date": "2025-01-21",
        "views": 85,
        "clicks": 23
      }
    ]
  }
}
```

---

## 👥 CRM Management

### List CRM Contacts
**GET** `/crm-contacts`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `workspace_id` (optional): Filter by workspace
- `status` (optional): Filter by status (lead, prospect, customer, lost)
- `lead_score_min` (optional): Minimum lead score
- `lead_score_max` (optional): Maximum lead score
- `search` (optional): Search by name or email
- `page` (optional): Page number
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "contacts": [
      {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "company": "Acme Corp",
        "position": "CEO",
        "status": "prospect",
        "lead_score": 85,
        "tags": ["vip", "enterprise"],
        "last_contacted": "2025-01-20T10:00:00Z",
        "created_at": "2025-01-15T09:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 250,
      "total_pages": 17
    }
  }
}
```

### Create CRM Contact
**POST** `/crm-contacts`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "workspace_id": "uuid",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "position": "CEO",
  "status": "lead",
  "lead_score": 70,
  "tags": ["enterprise"],
  "notes": "Interested in enterprise package"
}
```

### Update Lead Score
**POST** `/crm-contacts/{id}/update-lead-score`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "lead_score": 90,
  "reason": "Engaged with pricing page multiple times"
}
```

### Mark as Contacted
**POST** `/crm-contacts/{id}/mark-contacted`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "contact_method": "email",
  "notes": "Sent pricing information"
}
```

---

## 🎓 Course Management

### List Courses
**GET** `/courses`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `workspace_id` (optional): Filter by workspace
- `status` (optional): Filter by status (draft, published, archived)
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Digital Marketing Masterclass",
      "slug": "digital-marketing-masterclass",
      "description": "Complete digital marketing course",
      "thumbnail": "https://example.com/thumbnail.jpg",
      "price": 99.99,
      "currency": "USD",
      "status": "published",
      "modules_count": 8,
      "lessons_count": 24,
      "enrolled_count": 150,
      "created_at": "2025-01-15T09:00:00Z"
    }
  ]
}
```

### Create Course
**POST** `/courses`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "workspace_id": "uuid",
  "title": "Digital Marketing Masterclass",
  "slug": "digital-marketing-masterclass",
  "description": "Complete digital marketing course",
  "thumbnail": "base64_encoded_image_or_url",
  "price": 99.99,
  "currency": "USD",
  "category": "Marketing",
  "difficulty": "intermediate",
  "duration_hours": 12,
  "status": "draft"
}
```

### Create Course Module
**POST** `/courses/{id}/modules`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Introduction to Digital Marketing",
  "description": "Overview of digital marketing concepts",
  "order": 1,
  "duration_minutes": 45
}
```

### Create Course Lesson
**POST** `/courses/{id}/lessons`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "module_id": "uuid",
  "title": "What is Digital Marketing?",
  "content": "Lesson content here...",
  "video_url": "https://example.com/video.mp4",
  "order": 1,
  "duration_minutes": 15,
  "type": "video"
}
```

---

## 🛍️ Product Management

### List Products
**GET** `/products`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `workspace_id` (optional): Filter by workspace
- `category` (optional): Filter by category
- `status` (optional): Filter by status (active, inactive, out_of_stock)
- `price_min` (optional): Minimum price
- `price_max` (optional): Maximum price

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Premium Template Pack",
      "slug": "premium-template-pack",
      "description": "Professional website templates",
      "images": [
        "https://example.com/product1.jpg",
        "https://example.com/product2.jpg"
      ],
      "price": 49.99,
      "currency": "USD",
      "category": "Templates",
      "stock_quantity": 100,
      "status": "active",
      "sales_count": 25,
      "created_at": "2025-01-15T09:00:00Z"
    }
  ]
}
```

### Create Product
**POST** `/products`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "workspace_id": "uuid",
  "name": "Premium Template Pack",
  "slug": "premium-template-pack",
  "description": "Professional website templates",
  "images": ["base64_encoded_image_or_url"],
  "price": 49.99,
  "currency": "USD",
  "category": "Templates",
  "stock_quantity": 100,
  "digital_product": true,
  "download_link": "https://example.com/download",
  "status": "active"
}
```

### Update Stock
**POST** `/products/{id}/update-stock`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "stock_quantity": 75,
  "reason": "New inventory received"
}
```

---

## 💳 Payment Management

### Get Subscription Packages
**GET** `/payments/packages`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "basic",
      "name": "Basic Plan",
      "description": "Perfect for individuals",
      "price": 29.99,
      "currency": "USD",
      "billing_period": "monthly",
      "features": [
        "Up to 5 social media accounts",
        "Basic analytics",
        "Email support"
      ],
      "stripe_price_id": "price_basic_monthly"
    },
    {
      "id": "pro",
      "name": "Pro Plan",
      "description": "Great for growing businesses",
      "price": 79.99,
      "currency": "USD",
      "billing_period": "monthly",
      "features": [
        "Up to 25 social media accounts",
        "Advanced analytics",
        "Priority support",
        "Custom branding"
      ],
      "stripe_price_id": "price_pro_monthly"
    }
  ]
}
```

### Create Checkout Session
**POST** `/payments/checkout/session`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "workspace_id": "uuid",
  "package_id": "pro",
  "billing_period": "monthly",
  "success_url": "https://example.com/success",
  "cancel_url": "https://example.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "session_id": "cs_session_id",
    "checkout_url": "https://checkout.stripe.com/pay/cs_session_id"
  }
}
```

### Get Transaction History
**GET** `/payments/transactions`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `workspace_id` (optional): Filter by workspace
- `status` (optional): Filter by status (succeeded, failed, refunded)
- `from_date` (optional): Start date
- `to_date` (optional): End date
- `page` (optional): Page number
- `per_page` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "stripe_payment_intent_id": "pi_stripe_id",
        "amount": 79.99,
        "currency": "USD",
        "status": "succeeded",
        "package_name": "Pro Plan",
        "billing_period": "monthly",
        "created_at": "2025-01-21T12:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 15,
      "total": 45,
      "total_pages": 3
    }
  }
}
```

---

## 📧 Workspace Invitations

### List Workspace Invitations
**GET** `/workspaces/{workspace_id}/invitations`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): Filter by status (pending, accepted, declined, expired)
- `role` (optional): Filter by role
- `department` (optional): Filter by department

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "role": "editor",
      "department": "Marketing",
      "position": "Marketing Manager",
      "personal_message": "Welcome to our team!",
      "status": "pending",
      "expires_at": "2025-01-28T12:00:00Z",
      "created_at": "2025-01-21T12:00:00Z"
    }
  ]
}
```

### Create Invitation
**POST** `/workspaces/{workspace_id}/invitations`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "editor",
  "department": "Marketing",
  "position": "Marketing Manager",
  "personal_message": "Welcome to our team!",
  "expires_at": "2025-01-28T12:00:00Z"
}
```

### Bulk Create Invitations
**POST** `/workspaces/{workspace_id}/invitations/bulk`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "invitations": [
    {
      "email": "user1@example.com",
      "role": "editor",
      "department": "Marketing"
    },
    {
      "email": "user2@example.com",
      "role": "contributor",
      "department": "Design"
    }
  ],
  "default_message": "Welcome to our team!"
}
```

### Get Invitation by Token
**GET** `/invitations/{token}`

**No authentication required**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "workspace_name": "My Company",
    "email": "user@example.com",
    "role": "editor",
    "department": "Marketing",
    "position": "Marketing Manager",
    "personal_message": "Welcome to our team!",
    "expires_at": "2025-01-28T12:00:00Z",
    "status": "pending"
  }
}
```

### Accept Invitation
**POST** `/invitations/{token}/accept`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Invitation accepted successfully",
  "data": {
    "workspace": {
      "id": "uuid",
      "name": "My Company",
      "user_role": "editor"
    }
  }
}
```

### Decline Invitation
**POST** `/invitations/{token}/decline`

**No authentication required**

**Request Body:**
```json
{
  "reason": "Not interested at this time"
}
```

---

## 🚨 Error Codes

### Authentication Errors
- `401` - Unauthorized (invalid or missing token)
- `403` - Forbidden (insufficient permissions)

### Validation Errors
- `422` - Unprocessable Entity (validation failed)
- `400` - Bad Request (invalid request format)

### Resource Errors
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (resource already exists)

### Server Errors
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## 📊 Rate Limiting

Default rate limits:
- **Authentication endpoints**: 60 requests per minute
- **General API endpoints**: 1000 requests per minute
- **Webhook endpoints**: 100 requests per minute

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642781400
```

---

## 📝 Pagination

Paginated endpoints use the following format:

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 15,
    "total": 150,
    "total_pages": 10,
    "has_next": true,
    "has_previous": false
  }
}
```

---

## 🔍 Search and Filtering

Many endpoints support search and filtering:

**Common Query Parameters:**
- `search`: General search term
- `sort`: Sort field (e.g., `created_at`, `name`, `email`)
- `order`: Sort direction (`asc` or `desc`)
- `status`: Filter by status
- `created_from`: Filter by creation date from
- `created_to`: Filter by creation date to

**Example:**
```
GET /api/crm-contacts?search=john&sort=created_at&order=desc&status=prospect
```

---

## 📚 SDKs and Libraries

### JavaScript/Node.js
```javascript
// Example using axios
const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Get workspaces
const workspaces = await api.get('/workspaces');

// Create post
const post = await api.post('/social-media-posts', {
  workspace_id: 'uuid',
  social_media_account_id: 'uuid',
  title: 'My Post',
  content: 'Post content...'
});
```

### PHP
```php
// Example using Guzzle
$client = new \GuzzleHttp\Client([
    'base_uri' => 'http://localhost:8001/api/',
    'headers' => [
        'Authorization' => 'Bearer ' . $token,
        'Content-Type' => 'application/json'
    ]
]);

// Get workspaces
$response = $client->get('workspaces');
$workspaces = json_decode($response->getBody(), true);
```

---

## 🧪 Testing

### Test Environment
- Base URL: `http://localhost:8001/api`
- Test credentials: `test@mewayz.com` / `password123`

### Testing Tools
- **Postman Collection**: Available in `/docs/postman/`
- **cURL Examples**: See individual endpoint documentation
- **Automated Tests**: Run with `php artisan test`

---

## 📞 Support

For API support:
- Check the status page: `/api/status`
- Review error responses for detailed messages
- Contact technical support with API version and error details

---

**Last updated: January 2025**
**API Version: 1.0.0**