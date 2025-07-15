# 🗄️ Mewayz Database Schema Documentation

![Database](https://img.shields.io/badge/Database-SQLite%2FMySQL-orange)
![Tables](https://img.shields.io/badge/Tables-20%2B-blue)
![UUID](https://img.shields.io/badge/Primary%20Keys-UUID-green)

Complete database schema documentation for the Mewayz business management platform.

## 📋 **Table of Contents**

- [Overview](#overview)
- [Database Design](#database-design)
- [Core Tables](#core-tables)
- [Feature Tables](#feature-tables)
- [System Tables](#system-tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Migrations](#migrations)
- [Seeders](#seeders)

## 🔍 **Overview**

### **Database Configuration**
- **Development**: SQLite for local development
- **Production**: MySQL 8.0+ for production deployment
- **Primary Keys**: UUID for all tables
- **Relationships**: Proper foreign key constraints
- **Indexing**: Optimized for performance

### **Design Principles**
- **Multi-tenant Architecture**: Workspace-based data isolation
- **UUID Primary Keys**: Non-sequential, secure identifiers
- **Proper Normalization**: Reduced data redundancy
- **Referential Integrity**: Foreign key constraints
- **Performance Optimization**: Strategic indexing

## 🏗️ **Database Design**

### **Entity Relationship Diagram**
```
Users ──┐
        ├── Workspace_Members ──── Workspaces ──┐
        │                                      │
        └── Personal_Access_Tokens             ├── Social_Media_Accounts
                                               ├── Social_Media_Posts
                                               ├── Link_In_Bio_Pages
                                               ├── Email_Campaigns
                                               ├── CRM_Contacts
                                               ├── Courses
                                               ├── Products
                                               ├── Payment_Transactions
                                               └── Activity_Logs
```

### **Multi-Tenant Structure**
All feature tables are connected to workspaces for data isolation:
- Each workspace has its own data scope
- Users can belong to multiple workspaces
- Role-based access control per workspace

## 👥 **Core Tables**

### **users**
User authentication and profile information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified_at TIMESTAMP NULL,
    password VARCHAR(255) NOT NULL,
    google_id VARCHAR(255) NULL,
    avatar VARCHAR(255) NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    preferences JSON NULL,
    remember_token VARCHAR(100) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_google_id (google_id),
    INDEX idx_status (status)
);
```

**Fields:**
- `id`: UUID primary key
- `name`: Full name of the user
- `email`: Unique email address
- `password`: Hashed password (Bcrypt)
- `google_id`: Google OAuth identifier
- `avatar`: Profile picture URL
- `role`: User role (admin, user)
- `status`: Account status
- `preferences`: User preferences (JSON)

### **workspaces**
Multi-tenant workspace management.

```sql
CREATE TABLE workspaces (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    logo VARCHAR(255) NULL,
    branding JSON NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    owner_id UUID NOT NULL,
    settings JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_owner (owner_id),
    INDEX idx_status (status)
);
```

**Fields:**
- `id`: UUID primary key
- `name`: Workspace name
- `slug`: URL-friendly identifier
- `description`: Workspace description
- `logo`: Workspace logo URL
- `branding`: Custom branding settings (JSON)
- `status`: Workspace status
- `owner_id`: Reference to workspace owner
- `settings`: Workspace configuration (JSON)

### **workspace_members**
User-workspace relationships with roles.

```sql
CREATE TABLE workspace_members (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role ENUM('owner', 'admin', 'editor', 'contributor', 'viewer', 'guest') DEFAULT 'viewer',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    permissions JSON NULL,
    invited_at TIMESTAMP NULL,
    joined_at TIMESTAMP NULL,
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

**Fields:**
- `workspace_id`: Reference to workspace
- `user_id`: Reference to user
- `role`: Member role in workspace
- `status`: Membership status
- `permissions`: Custom permissions (JSON)
- `invited_at`: Invitation timestamp
- `joined_at`: Join timestamp

### **workspace_invitations**
Workspace invitation management.

```sql
CREATE TABLE workspace_invitations (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    email VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'contributor', 'viewer') DEFAULT 'viewer',
    token VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    message TEXT NULL,
    invited_by UUID NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    responded_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_email (email),
    INDEX idx_token (token),
    INDEX idx_status (status)
);
```

## 🚀 **Feature Tables**

### **social_media_accounts**
Connected social media accounts.

```sql
CREATE TABLE social_media_accounts (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    platform ENUM('instagram', 'facebook', 'twitter', 'linkedin', 'tiktok', 'youtube') NOT NULL,
    account_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NULL,
    profile_picture VARCHAR(255) NULL,
    access_tokens JSON NULL,
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    connected_at TIMESTAMP NULL,
    last_sync_at TIMESTAMP NULL,
    account_info JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_platform (platform),
    INDEX idx_username (username),
    INDEX idx_status (status)
);
```

### **social_media_posts**
Social media content management.

```sql
CREATE TABLE social_media_posts (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    social_media_account_id UUID NOT NULL,
    title VARCHAR(255) NULL,
    content TEXT NOT NULL,
    media_urls JSON NULL,
    hashtags JSON NULL,
    status ENUM('draft', 'scheduled', 'published', 'failed') DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    published_at TIMESTAMP NULL,
    external_post_id VARCHAR(255) NULL,
    engagement_metrics JSON NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (social_media_account_id) REFERENCES social_media_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_account (social_media_account_id),
    INDEX idx_status (status),
    INDEX idx_scheduled (scheduled_at)
);
```

### **link_in_bio_pages**
Link-in-bio page builder.

```sql
CREATE TABLE link_in_bio_pages (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT NULL,
    profile_picture VARCHAR(255) NULL,
    background_image VARCHAR(255) NULL,
    theme JSON NULL,
    links JSON NULL,
    is_active BOOLEAN DEFAULT TRUE,
    total_views INT DEFAULT 0,
    total_clicks INT DEFAULT 0,
    seo_title VARCHAR(255) NULL,
    seo_description TEXT NULL,
    custom_css TEXT NULL,
    custom_domain VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_slug (slug),
    INDEX idx_active (is_active)
);
```

### **email_campaigns**
Email marketing campaigns.

```sql
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    subject VARCHAR(255) NOT NULL,
    sender VARCHAR(255) NOT NULL,
    template VARCHAR(255) NOT NULL,
    audience VARCHAR(255) NOT NULL,
    content LONGTEXT NULL,
    status ENUM('draft', 'scheduled', 'sent', 'failed') DEFAULT 'draft',
    schedule_at TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    sent_count INT DEFAULT 0,
    delivered_count INT DEFAULT 0,
    opened_count INT DEFAULT 0,
    clicked_count INT DEFAULT 0,
    bounce_count INT DEFAULT 0,
    open_rate DECIMAL(5,2) DEFAULT 0.00,
    click_rate DECIMAL(5,2) DEFAULT 0.00,
    bounce_rate DECIMAL(5,2) DEFAULT 0.00,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_status (status),
    INDEX idx_scheduled (schedule_at)
);
```

### **email_templates**
Email template management.

```sql
CREATE TABLE email_templates (
    id UUID PRIMARY KEY,
    workspace_id UUID NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    content LONGTEXT NOT NULL,
    category VARCHAR(255) NOT NULL,
    thumbnail VARCHAR(255) NULL,
    is_global BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_category (category),
    INDEX idx_global (is_global)
);
```

### **email_audiences**
Email audience segmentation.

```sql
CREATE TABLE email_audiences (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    criteria JSON NOT NULL,
    subscriber_count INT DEFAULT 0,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id)
);
```

### **crm_contacts**
Customer relationship management.

```sql
CREATE TABLE crm_contacts (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(255) NULL,
    company VARCHAR(255) NULL,
    position VARCHAR(255) NULL,
    address TEXT NULL,
    status ENUM('lead', 'prospect', 'customer', 'inactive') DEFAULT 'lead',
    lead_score INT DEFAULT 0,
    source VARCHAR(255) NULL,
    tags JSON NULL,
    notes TEXT NULL,
    last_contacted TIMESTAMP NULL,
    next_follow_up TIMESTAMP NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_lead_score (lead_score)
);
```

### **courses**
Course management system.

```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    thumbnail VARCHAR(255) NULL,
    trailer_video VARCHAR(255) NULL,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    duration_minutes INT DEFAULT 0,
    requirements TEXT NULL,
    what_you_learn TEXT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_slug (slug),
    INDEX idx_status (status)
);
```

### **course_modules**
Course module organization.

```sql
CREATE TABLE course_modules (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    order_index INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_order (order_index)
);
```

### **course_lessons**
Individual course lessons.

```sql
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL,
    module_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    content LONGTEXT NULL,
    video_url VARCHAR(255) NULL,
    duration_minutes INT DEFAULT 0,
    order_index INT NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
    INDEX idx_course (course_id),
    INDEX idx_module (module_id),
    INDEX idx_order (order_index)
);
```

### **products**
Product catalog management.

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NULL,
    price DECIMAL(10,2) NOT NULL,
    compare_price DECIMAL(10,2) NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    stock INT DEFAULT 0,
    track_inventory BOOLEAN DEFAULT TRUE,
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    images JSON NULL,
    category VARCHAR(255) NULL,
    tags JSON NULL,
    weight DECIMAL(8,2) NULL,
    dimensions JSON NULL,
    seo_title VARCHAR(255) NULL,
    seo_description TEXT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_category (category)
);
```

### **payment_transactions**
Payment transaction records.

```sql
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(255) NULL,
    stripe_payment_intent_id VARCHAR(255) NULL,
    stripe_session_id VARCHAR(255) NULL,
    description TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_user (user_id),
    INDEX idx_status (payment_status),
    INDEX idx_stripe_session (stripe_session_id)
);
```

### **subscriptions**
Subscription management.

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    plan_id VARCHAR(255) NOT NULL,
    status ENUM('active', 'canceled', 'past_due', 'unpaid') DEFAULT 'active',
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    trial_start TIMESTAMP NULL,
    trial_end TIMESTAMP NULL,
    canceled_at TIMESTAMP NULL,
    stripe_subscription_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_stripe_subscription (stripe_subscription_id)
);
```

## 🔧 **System Tables**

### **activity_logs**
System activity tracking.

```sql
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL,
    user_id UUID NOT NULL,
    type VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    entity_type VARCHAR(255) NULL,
    entity_id UUID NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    metadata JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_workspace (workspace_id),
    INDEX idx_user (user_id),
    INDEX idx_type (type),
    INDEX idx_entity (entity_type, entity_id)
);
```

### **personal_access_tokens**
API token management (Laravel Sanctum).

```sql
CREATE TABLE personal_access_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tokenable_type VARCHAR(255) NOT NULL,
    tokenable_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    abilities TEXT NULL,
    last_used_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_tokenable (tokenable_type, tokenable_id),
    INDEX idx_token (token)
);
```

### **cache**
Application cache storage.

```sql
CREATE TABLE cache (
    key VARCHAR(255) PRIMARY KEY,
    value LONGTEXT NOT NULL,
    expiration INT NOT NULL,
    
    INDEX idx_expiration (expiration)
);
```

### **cache_locks**
Cache lock management.

```sql
CREATE TABLE cache_locks (
    key VARCHAR(255) PRIMARY KEY,
    owner VARCHAR(255) NOT NULL,
    expiration INT NOT NULL,
    
    INDEX idx_expiration (expiration)
);
```

### **sessions**
Session management.

```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    payload LONGTEXT NOT NULL,
    last_activity INT NOT NULL,
    
    INDEX idx_user (user_id),
    INDEX idx_last_activity (last_activity)
);
```

### **jobs**
Queue job management.

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
    INDEX idx_reserved (reserved_at),
    INDEX idx_available (available_at)
);
```

### **job_batches**
Batch job management.

```sql
CREATE TABLE job_batches (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_jobs INT NOT NULL,
    pending_jobs INT NOT NULL,
    failed_jobs INT NOT NULL,
    failed_job_ids LONGTEXT NOT NULL,
    options MEDIUMTEXT NULL,
    cancelled_at INT NULL,
    created_at INT NOT NULL,
    finished_at INT NULL
);
```

### **failed_jobs**
Failed job tracking.

```sql
CREATE TABLE failed_jobs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid VARCHAR(255) UNIQUE NOT NULL,
    connection TEXT NOT NULL,
    queue TEXT NOT NULL,
    payload LONGTEXT NOT NULL,
    exception LONGTEXT NOT NULL,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_uuid (uuid)
);
```

## 🔗 **Relationships**

### **Primary Relationships**

#### **User Relationships**
- `User` → `WorkspaceMember` (1:N)
- `User` → `PersonalAccessToken` (1:N)
- `User` → `SocialMediaPost` (1:N) [created_by]
- `User` → `EmailCampaign` (1:N) [created_by]

#### **Workspace Relationships**
- `Workspace` → `WorkspaceMember` (1:N)
- `Workspace` → `WorkspaceInvitation` (1:N)
- `Workspace` → `SocialMediaAccount` (1:N)
- `Workspace` → `SocialMediaPost` (1:N)
- `Workspace` → `LinkInBioPage` (1:N)
- `Workspace` → `EmailCampaign` (1:N)
- `Workspace` → `CrmContact` (1:N)
- `Workspace` → `Course` (1:N)
- `Workspace` → `Product` (1:N)
- `Workspace` → `PaymentTransaction` (1:N)
- `Workspace` → `ActivityLog` (1:N)

#### **Feature Relationships**
- `SocialMediaAccount` → `SocialMediaPost` (1:N)
- `Course` → `CourseModule` (1:N)
- `CourseModule` → `CourseLesson` (1:N)

### **Foreign Key Constraints**
All foreign keys are configured with `ON DELETE CASCADE` to maintain referential integrity.

## 📊 **Indexes**

### **Primary Indexes**
- All tables have UUID primary keys
- Unique constraints on email, slug, and token fields
- Composite unique constraints where necessary

### **Performance Indexes**
- `idx_workspace` on all workspace-related tables
- `idx_user` on user-related tables
- `idx_status` on status columns
- `idx_email` on email columns
- `idx_created_at` on timestamp columns

### **Search Indexes**
- Full-text search on content fields
- Composite indexes for common query patterns
- Partial indexes for filtered queries

## 🔄 **Migrations**

### **Migration Files**
Located in `backend/database/migrations/`:

1. `0001_01_01_000000_create_users_table.php`
2. `0001_01_01_000001_create_cache_table.php`
3. `0001_01_01_000002_create_jobs_table.php`
4. `2024_01_01_000002_create_workspaces_table.php`
5. `2024_01_01_000003_create_workspace_members_table.php`
6. `2024_01_01_000004_create_subscriptions_table.php`
7. `2024_01_01_000007_create_social_media_accounts_table.php`
8. `2024_01_01_000008_create_social_media_posts_table.php`
9. `2024_01_01_000009_create_link_in_bio_pages_table.php`
10. `2024_01_01_000010_create_crm_contacts_table.php`
11. `2024_01_01_000011_create_courses_table.php`
12. `2024_01_01_000012_create_course_modules_table.php`
13. `2024_01_01_000013_create_course_lessons_table.php`
14. `2024_01_01_000015_create_products_table.php`
15. `2024_01_16_000001_create_email_campaigns_table.php`
16. `2024_01_16_000002_create_email_templates_table.php`
17. `2024_01_16_000003_create_email_audiences_table.php`
18. `2024_01_16_000004_create_activity_logs_table.php`
19. `2025_01_01_000001_create_payment_transactions_table.php`
20. `2025_01_14_210000_create_workspace_invitations_table.php`

### **Migration Commands**
```bash
# Run all migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Fresh migration with seeds
php artisan migrate:fresh --seed

# Check migration status
php artisan migrate:status
```

## 🌱 **Seeders**

### **Database Seeders**
Located in `backend/database/seeders/`:

#### **UserSeeder**
Creates sample users for development.

#### **WorkspaceSeeder**
Creates sample workspaces with proper relationships.

#### **SocialMediaAccountSeeder**
Creates sample social media accounts.

#### **EmailTemplateSeeder**
Creates default email templates.

### **Seeding Commands**
```bash
# Run all seeders
php artisan db:seed

# Run specific seeder
php artisan db:seed --class=UserSeeder

# Fresh migration with seeds
php artisan migrate:fresh --seed
```

## 🔧 **Maintenance**

### **Database Optimization**
```bash
# Analyze database
php artisan db:show

# Check table sizes
php artisan db:show --counts

# Optimize tables
php artisan db:optimize
```

### **Backup Commands**
```bash
# Export database
mysqldump -u username -p database_name > backup.sql

# Import database
mysql -u username -p database_name < backup.sql
```

### **Monitoring**
- Regular index analysis
- Query performance monitoring
- Storage usage tracking
- Backup verification

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Total Tables**: 20+  
**Status**: Production Ready

For additional information, see the [Developer Guide](UPDATED_DEVELOPER_GUIDE.md) or [API Documentation](UPDATED_API_DOCUMENTATION.md).