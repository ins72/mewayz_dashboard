import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Filter, X } from 'lucide-react';

const TemplateFilters = ({ filters, categories, onFilterChange, onClearFilters }) => {
  const templateTypes = [
    { value: 'email', label: 'Email Templates' },
    { value: 'link_in_bio', label: 'Link in Bio' },
    { value: 'course', label: 'Course Templates' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'landing_page', label: 'Landing Pages' },
    { value: 'newsletter', label: 'Newsletter' },
    { value: 'blog_post', label: 'Blog Post' }
  ];

  const priceRanges = [
    { value: '0-0', label: 'Free' },
    { value: '0-10', label: 'Under $10' },
    { value: '10-25', label: '$10 - $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-999', label: '$100+' }
  ];

  const sortOptions = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const hasActiveFilters = () => {
    return filters.category || filters.type || filters.price_range || 
           filters.is_free !== null || filters.is_premium !== null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </CardTitle>
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sort_by}
              onChange={(e) => onFilterChange('sort_by', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.template_count || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Template Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => onFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              {templateTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <select
              value={filters.price_range}
              onChange={(e) => onFilterChange('price_range', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Prices</option>
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Free/Premium Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Access
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.is_free === true}
                  onChange={(e) => onFilterChange('is_free', e.target.checked ? true : null)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Free Templates</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.is_premium === true}
                  onChange={(e) => onFilterChange('is_premium', e.target.checked ? true : null)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Premium Templates</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {hasActiveFilters() && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="outline" className="text-xs">
                  Category: {categories.find(c => c.id === filters.category)?.name}
                  <button
                    onClick={() => onFilterChange('category', '')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.type && (
                <Badge variant="outline" className="text-xs">
                  Type: {templateTypes.find(t => t.value === filters.type)?.label}
                  <button
                    onClick={() => onFilterChange('type', '')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.price_range && (
                <Badge variant="outline" className="text-xs">
                  Price: {priceRanges.find(p => p.value === filters.price_range)?.label}
                  <button
                    onClick={() => onFilterChange('price_range', '')}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.is_free === true && (
                <Badge variant="outline" className="text-xs">
                  Free Only
                  <button
                    onClick={() => onFilterChange('is_free', null)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.is_premium === true && (
                <Badge variant="outline" className="text-xs">
                  Premium Only
                  <button
                    onClick={() => onFilterChange('is_premium', null)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateFilters;