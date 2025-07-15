import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { TrendingUp, DollarSign, Download, Star, Eye, Calendar, Award } from 'lucide-react';

const CreatorDashboard = ({ dashboardData, workspaceId }) => {
  const [period, setPeriod] = useState('30d');

  const periodOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const getGrowthColor = (value) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  const overview = dashboardData.overview || {};
  const topTemplates = dashboardData.top_templates || [];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Performance Overview</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Revenue & Sales Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span>Revenue Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(overview.total_revenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Period Revenue</span>
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(overview.period_revenue)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Revenue/Template</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(overview.total_revenue / Math.max(overview.total_templates, 1))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Sales Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Purchases</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatNumber(overview.total_purchases)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Period Purchases</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatNumber(overview.period_purchases)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-medium text-gray-900">
                  {overview.total_downloads > 0 
                    ? ((overview.total_purchases / overview.total_downloads) * 100).toFixed(1)
                    : '0'
                  }%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-purple-600" />
            <span>Activity Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {overview.total_templates || 0}
              </div>
              <div className="text-sm text-gray-600">Total Templates</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {overview.active_templates || 0}
              </div>
              <div className="text-sm text-gray-600">Active Templates</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatNumber(overview.total_downloads)}
              </div>
              <div className="text-sm text-gray-600">Total Downloads</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {(overview.total_revenue / Math.max(overview.total_downloads, 1)).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Revenue/Download</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <span>Top Performing Templates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topTemplates.length > 0 ? (
            <div className="space-y-4">
              {topTemplates.map((template, index) => (
                <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-gray-500">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{template.title}</div>
                      <div className="text-sm text-gray-500">
                        {template.download_count || 0} downloads
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">
                        {template.rating_average?.toFixed(1) || '0.0'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {formatNumber(template.download_count)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No template performance data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Template "Modern Email Newsletter" approved
                  </div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
              </div>
              <Badge variant="success" className="text-xs">Approved</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    New purchase: "Social Media Kit"
                  </div>
                  <div className="text-xs text-gray-500">1 day ago</div>
                </div>
              </div>
              <Badge variant="info" className="text-xs">$25.00</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Template "Landing Page Pro" under review
                  </div>
                  <div className="text-xs text-gray-500">3 days ago</div>
                </div>
              </div>
              <Badge variant="warning" className="text-xs">Pending</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorDashboard;