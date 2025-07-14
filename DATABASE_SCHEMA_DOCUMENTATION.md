# 🗃️ Database Schema Documentation - Mewayz

## Overview

The Mewayz database schema is designed to support a comprehensive enterprise business suite with multi-tenant workspace functionality. Built on MariaDB (MySQL compatible) with UUID primary keys for enhanced security and scalability.

## Database Information

- **Database Engine**: MariaDB 10.11
- **Character Set**: utf8mb4_unicode_ci
- **Primary Keys**: UUID (36 characters)
- **Timestamps**: Laravel's created_at/updated_at
- **Soft Deletes**: Enabled on key tables

---

## 🏗️ Core Tables

### users
**Purpose**: User authentication and profile management

```sql
CREATE TABLE users (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) NULL,
    avatar VARCHAR(255) NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_google_id (google_id)
);
```

**Key Fields:**
- `id`: UUID primary key
- `name`: User's display name
- `email`: Unique email address
- `password`: Hashed password
- `google_id`: Google OAuth identifier
- `avatar`: Profile picture URL
- `email_verified_at`: Email verification timestamp

**Relationships:**
- Has many `workspace_members`
- Has many `personal_access_tokens`
- Has many `workspace_invitations`

### workspaces
**Purpose**: Multi-tenant workspace management

```sql
CREATE TABLE workspaces (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    logo VARCHAR(255) NULL,
    settings JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name)
);
```

**Key Fields:**
- `id`: UUID primary key
- `name`: Workspace name
- `description`: Workspace description
- `logo`: Base64 encoded logo or URL
- `settings`: JSON configuration

**Relationships:**
- Has many `workspace_members`
- Has many `social_media_accounts`
- Has many `link_in_bio_pages`
- Has many `crm_contacts`
- Has many `courses`
- Has many `products`

### workspace_members
**Purpose**: User-workspace relationships with roles

```sql
CREATE TABLE workspace_members (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'editor', 'contributor', 'viewer', 'guest') NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_workspace_user (workspace_id, user_id),
    INDEX idx_workspace (workspace_id),
    INDEX idx_user (user_id),
    INDEX idx_role (role)
);
```

**Roles:**
- `owner`: Full workspace control
- `admin`: Administrative access
- `editor`: Content management
- `contributor`: Limited editing
- `viewer`: Read-only access
- `guest`: Temporary access

---

## 📱 Social Media Tables

### social_media_accounts
**Purpose**: Connected social media platform accounts

```sql
CREATE TABLE social_media_accounts (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    platform ENUM('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube', 'pinterest') NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    account_id VARCHAR(255) NULL,
    access_token TEXT NULL,
    refresh_token TEXT NULL,
    token_expires_at TIMESTAMP NULL,
    account_info JSON NULL,
    status ENUM('active', 'inactive', 'expired', 'error') DEFAULT 'active',
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_platform (platform),
    INDEX idx_status (status),
    INDEX idx_account_name (account_name)
);
```

**Key Fields:**
- `platform`: Social media platform
- `account_name`: Display name (e.g., @username)
- `account_id`: Platform-specific ID
- `access_token`: OAuth access token
- `refresh_token`: OAuth refresh token
- `account_info`: JSON with follower count, profile data
- `status`: Connection status

### social_media_posts
**Purpose**: Social media content management

```sql
CREATE TABLE social_media_posts (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    social_media_account_id CHAR(36) NOT NULL,
    title VARCHAR(255) NULL,
    content TEXT NULL,
    media_urls JSON NULL,
    hashtags JSON NULL,
    scheduled_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,
    status ENUM('draft', 'scheduled', 'published', 'failed') DEFAULT 'draft',
    platform_post_id VARCHAR(255) NULL,
    engagement_metrics JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (social_media_account_id) REFERENCES social_media_accounts(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_account (social_media_account_id),
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_at),
    INDEX idx_published (published_at)
);
```

