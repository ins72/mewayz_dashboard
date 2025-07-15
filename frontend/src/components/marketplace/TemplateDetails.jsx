import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/Input';
import TemplateMarketplaceService from '../../services/templateMarketplaceService';
import { X, Star, Download, ShoppingCart, Eye, User, Package, Calendar, Heart, Flag, Check, CreditCard } from 'lucide-react';

const TemplateDetails = ({ template, isOpen, onClose, onPurchaseComplete, workspaceId }) => {
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    review: '',
    pros: [],
    cons: []
  });

  useEffect(() => {
    if (isOpen && template) {
      fetchReviews();
    }
  }, [isOpen, template]);

  const fetchReviews = async () => {
    try {
      const response = await TemplateMarketplaceService.getTemplateReviews(template.id);
      if (response.success) {
        setReviews(response.reviews?.data || []);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handlePurchase = async () => {
    if (!workspaceId) {
      alert('Please select a workspace first');
      return;
    }

    setLoading(true);
    try {
      const response = await TemplateMarketplaceService.purchaseTemplate({
        workspace_id: workspaceId,
        template_id: template.id,
        license_type: 'standard',
        payment_method: 'credit_card'
      });

      if (response.success) {
        alert(response.message);
        onPurchaseComplete();
      } else {
        alert(response.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing template:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!workspaceId) {
      alert('Please select a workspace first');
      return;
    }

    try {
      const response = await TemplateMarketplaceService.submitTemplateReview({
        template_id: template.id,
        workspace_id: workspaceId,
        ...reviewData
      });

      if (response.success) {
        alert('Review submitted successfully!');
        setShowReviewForm(false);
        setReviewData({
          rating: 5,
          title: '',
          review: '',
          pros: [],
          cons: []
        });
        fetchReviews();
      } else {
        alert(response.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Template Details</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Template Header */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <img
                src={template.preview_image || '/api/placeholder/600/400'}
                alt={template.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{template.title}</h3>
                <p className="text-gray-600">{template.description}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(Math.floor(template.rating_average || 0))}
                  <span className="text-sm text-gray-600">
                    {template.rating_average?.toFixed(1) || '0.0'} ({template.rating_count || 0} reviews)
                  </span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Download className="h-4 w-4" />
                  <span>{template.download_count || 0} downloads</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="outline">{template.category?.name || 'General'}</Badge>
                <Badge variant="outline">{template.template_type?.replace('_', ' ')}</Badge>
                {template.is_free && <Badge variant="success">Free</Badge>}
                {template.is_premium && <Badge variant="warning">Premium</Badge>}
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>by {template.creator?.name || 'Unknown'}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {formatPrice(template.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {template.license_type?.toUpperCase() || 'STANDARD'} License
                  </div>
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {template.price === 0 ? (
                        <>
                          <Download className="h-4 w-4" />
                          <span>Get Free Template</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4" />
                          <span>Purchase Template</span>
                        </>
                      )}
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Template Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Features */}
            {template.features && template.features.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Check className="h-5 w-5" />
                    <span>Features</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {template.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {template.requirements && template.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {template.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tags */}
          {template.tags && template.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {template.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5" />
                  <span>Reviews ({reviews.length})</span>
                </CardTitle>
                <Button
                  variant="outline"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  Write Review
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showReviewForm && (
                <form onSubmit={handleReviewSubmit} className="mb-6 p-4 border rounded-lg">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewData({...reviewData, rating: i + 1})}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-6 w-6 ${i < reviewData.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <Input
                        type="text"
                        value={reviewData.title}
                        onChange={(e) => setReviewData({...reviewData, title: e.target.value})}
                        placeholder="Review title..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Review
                      </label>
                      <textarea
                        value={reviewData.review}
                        onChange={(e) => setReviewData({...reviewData, review: e.target.value})}
                        placeholder="Write your review..."
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="flex space-x-2">
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        Submit Review
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowReviewForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{review.user?.name || 'Anonymous'}</span>
                            {review.is_verified_purchase && (
                              <Badge variant="success" className="text-xs">Verified Purchase</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-gray-500">
                              {formatDate(review.reviewed_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4" />
                            <span className="ml-1">{review.helpful_count || 0}</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Flag className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {review.title && (
                        <h4 className="font-medium mb-2">{review.title}</h4>
                      )}
                      
                      <p className="text-gray-600 text-sm">{review.review}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">No reviews yet. Be the first to review this template!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Templates */}
          {template.related_templates && template.related_templates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {template.related_templates.map((relatedTemplate) => (
                    <div key={relatedTemplate.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <img
                        src={relatedTemplate.preview_image || '/api/placeholder/200/150'}
                        alt={relatedTemplate.title}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                      <h4 className="font-medium text-sm mb-1">{relatedTemplate.title}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          {renderStars(Math.floor(relatedTemplate.rating_average || 0))}
                        </div>
                        <span className="text-sm font-bold">
                          {formatPrice(relatedTemplate.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateDetails;