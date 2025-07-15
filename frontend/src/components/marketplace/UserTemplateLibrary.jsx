import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Download, Eye, Calendar, Package, FileText, ExternalLink } from 'lucide-react';

const UserTemplateLibrary = ({ purchases, onTemplateClick }) => {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const sortOptions = [
    { value: 'newest', label: 'Recently Purchased' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'name', label: 'Name A-Z' },
    { value: 'type', label: 'Type' }
  ];

  const filterButtons = [
    { key: 'all', label: 'All Purchases', count: purchases.length },
    { key: 'templates', label: 'Templates', count: purchases.filter(p => p.template).length },
    { key: 'collections', label: 'Collections', count: purchases.filter(p => p.template_collection).length }
  ];

  const filteredPurchases = purchases.filter(purchase => {
    if (filter === 'templates') return purchase.template;
    if (filter === 'collections') return purchase.template_collection;
    return true;
  });

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.purchased_at) - new Date(b.purchased_at);
      case 'name':
        const nameA = a.template?.title || a.template_collection?.title || '';
        const nameB = b.template?.title || b.template_collection?.title || '';
        return nameA.localeCompare(nameB);
      case 'type':
        const typeA = a.template?.template_type || 'collection';
        const typeB = b.template?.template_type || 'collection';
        return typeA.localeCompare(typeB);
      case 'newest':
      default:
        return new Date(b.purchased_at) - new Date(a.purchased_at);
    }
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getItemDetails = (purchase) => {
    if (purchase.template) {
      return {
        title: purchase.template.title,
        type: purchase.template.template_type,
        image: purchase.template.preview_image,
        icon: FileText,
        item: purchase.template
      };
    } else if (purchase.template_collection) {
      return {
        title: purchase.template_collection.title,
        type: 'collection',
        image: purchase.template_collection.cover_image,
        icon: Package,
        item: purchase.template_collection
      };
    }
    return {
      title: 'Unknown Item',
      type: 'unknown',
      image: null,
      icon: FileText,
      item: null
    };
  };

  const getLicenseColor = (license) => {
    switch (license) {
      case 'standard':
        return 'secondary';
      case 'extended':
        return 'info';
      case 'commercial':
        return 'warning';
      case 'unlimited':
        return 'success';
      default:
        return 'secondary';
    }
  };

  if (purchases.length === 0) {
    return (
      <div className="text-center py-12">
        <Download className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Purchased Yet</h3>
        <p className="text-gray-600 mb-4">
          Start building your template library by purchasing templates from the marketplace.
        </p>
        <Button>
          <Eye className="h-4 w-4 mr-2" />
          Browse Templates
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sort */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-wrap gap-2">
              {filterButtons.map(({ key, label, count }) => (
                <Button
                  key={key}
                  variant={filter === key ? "default" : "outline"}
                  onClick={() => setFilter(key)}
                  className="flex items-center space-x-1"
                >
                  <span>{label}</span>
                  <Badge variant="secondary" className="ml-1">
                    {count}
                  </Badge>
                </Button>
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Purchase Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedPurchases.map((purchase) => {
          const { title, type, image, icon: ItemIcon, item } = getItemDetails(purchase);
          
          return (
            <Card 
              key={purchase.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => item && onTemplateClick(item)}
            >
              <CardHeader className="p-0">
                <div className="relative">
                  <img
                    src={image || '/api/placeholder/300/200'}
                    alt={title}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <Badge variant="info" className="text-xs">Owned</Badge>
                    <Badge variant={getLicenseColor(purchase.license_type)} className="text-xs">
                      {purchase.license_type?.toUpperCase() || 'STANDARD'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <ItemIcon className="h-4 w-4 text-gray-600" />
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {title}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {type.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Purchase Price:</span>
                    <span className="font-medium">{formatPrice(purchase.price)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>License:</span>
                    <Badge variant={getLicenseColor(purchase.license_type)} className="text-xs">
                      {purchase.license_type?.toUpperCase() || 'STANDARD'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Purchased:</span>
                    <span className="font-medium">{formatDate(purchase.purchased_at)}</span>
                  </div>
                  
                  {purchase.usage_limit > 0 && (
                    <div className="flex items-center justify-between">
                      <span>Usage:</span>
                      <span className="font-medium">
                        {purchase.usage_count || 0} / {purchase.usage_limit}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-4 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (item) onTemplateClick(item);
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle download/use action
                    }}
                    className="flex-1"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserTemplateLibrary;