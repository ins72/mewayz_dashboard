import React from 'react';
import { useDashboard } from './DashboardProvider';
import QuickActionCard from './QuickActionCard';

const QuickActionsGrid = () => {
  const { goals, features, loading, checkPermission, hasFeatureAccess } = useDashboard();

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const enabledGoals = goals?.filter(goal => goal?.is_enabled) || [];

  // Generate quick actions based on enabled goals and user permissions
  const generateQuickActions = () => {
    const actions = [];

    enabledGoals.forEach(goal => {
      const goalColor = goal.icon_color || '#6B7280';
      
      switch (goal.slug) {
        case 'instagram':
          if (hasFeatureAccess('post_scheduler')) {
            actions.push({
              id: 'instagram_post_scheduler',
              name: 'Schedule Posts',
              icon: 'Calendar',
              color: goalColor,
              route: '/instagram/scheduler',
              goal: 'instagram',
              feature: 'post_scheduler',
              description: 'Schedule Instagram posts'
            });
          }
          if (hasFeatureAccess('content_calendar')) {
            actions.push({
              id: 'instagram_calendar',
              name: 'Content Calendar',
              icon: 'CalendarDays',
              color: goalColor,
              route: '/instagram/calendar',
              goal: 'instagram',
              feature: 'content_calendar',
              description: 'View content calendar'
            });
          }
          if (hasFeatureAccess('instagram_insights')) {
            actions.push({
              id: 'instagram_analytics',
              name: 'Analytics',
              icon: 'BarChart3',
              color: goalColor,
              route: '/instagram/analytics',
              goal: 'instagram',
              feature: 'instagram_insights',
              description: 'View Instagram analytics'
            });
          }
          break;
          
        case 'link_in_bio':
          if (hasFeatureAccess('custom_landing_pages')) {
            actions.push({
              id: 'bio_page_builder',
              name: 'Page Builder',
              icon: 'Layout',
              color: goalColor,
              route: '/bio/builder',
              goal: 'link_in_bio',
              feature: 'custom_landing_pages',
              description: 'Build bio link pages'
            });
          }
          if (hasFeatureAccess('qr_code_generator')) {
            actions.push({
              id: 'bio_qr_generator',
              name: 'QR Generator',
              icon: 'QrCode',
              color: goalColor,
              route: '/bio/qr',
              goal: 'link_in_bio',
              feature: 'qr_code_generator',
              description: 'Generate QR codes'
            });
          }
          if (hasFeatureAccess('link_analytics')) {
            actions.push({
              id: 'bio_analytics',
              name: 'Link Analytics',
              icon: 'MousePointer',
              color: goalColor,
              route: '/bio/analytics',
              goal: 'link_in_bio',
              feature: 'link_analytics',
              description: 'Track link performance'
            });
          }
          break;
          
        case 'courses':
          if (hasFeatureAccess('video_hosting')) {
            actions.push({
              id: 'course_builder',
              name: 'Course Builder',
              icon: 'BookOpen',
              color: goalColor,
              route: '/courses/builder',
              goal: 'courses',
              feature: 'video_hosting',
              description: 'Create new courses'
            });
          }
          if (hasFeatureAccess('student_progress')) {
            actions.push({
              id: 'student_management',
              name: 'Students',
              icon: 'Users',
              color: goalColor,
              route: '/courses/students',
              goal: 'courses',
              feature: 'student_progress',
              description: 'Manage students'
            });
          }
          if (hasFeatureAccess('certificate_generator')) {
            actions.push({
              id: 'certificates',
              name: 'Certificates',
              icon: 'Award',
              color: goalColor,
              route: '/courses/certificates',
              goal: 'courses',
              feature: 'certificate_generator',
              description: 'Manage certificates'
            });
          }
          break;
          
        case 'ecommerce':
          if (hasFeatureAccess('product_catalog')) {
            actions.push({
              id: 'product_catalog',
              name: 'Products',
              icon: 'Package',
              color: goalColor,
              route: '/ecommerce/products',
              goal: 'ecommerce',
              feature: 'product_catalog',
              description: 'Manage products'
            });
          }
          if (hasFeatureAccess('order_management')) {
            actions.push({
              id: 'order_management',
              name: 'Orders',
              icon: 'ShoppingCart',
              color: goalColor,
              route: '/ecommerce/orders',
              goal: 'ecommerce',
              feature: 'order_management',
              description: 'Manage orders'
            });
          }
          if (hasFeatureAccess('inventory_management')) {
            actions.push({
              id: 'inventory',
              name: 'Inventory',
              icon: 'Warehouse',
              color: goalColor,
              route: '/ecommerce/inventory',
              goal: 'ecommerce',
              feature: 'inventory_management',
              description: 'Track inventory'
            });
          }
          break;
          
        case 'crm':
          if (hasFeatureAccess('contact_management')) {
            actions.push({
              id: 'contact_management',
              name: 'Contacts',
              icon: 'AddressBook',
              color: goalColor,
              route: '/crm/contacts',
              goal: 'crm',
              feature: 'contact_management',
              description: 'Manage contacts'
            });
          }
          if (hasFeatureAccess('sales_pipeline')) {
            actions.push({
              id: 'sales_pipeline',
              name: 'Pipeline',
              icon: 'TrendingUp',
              color: goalColor,
              route: '/crm/pipeline',
              goal: 'crm',
              feature: 'sales_pipeline',
              description: 'Sales pipeline'
            });
          }
          if (hasFeatureAccess('email_templates')) {
            actions.push({
              id: 'email_marketing',
              name: 'Email Marketing',
              icon: 'Mail',
              color: goalColor,
              route: '/crm/email',
              goal: 'crm',
              feature: 'email_templates',
              description: 'Email campaigns'
            });
          }
          break;
          
        case 'analytics':
          if (hasFeatureAccess('cross_platform_analytics')) {
            actions.push({
              id: 'unified_dashboard',
              name: 'Dashboard',
              icon: 'LayoutDashboard',
              color: goalColor,
              route: '/analytics/dashboard',
              goal: 'analytics',
              feature: 'cross_platform_analytics',
              description: 'Unified dashboard'
            });
          }
          if (hasFeatureAccess('custom_reports')) {
            actions.push({
              id: 'custom_reports',
              name: 'Reports',
              icon: 'FileBarChart',
              color: goalColor,
              route: '/analytics/reports',
              goal: 'analytics',
              feature: 'custom_reports',
              description: 'Custom reports'
            });
          }
          if (hasFeatureAccess('goal_tracking')) {
            actions.push({
              id: 'goal_tracking',
              name: 'Goals',
              icon: 'Target',
              color: goalColor,
              route: '/analytics/goals',
              goal: 'analytics',
              feature: 'goal_tracking',
              description: 'Track goals'
            });
          }
          break;
      }
    });

    // Add general workspace actions
    if (checkPermission('workspace.settings.view')) {
      actions.push({
        id: 'workspace_settings',
        name: 'Settings',
        icon: 'Settings',
        color: '#6B7280',
        route: '/settings',
        description: 'Workspace settings',
        general: true
      });
    }

    if (checkPermission('team.manage')) {
      actions.push({
        id: 'team_management',
        name: 'Team',
        icon: 'Users',
        color: '#6B7280',
        route: '/team',
        description: 'Manage team',
        general: true
      });
    }

    return actions.slice(0, 12); // Limit to 12 actions for layout
  };

  const quickActions = generateQuickActions();

  if (quickActions.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Quick Actions
          </h2>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Quick Actions Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Enable goals and features to access quick actions for your workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
          View All →
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {quickActions.map((action) => (
          <QuickActionCard
            key={action.id}
            action={action}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;