**Key Fields:**
- `title`: Post title/caption
- `content`: Post content
- `media_urls`: JSON array of media URLs
- `hashtags`: JSON array of hashtags
- `scheduled_at`: Scheduled publication time
- `published_at`: Actual publication time
- `status`: Publication status
- `platform_post_id`: Platform-specific post ID
- `engagement_metrics`: Likes, comments, shares

---

## 🔗 Link in Bio Tables

### link_in_bio_pages
**Purpose**: Custom landing page builder

```sql
CREATE TABLE link_in_bio_pages (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    theme JSON NULL,
    links JSON NULL,
    seo_settings JSON NULL,
    custom_css TEXT NULL,
    view_count INT DEFAULT 0,
    click_count INT DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_slug (slug),
    INDEX idx_active (active),
    INDEX idx_view_count (view_count)
);
```

**Key Fields:**
- `title`: Page title
- `slug`: URL-friendly identifier
- `description`: Page description
- `theme`: JSON with colors, fonts, layout
- `links`: JSON array of links with icons, titles, URLs
- `seo_settings`: Meta tags, descriptions
- `custom_css`: Custom styling
- `view_count`: Total page views
- `click_count`: Total link clicks

### link_in_bio_clicks
**Purpose**: Click tracking analytics

```sql
CREATE TABLE link_in_bio_clicks (
    id CHAR(36) PRIMARY KEY,
    page_id CHAR(36) NOT NULL,
    link_id VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    referrer VARCHAR(255) NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (page_id) REFERENCES link_in_bio_pages(id) ON DELETE CASCADE,
    INDEX idx_page (page_id),
    INDEX idx_link (link_id),
    INDEX idx_clicked_at (clicked_at)
);
```

---

## 👥 CRM Tables

### crm_contacts
**Purpose**: Customer relationship management

```sql
CREATE TABLE crm_contacts (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    company VARCHAR(255) NULL,
    position VARCHAR(255) NULL,
    address TEXT NULL,
    notes TEXT NULL,
    tags JSON NULL,
    custom_fields JSON NULL,
    lead_score INT DEFAULT 0,
    status ENUM('lead', 'prospect', 'customer', 'lost') DEFAULT 'lead',
    source VARCHAR(255) NULL,
    last_contacted TIMESTAMP NULL,
    next_follow_up TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_lead_score (lead_score),
    INDEX idx_last_contacted (last_contacted),
    INDEX idx_next_follow_up (next_follow_up)
);
```

**Key Fields:**
- `first_name`, `last_name`: Contact name
- `email`, `phone`: Contact information
- `company`, `position`: Professional details
- `tags`: JSON array of contact tags
- `custom_fields`: Flexible JSON data
- `lead_score`: Scoring from 0-100
- `status`: Contact lifecycle stage
- `source`: Lead source tracking
- `last_contacted`: Last interaction date
- `next_follow_up`: Scheduled follow-up

### crm_interactions
**Purpose**: Contact interaction history

```sql
CREATE TABLE crm_interactions (
    id CHAR(36) PRIMARY KEY,
    contact_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    type ENUM('call', 'email', 'meeting', 'note', 'task') NOT NULL,
    subject VARCHAR(255) NULL,
    description TEXT NULL,
    outcome VARCHAR(255) NULL,
    duration_minutes INT NULL,
    scheduled_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (contact_id) REFERENCES crm_contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_contact (contact_id),
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_scheduled (scheduled_at),
    INDEX idx_completed (completed_at)
);
```

---

## 🎓 Education Tables

### courses
**Purpose**: Course creation and management

```sql
CREATE TABLE courses (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    thumbnail VARCHAR(255) NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    category VARCHAR(100) NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration_hours INT NULL,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    enrollment_limit INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_difficulty (difficulty)
);
```

### course_modules
**Purpose**: Course content organization

```sql
CREATE TABLE course_modules (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    order_index INT NOT NULL,
    duration_minutes INT NULL,
    is_published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_order (order_index),
    INDEX idx_published (is_published)
);
```

### course_lessons
**Purpose**: Individual lesson content

```sql
CREATE TABLE course_lessons (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    module_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NULL,
    video_url VARCHAR(255) NULL,
    resources JSON NULL,
    order_index INT NOT NULL,
    duration_minutes INT NULL,
    type ENUM('video', 'text', 'quiz', 'assignment') DEFAULT 'video',
    is_preview BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_module (module_id),
    INDEX idx_order (order_index),
    INDEX idx_type (type)
);
```

### course_enrollments
**Purpose**: Student enrollment tracking

```sql
CREATE TABLE course_enrollments (
    id CHAR(36) PRIMARY KEY,
    course_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    progress_percentage INT DEFAULT 0,
    status ENUM('active', 'completed', 'dropped', 'suspended') DEFAULT 'active',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_course_user (course_id, user_id),
    INDEX idx_course (course_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_enrolled (enrolled_at)
);
```

---

## 🛍️ E-commerce Tables

### products
**Purpose**: Product catalog management

```sql
CREATE TABLE products (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    short_description TEXT NULL,
    images JSON NULL,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    sku VARCHAR(100) UNIQUE NULL,
    stock_quantity INT NULL,
    manage_stock BOOLEAN DEFAULT TRUE,
    stock_status ENUM('in_stock', 'out_of_stock', 'on_backorder') DEFAULT 'in_stock',
    category VARCHAR(100) NULL,
    tags JSON NULL,
    attributes JSON NULL,
    digital_product BOOLEAN DEFAULT FALSE,
    download_link VARCHAR(255) NULL,
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_slug (slug),
    INDEX idx_sku (sku),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_featured (featured)
);
```

### product_categories
**Purpose**: Product categorization

```sql
CREATE TABLE product_categories (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NULL,
    parent_id CHAR(36) NULL,
    image VARCHAR(255) NULL,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_parent (parent_id),
    INDEX idx_slug (slug)
);
```

---

## 💳 Payment Tables

### subscriptions
**Purpose**: User subscription management

```sql
CREATE TABLE subscriptions (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    plan_price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period ENUM('monthly', 'yearly') NOT NULL,
    status ENUM('active', 'canceled', 'past_due', 'unpaid', 'incomplete') NOT NULL,
    trial_ends_at TIMESTAMP NULL,
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    canceled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_user (user_id),
    INDEX idx_stripe_subscription (stripe_subscription_id),
    INDEX idx_status (status),
    INDEX idx_period_end (current_period_end)
);
```

### payment_transactions
**Purpose**: Payment history tracking

```sql
CREATE TABLE payment_transactions (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    subscription_id CHAR(36) NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('pending', 'succeeded', 'failed', 'canceled', 'refunded') NOT NULL,
    payment_method VARCHAR(50) NULL,
    description TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL,
    INDEX idx_workspace (workspace_id),
    INDEX idx_user (user_id),
    INDEX idx_subscription (subscription_id),
    INDEX idx_stripe_payment_intent (stripe_payment_intent_id),
    INDEX idx_status (status),
    INDEX idx_amount (amount)
);
```

---

## 📧 Invitation Tables

### workspace_invitations
**Purpose**: Team invitation management

```sql
CREATE TABLE workspace_invitations (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    invited_by CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('owner', 'admin', 'editor', 'contributor', 'viewer', 'guest') NOT NULL,
    department VARCHAR(100) NULL,
    position VARCHAR(100) NULL,
    personal_message TEXT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'cancelled', 'expired') DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP NULL,
    declined_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_invited_by (invited_by),
    INDEX idx_email (email),
    INDEX idx_token (token),
    INDEX idx_status (status),
    INDEX idx_expires (expires_at)
);
```

### invitation_batches
**Purpose**: Bulk invitation tracking

```sql
CREATE TABLE invitation_batches (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NOT NULL,
    created_by CHAR(36) NOT NULL,
    name VARCHAR(255) NULL,
    total_invitations INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    accepted_count INT DEFAULT 0,
    declined_count INT DEFAULT 0,
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_created_by (created_by),
    INDEX idx_status (status)
);
```

