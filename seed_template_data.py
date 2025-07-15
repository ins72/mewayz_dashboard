#!/usr/bin/env python3
"""
Script to seed template marketplace data for testing
"""

import requests
import json
import uuid
from datetime import datetime

class TemplateDataSeeder:
    def __init__(self):
        self.base_url = "http://localhost:8001/api"
        self.token = None
        self.user_id = None
        self.workspace_id = None
        
    def authenticate(self):
        """Authenticate and get token"""
        # Login with existing test user
        data = {
            "email": "test@mewayz.com",
            "password": "password123"
        }
        
        response = requests.post(f"{self.base_url}/auth/login", json=data)
        if response.status_code == 200:
            result = response.json()
            if result.get('success') and result.get('token'):
                self.token = result['token']
                self.user_id = result['user']['id']
                print(f"✅ Authenticated as user: {self.user_id}")
                return True
        
        print("❌ Authentication failed")
        return False
    
    def get_workspace(self):
        """Get a workspace for testing"""
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.get(f"{self.base_url}/workspaces", headers=headers)
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success') and result.get('workspaces'):
                workspaces = result['workspaces']
                if workspaces:
                    self.workspace_id = workspaces[0]['id']
                    print(f"✅ Using workspace: {self.workspace_id}")
                    return True
        
        print("❌ No workspace found")
        return False
    
    def seed_categories(self):
        """Seed template categories directly into database"""
        print("🌱 Seeding template categories...")
        
        # We'll use Laravel's artisan command to seed categories
        import subprocess
        
        # Create categories using raw SQL
        categories = [
            {
                'id': str(uuid.uuid4()),
                'name': 'Email Marketing',
                'slug': 'email-marketing',
                'description': 'Professional email marketing templates',
                'icon': 'mail',
                'color': '#3B82F6',
                'sort_order': 1,
                'is_active': True,
                'template_count': 0
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Social Media',
                'slug': 'social-media',
                'description': 'Social media post and story templates',
                'icon': 'share',
                'color': '#10B981',
                'sort_order': 2,
                'is_active': True,
                'template_count': 0
            },
            {
                'id': str(uuid.uuid4()),
                'name': 'Landing Pages',
                'slug': 'landing-pages',
                'description': 'High-converting landing page templates',
                'icon': 'globe',
                'color': '#F59E0B',
                'sort_order': 3,
                'is_active': True,
                'template_count': 0
            }
        ]
        
        # Insert categories using SQLite
        import sqlite3
        
        try:
            conn = sqlite3.connect('/app/backend/database/database.sqlite')
            cursor = conn.cursor()
            
            for category in categories:
                cursor.execute('''
                    INSERT OR REPLACE INTO template_categories 
                    (id, name, slug, description, icon, color, sort_order, is_active, template_count, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ''', (
                    category['id'],
                    category['name'],
                    category['slug'],
                    category['description'],
                    category['icon'],
                    category['color'],
                    category['sort_order'],
                    category['is_active'],
                    category['template_count']
                ))
            
            conn.commit()
            conn.close()
            print(f"✅ Seeded {len(categories)} template categories")
            return categories
            
        except Exception as e:
            print(f"❌ Failed to seed categories: {e}")
            return []
    
    def seed_templates(self, categories):
        """Seed sample templates"""
        print("🌱 Seeding sample templates...")
        
        templates = []
        
        for i, category in enumerate(categories):
            for j in range(2):  # 2 templates per category
                template = {
                    'id': str(uuid.uuid4()),
                    'workspace_id': self.workspace_id,
                    'creator_id': self.user_id,
                    'template_category_id': category['id'],
                    'title': f'{category["name"]} Template {j+1}',
                    'description': f'Professional {category["name"].lower()} template for modern businesses',
                    'template_type': 'email' if 'email' in category['name'].lower() else 'social_media',
                    'template_data': json.dumps({
                        'html': f'<div>Sample {category["name"]} template content</div>',
                        'css': 'body { font-family: Arial, sans-serif; }',
                        'variables': ['title', 'content']
                    }),
                    'price': 0 if j == 0 else 19.99,  # First template free, second paid
                    'is_free': j == 0,
                    'is_premium': j == 1,
                    'status': 'active',
                    'approval_status': 'approved',
                    'license_type': 'standard',
                    'tags': json.dumps([category['slug'], 'professional', 'modern']),
                    'features': json.dumps(['Responsive design', 'Easy customization']),
                    'requirements': json.dumps(['Basic HTML knowledge']),
                    'download_count': (i + 1) * 10 + j * 5,
                    'purchase_count': (i + 1) * 2 + j,
                    'rating_average': 4.5 + (j * 0.3),
                    'rating_count': 10 + (i * 5),
                    'created_by': self.user_id
                }
                templates.append(template)
        
        # Insert templates using SQLite
        import sqlite3
        
        try:
            conn = sqlite3.connect('/app/backend/database/database.sqlite')
            cursor = conn.cursor()
            
            for template in templates:
                cursor.execute('''
                    INSERT OR REPLACE INTO templates 
                    (id, workspace_id, creator_id, template_category_id, title, description, template_type, 
                     template_data, price, is_free, is_premium, status, approval_status, license_type, 
                     tags, features, requirements, download_count, purchase_count, rating_average, 
                     rating_count, created_by, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ''', (
                    template['id'],
                    template['workspace_id'],
                    template['creator_id'],
                    template['template_category_id'],
                    template['title'],
                    template['description'],
                    template['template_type'],
                    template['template_data'],
                    template['price'],
                    template['is_free'],
                    template['is_premium'],
                    template['status'],
                    template['approval_status'],
                    template['license_type'],
                    template['tags'],
                    template['features'],
                    template['requirements'],
                    template['download_count'],
                    template['purchase_count'],
                    template['rating_average'],
                    template['rating_count'],
                    template['created_by']
                ))
            
            conn.commit()
            conn.close()
            print(f"✅ Seeded {len(templates)} templates")
            return templates
            
        except Exception as e:
            print(f"❌ Failed to seed templates: {e}")
            return []
    
    def seed_collections(self, templates):
        """Seed sample template collections"""
        print("🌱 Seeding template collections...")
        
        collections = [
            {
                'id': str(uuid.uuid4()),
                'creator_id': self.user_id,
                'title': 'Complete Email Marketing Bundle',
                'description': 'Everything you need for successful email marketing campaigns',
                'price': 79.99,
                'discount_percentage': 25,
                'tags': json.dumps(['email', 'marketing', 'bundle']),
                'template_count': 2,
                'purchase_count': 5,
                'rating_average': 4.8,
                'rating_count': 12,
                'is_active': True,
                'is_featured': True,
                'created_by': self.user_id
            }
        ]
        
        # Insert collections using SQLite
        import sqlite3
        
        try:
            conn = sqlite3.connect('/app/backend/database/database.sqlite')
            cursor = conn.cursor()
            
            for collection in collections:
                cursor.execute('''
                    INSERT OR REPLACE INTO template_collections 
                    (id, creator_id, title, description, price, discount_percentage, tags, 
                     template_count, purchase_count, rating_average, rating_count, is_active, 
                     is_featured, created_by, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                ''', (
                    collection['id'],
                    collection['creator_id'],
                    collection['title'],
                    collection['description'],
                    collection['price'],
                    collection['discount_percentage'],
                    collection['tags'],
                    collection['template_count'],
                    collection['purchase_count'],
                    collection['rating_average'],
                    collection['rating_count'],
                    collection['is_active'],
                    collection['is_featured'],
                    collection['created_by']
                ))
                
                # Add templates to collection
                email_templates = [t for t in templates if 'email' in t['template_type'].lower()][:2]
                for i, template in enumerate(email_templates):
                    cursor.execute('''
                        INSERT OR REPLACE INTO template_collection_items 
                        (id, template_collection_id, template_id, sort_order, created_at, updated_at)
                        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
                    ''', (str(uuid.uuid4()), collection['id'], template['id'], i + 1))
            
            conn.commit()
            conn.close()
            print(f"✅ Seeded {len(collections)} template collections")
            return collections
            
        except Exception as e:
            print(f"❌ Failed to seed collections: {e}")
            return []
    
    def run(self):
        """Run the seeding process"""
        print("🚀 Starting Template Marketplace Data Seeding")
        print("=" * 50)
        
        if not self.authenticate():
            return False
        
        if not self.get_workspace():
            return False
        
        categories = self.seed_categories()
        if not categories:
            return False
        
        templates = self.seed_templates(categories)
        if not templates:
            return False
        
        collections = self.seed_collections(templates)
        
        print("\n✅ Template Marketplace data seeding completed!")
        print(f"   - {len(categories)} categories")
        print(f"   - {len(templates)} templates")
        print(f"   - {len(collections)} collections")
        
        return True

if __name__ == "__main__":
    seeder = TemplateDataSeeder()
    success = seeder.run()
    exit(0 if success else 1)