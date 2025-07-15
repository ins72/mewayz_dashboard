import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Star, Download, ShoppingCart, Eye, Heart, User } from 'lucide-react';

const TemplateGrid = ({ templates, viewMode, onTemplateClick, userPurchases }) => {
  const isPurchased = (templateId) => {
    return userPurchases.some(purchase => purchase.template?.id === templateId);
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'premium':
        return 'warning';
      case 'free':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const renderGridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => onTemplateClick(template)}
          >
            <CardHeader className="p-0">
              <div className="relative">
                <img
                  src={template.preview_image || '/api/placeholder/300/200'}
                  alt={template.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="absolute top-2 right-2 flex space-x-1">
                  {template.is_free && (
                    <Badge variant="success" className="text-xs">Free</Badge>
                  )}
                  {template.is_premium && (
                    <Badge variant="warning" className="text-xs">Premium</Badge>
                  )}
                  {isPurchased(template.id) && (
                    <Badge variant="info" className="text-xs">Owned</Badge>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-white text-xs">
                  <Star className="h-3 w-3 fill-current" />
                  <span>{template.rating_average?.toFixed(1) || '0.0'}</span>
                  <span>({template.rating_count || 0})</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-2">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600">
                  {template.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <User className="h-3 w-3" />
                  <span>{template.creator?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Download className="h-3 w-3" />
                  <span>{template.download_count || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="text-xs">
                    {template.category?.name || 'General'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {template.template_type?.replace('_', ' ') || 'Template'}
                  </Badge>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {formatPrice(template.price)}
                </div>
              </div>

              {template.tags && template.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {template.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {template.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onTemplateClick(template)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <img
                  src={template.preview_image || '/api/placeholder/150/100'}
                  alt={template.title}
                  className="w-24 h-16 object-cover rounded"
                />
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                      {template.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {template.is_free && (
                        <Badge variant="success" className="text-xs">Free</Badge>
                      )}
                      {template.is_premium && (
                        <Badge variant="warning" className="text-xs">Premium</Badge>
                      )}
                      {isPurchased(template.id) && (
                        <Badge variant="info" className="text-xs">Owned</Badge>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{template.creator?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{template.rating_average?.toFixed(1) || '0.0'}</span>
                        <span>({template.rating_count || 0})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-3 w-3" />
                        <span>{template.download_count || 0}</span>
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatPrice(template.price)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Found</h3>
        <p className="text-gray-600 mb-4">
          Try adjusting your filters or search terms to find templates.
        </p>
        <Button>
          <Eye className="h-4 w-4 mr-2" />
          Browse All Templates
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {templates.length} template{templates.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      {viewMode === 'grid' ? renderGridView() : renderListView()}
    </div>
  );
};

export default TemplateGrid;