---

## 🔑 Authentication Tables

### personal_access_tokens
**Purpose**: Laravel Sanctum token management

```sql
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tokenable (tokenable_type, tokenable_id),
    INDEX idx_token (token),
    INDEX idx_last_used (last_used_at)
);
```

### password_reset_tokens
**Purpose**: Password reset functionality

```sql
CREATE TABLE password_reset_tokens (
    email VARCHAR(255) PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_token (token)
);
```

---

## 📊 Analytics Tables

### analytics_events
**Purpose**: User behavior tracking

```sql
CREATE TABLE analytics_events (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NULL,
    user_id CHAR(36) NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    referrer VARCHAR(255) NULL,
    page_url VARCHAR(255) NULL,
    session_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_workspace (workspace_id),
    INDEX idx_user (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at),
    INDEX idx_session (session_id)
);
```

### page_views
**Purpose**: Page view tracking

```sql
CREATE TABLE page_views (
    id CHAR(36) PRIMARY KEY,
    workspace_id CHAR(36) NULL,
    user_id CHAR(36) NULL,
    page_url VARCHAR(255) NOT NULL,
    page_title VARCHAR(255) NULL,
    referrer VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    session_id VARCHAR(255) NULL,
    duration_seconds INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_workspace (workspace_id),
    INDEX idx_user (user_id),
    INDEX idx_page_url (page_url),
    INDEX idx_created_at (created_at),
    INDEX idx_session (session_id)
);
```

---

## 🔄 System Tables

### migrations
**Purpose**: Laravel migration tracking

```sql
CREATE TABLE migrations (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    migration VARCHAR(255) NOT NULL,
    batch INT NOT NULL
);
```

### failed_jobs
**Purpose**: Failed job tracking

```sql
CREATE TABLE failed_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_uuid (uuid),
    INDEX idx_failed_at (failed_at)
);
```

### jobs
**Purpose**: Job queue management

```sql
CREATE TABLE jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    queue VARCHAR(255) NOT NULL,
    payload LONGTEXT NOT NULL,
    attempts TINYINT UNSIGNED NOT NULL,
    reserved_at INT UNSIGNED NULL,
    available_at INT UNSIGNED NOT NULL,
    created_at INT UNSIGNED NOT NULL,
    
    INDEX idx_queue (queue),
    INDEX idx_reserved_at (reserved_at),
    INDEX idx_available_at (available_at)
);
```

### sessions
**Purpose**: Session management

```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id CHAR(36) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_last_activity (last_activity)
);
```

---

## 📈 Database Relationships

### Primary Relationships

```
users (1) ─── (many) workspace_members ─── (many) workspaces (1)
workspaces (1) ─── (many) social_media_accounts (1) ─── (many) social_media_posts
workspaces (1) ─── (many) link_in_bio_pages (1) ─── (many) link_in_bio_clicks
workspaces (1) ─── (many) crm_contacts (1) ─── (many) crm_interactions
workspaces (1) ─── (many) courses (1) ─── (many) course_modules (1) ─── (many) course_lessons
workspaces (1) ─── (many) products
workspaces (1) ─── (many) subscriptions
workspaces (1) ─── (many) payment_transactions
workspaces (1) ─── (many) workspace_invitations
```

### Cascade Rules

**ON DELETE CASCADE:**
- Deleting a workspace removes all associated data
- Deleting a user removes their workspace memberships
- Deleting a social media account removes all posts

**ON DELETE SET NULL:**
- Deleting a user sets analytics records to null
- Deleting a subscription sets payment transactions to null

---

## 🔍 Indexes and Performance

### Primary Indexes
- All tables have UUID primary keys
- Foreign key columns are indexed
- Frequently queried columns are indexed

### Composite Indexes
```sql
-- Workspace member uniqueness
UNIQUE KEY unique_workspace_user (workspace_id, user_id)

-- Course enrollment uniqueness
UNIQUE KEY unique_course_user (course_id, user_id)

-- Tokenable for polymorphic relationships
INDEX idx_tokenable (tokenable_type, tokenable_id)
```

