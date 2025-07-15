import React from 'react';
import { useDashboard } from './DashboardProvider';
import MetricCard from './MetricCard';

const MetricsGrid = () => {
  const { goals, loading, checkPermission } = useDashboard();

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const enabledGoals = goals?.filter(goal => goal?.is_enabled && goal?.setup_completed) || [];
  
  // Generate dynamic metrics based on enabled goals
  const generateMetrics = () => {
    const allMetrics = [];

    enabledGoals.forEach(goal => {
      const goalColor = goal.icon_color || '#6B7280';
      
      switch (goal.slug) {
        case 'instagram':
          allMetrics.push(
            {
              title: 'Instagram Followers',
              value: 12500,
              format: 'number',
              trend: { value: 12.5, direction: 'up', period: 'vs last week' },
              chart: { type: 'line', data: [10800, 11200, 11600, 12100, 12500], color: goalColor },
              goal: 'instagram',
              permission: 'instagram.analytics.view'
            },
            {
              title: 'Instagram Engagement',
              value: 4.2,
              format: 'percentage',
              trend: { value: 8.3, direction: 'up', period: 'vs last week' },
              chart: { type: 'area', data: [3.8, 3.9, 4.1, 4.0, 4.2], color: goalColor },
              goal: 'instagram',
              permission: 'instagram.analytics.view'
            }
          );
          break;
          
        case 'link_in_bio':
          allMetrics.push(
            {
              title: 'Bio Link Clicks',
              value: 8340,
              format: 'number',
              trend: { value: -5.2, direction: 'down', period: 'vs last month' },
              chart: { type: 'bar', data: [9200, 8800, 8600, 8400, 8340], color: goalColor },
              goal: 'link_in_bio',
              permission: 'link_in_bio.analytics.view'
            },
            {
              title: 'Conversion Rate',
              value: 12.5,
              format: 'percentage',
              trend: { value: 15.7, direction: 'up', period: 'vs last month' },
              chart: { type: 'line', data: [10.8, 11.2, 11.9, 12.1, 12.5], color: goalColor },
              goal: 'link_in_bio',
              permission: 'link_in_bio.analytics.view'
            }
          );
          break;
          
        case 'courses':
          allMetrics.push(
            {
              title: 'Course Revenue',
              value: 45320,
              format: 'currency',
              trend: { value: 25.3, direction: 'up', period: 'vs last month' },
              chart: { type: 'area', data: [36000, 38500, 41200, 43800, 45320], color: goalColor },
              goal: 'courses',
              permission: 'courses.analytics.view'
            },
            {
              title: 'Active Students',
              value: 847,
              format: 'number',
              trend: { value: 18.9, direction: 'up', period: 'vs last month' },
              chart: { type: 'line', data: [710, 750, 790, 820, 847], color: goalColor },
              goal: 'courses',
              permission: 'courses.analytics.view'
            }
          );
          break;
          
        case 'ecommerce':
          allMetrics.push(
            {
              title: 'E-commerce Sales',
              value: 89560,
              format: 'currency',
              trend: { value: 22.1, direction: 'up', period: 'vs last month' },
              chart: { type: 'bar', data: [73000, 78000, 82000, 86000, 89560], color: goalColor },
              goal: 'ecommerce',
              permission: 'ecommerce.analytics.view'
            },
            {
              title: 'Total Orders',
              value: 234,
              format: 'number',
              trend: { value: 12.1, direction: 'up', period: 'vs last month' },
              chart: { type: 'line', data: [208, 215, 222, 228, 234], color: goalColor },
              goal: 'ecommerce',
              permission: 'ecommerce.analytics.view'
            }
          );
          break;
          
        case 'crm':
          allMetrics.push(
            {
              title: 'CRM Contacts',
              value: 2847,
              format: 'number',
              trend: { value: 9.7, direction: 'up', period: 'vs last month' },
              chart: { type: 'area', data: [2595, 2650, 2720, 2780, 2847], color: goalColor },
              goal: 'crm',
              permission: 'crm.analytics.view'
            },
            {
              title: 'Active Deals',
              value: 156,
              format: 'number',
              trend: { value: -3.4, direction: 'down', period: 'vs last month' },
              chart: { type: 'bar', data: [162, 159, 158, 157, 156], color: goalColor },
              goal: 'crm',
              permission: 'crm.analytics.view'
            }
          );
          break;
          
        case 'analytics':
          allMetrics.push(
            {
              title: 'Total Pageviews',
              value: 15620,
              format: 'number',
              trend: { value: 22.1, direction: 'up', period: 'vs last month' },
              chart: { type: 'line', data: [12800, 13400, 14200, 14900, 15620], color: goalColor },
              goal: 'analytics',
              permission: 'analytics.view'
            },
            {
              title: 'Active Sessions',
              value: 4580,
              format: 'number',
              trend: { value: 14.8, direction: 'up', period: 'vs last month' },
              chart: { type: 'area', data: [3990, 4120, 4280, 4420, 4580], color: goalColor },
              goal: 'analytics',
              permission: 'analytics.view'
            }
          );
          break;
      }
    });

    return allMetrics;
  };

  const metrics = generateMetrics();

  // Filter metrics based on permissions
  const visibleMetrics = metrics.filter(metric => 
    checkPermission(metric.permission)
  );

  if (visibleMetrics.length === 0) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Key Metrics
          </h2>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📊</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Metrics Available
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Set up your goals to start tracking key performance metrics for your workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Key Metrics
        </h2>
        <button className="text-sm text-blue-600 hover:text-blue-700 transition-colors">
          View All Analytics →
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMetrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            format={metric.format}
            trend={metric.trend}
            chart={metric.chart}
            goal={metric.goal}
          />
        ))}
      </div>
    </div>
  );
};

export default MetricsGrid;