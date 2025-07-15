import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { FileText, Edit, Trash2, Eye, Send, MoreHorizontal } from 'lucide-react';

const CreatorTemplateGrid = ({ templates, filters, onFiltersChange, onTemplateEdit, onTemplateDelete, onTemplatePublish }) => {
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'archived', label: 'Archived' }
  ];

  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'email', label: 'Email' },
    { value: 'link_in_bio', label: 'Link in Bio' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'course', label: 'Course' },
    { value: 'landing_page', label: 'Landing Page' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'draft':
        return 'secondary';
      case 'inactive':
        return 'warning';
      case 'archived':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => onFiltersChange({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.type}
                onChange={(e) => onFiltersChange({...filters, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={filters.sort_by}
                onChange={(e) => onFiltersChange({...filters, sort_by: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                      {template.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getStatusColor(template.status)} className="text-xs">
                        {template.status}
                      </Badge>
                      <Badge variant={getApprovalStatusColor(template.approval_status)} className="text-xs">
                        {template.approval_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTemplateEdit(template)}
                      className="p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onTemplateDelete(template.id)}
                      className="p-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {template.download_count || 0}
                    </div>
                    <div className="text-gray-500">Downloads</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {template.purchase_count || 0}
                    </div>
                    <div className="text-gray-500">Purchases</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      {template.rating_average?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-gray-500">Rating</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div>
                    <Badge variant="outline" className="text-xs">
                      {template.template_type?.replace('_', ' ') || 'General'}
                    </Badge>
                  </div>
                  <div>
                    {formatDate(template.created_at)}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onTemplateEdit(template)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  {template.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => onTemplatePublish(template.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-3 w-3 mr-1" />
                      Publish
                    </Button>
                  )}
                  
                  {template.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Handle view in marketplace
                        window.open(`/template-marketplace?template=${template.id}`, '_blank');
                      }}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
          <p className="text-gray-600 mb-4">
            {filters.status || filters.type 
              ? 'No templates match your current filters.'
              : 'You haven\'t created any templates yet.'
            }
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            Create Your First Template
          </Button>
        </div>
      )}
    </div>
  );
};

export default CreatorTemplateGrid;