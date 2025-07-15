import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Star, Download, ShoppingCart, Eye, User, Package, Percent } from 'lucide-react';

const CollectionGrid = ({ collections, onCollectionClick, userPurchases }) => {
  const isPurchased = (collectionId) => {
    return userPurchases.some(purchase => purchase.template_collection_id === collectionId);
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const getDiscountedPrice = (collection) => {
    if (collection.discount_percentage > 0) {
      return collection.price * (1 - collection.discount_percentage / 100);
    }
    return collection.price;
  };

  const getSavings = (collection) => {
    if (collection.discount_percentage > 0) {
      return collection.price - getDiscountedPrice(collection);
    }
    return 0;
  };

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Collections Found</h3>
        <p className="text-gray-600 mb-4">
          Collections are curated bundles of templates with special pricing.
        </p>
        <Button>
          <Eye className="h-4 w-4 mr-2" />
          Explore Templates
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {collections.length} collection{collections.length !== 1 ? 's' : ''} found
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <Card 
            key={collection.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => onCollectionClick(collection)}
          >
            <CardHeader className="p-0">
              <div className="relative">
                <img
                  src={collection.cover_image || '/api/placeholder/300/200'}
                  alt={collection.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                
                <div className="absolute top-2 right-2 flex space-x-1">
                  {collection.discount_percentage > 0 && (
                    <Badge variant="destructive" className="text-xs flex items-center">
                      <Percent className="h-3 w-3 mr-1" />
                      {collection.discount_percentage}% OFF
                    </Badge>
                  )}
                  {isPurchased(collection.id) && (
                    <Badge variant="info" className="text-xs">Owned</Badge>
                  )}
                </div>
                
                <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{collection.rating_average?.toFixed(1) || '0.0'}</span>
                    <span>({collection.rating_count || 0})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-white text-xs bg-black bg-opacity-50 px-2 py-1 rounded">
                    <Package className="h-3 w-3" />
                    <span>{collection.template_count || 0} templates</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600">
                  {collection.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {collection.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <User className="h-3 w-3" />
                  <span>{collection.creator?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Download className="h-3 w-3" />
                  <span>{collection.purchase_count || 0} sold</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {collection.template_count || 0} Templates
                  </Badge>
                  {collection.discount_percentage > 0 && (
                    <Badge variant="success" className="text-xs">
                      Save ${getSavings(collection).toFixed(2)}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  {collection.discount_percentage > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(collection.price)}
                    </div>
                  )}
                  <div className="text-lg font-bold text-gray-900">
                    {formatPrice(getDiscountedPrice(collection))}
                  </div>
                </div>
              </div>

              {collection.tags && collection.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {collection.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {collection.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{collection.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CollectionGrid;