### Query Optimization
- Use workspace_id in WHERE clauses for multi-tenant queries
- Index on status fields for filtering
- Index on timestamp fields for date range queries
- JSON columns for flexible data storage

---

## 🔐 Security Considerations

### Data Protection
- Passwords are hashed using bcrypt
- API tokens are hashed
- Sensitive data in JSON columns
- Foreign key constraints prevent orphaned records

### Multi-tenancy
- All data is workspace-scoped
- Row-level security through workspace_id
- Role-based access control
- Invitation system for secure user onboarding

### Audit Trail
- created_at and updated_at timestamps
- User tracking in modifications
- Soft deletes where appropriate
- Analytics event logging

---

## 📊 Data Types and Constraints

### UUID Fields
```sql
-- All primary keys
id CHAR(36) PRIMARY KEY

-- Foreign key references
workspace_id CHAR(36) NOT NULL
user_id CHAR(36) NOT NULL
```

### JSON Fields
```sql
-- Flexible configuration storage
settings JSON NULL
account_info JSON NULL
engagement_metrics JSON NULL
theme JSON NULL
links JSON NULL
```

### Enum Fields
```sql
-- Controlled vocabulary
status ENUM('active', 'inactive', 'expired')
role ENUM('owner', 'admin', 'editor', 'contributor', 'viewer')
```

### Timestamp Fields
```sql
-- Automatic timestamps
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

---

## 🔄 Migration Scripts

### Creating a New Migration
```bash
php artisan make:migration create_table_name --create=table_name
```

### Migration Structure
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTableName extends Migration
{
    public function up()
    {
        Schema::create('table_name', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('workspace_id');
            $table->string('name');
            $table->timestamps();
            
            $table->foreign('workspace_id')->references('id')->on('workspaces')->onDelete('cascade');
            $table->index(['workspace_id', 'name']);
        });
    }
    
    public function down()
    {
        Schema::dropIfExists('table_name');
    }
}
```

### Running Migrations
```bash
# Run all pending migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Reset all migrations
php artisan migrate:reset

# Fresh migration with seed data
php artisan migrate:fresh --seed
```

---

## 📝 Maintenance Scripts

### Database Backup
```bash
# Create backup
mysqldump -u mewayz -p mewayz_local > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
mysql -u mewayz -p mewayz_local < backup_file.sql
```

### Cleanup Scripts
```sql
-- Clean up expired tokens
DELETE FROM personal_access_tokens WHERE expires_at < NOW();

-- Clean up old analytics events (older than 1 year)
DELETE FROM analytics_events WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Clean up expired invitations
DELETE FROM workspace_invitations WHERE expires_at < NOW() AND status = 'pending';
```

### Performance Monitoring
```sql
-- Check table sizes
SELECT 
    table_name,
    table_rows,
    data_length,
    index_length,
    (data_length + index_length) as total_size
FROM information_schema.tables 
WHERE table_schema = 'mewayz_local'
ORDER BY total_size DESC;

-- Check slow queries
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

---

## 🧪 Testing Data

### Sample Data Creation
```sql
-- Create test user
INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Test User', 'test@mewayz.com', '$2y$10$...', NOW(), NOW());

-- Create test workspace
INSERT INTO workspaces (id, name, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Test Workspace', 'Test workspace description', NOW(), NOW());

-- Create workspace membership
INSERT INTO workspace_members (id, workspace_id, user_id, role, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'owner', NOW(), NOW());
```

### Test Credentials
- **Email**: test@mewayz.com
- **Password**: password123
- **Workspace**: Test Workspace

---

## 📞 Support

For database-related issues:
- Check migration status: `php artisan migrate:status`
- View database logs: `tail -f /var/log/mysql/mysql.log`
- Test connection: `php artisan tinker` then `DB::connection()->getPdo();`
- Check indexes: `SHOW INDEX FROM table_name;`

---

**Last updated: January 2025**
**Database Version: 1.0.0**