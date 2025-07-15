import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import Button from '../../components/ui/Button';
import { CheckCircle, ArrowRight, ArrowLeft, Package, Star, DollarSign, Filter } from 'lucide-react';

const FeatureSelectionStep = () => {
  const {
    AVAILABLE_FEATURES,
    selectedGoals,
    selectedFeatures,
    setSelectedFeatures,
    completeStep,
    goToNextStep,
    goToPreviousStep,
    getRecommendedFeatures,
    ONBOARDING_STEPS
  } = useOnboarding();

  const [tempSelectedFeatures, setTempSelectedFeatures] = useState(selectedFeatures);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showRecommendedOnly, setShowRecommendedOnly] = useState(true);

  const recommendedFeatures = getRecommendedFeatures();

  // Get unique categories
  const categories = ['all', ...new Set(AVAILABLE_FEATURES.map(f => f.category))];

  // Filter features based on selected filters
  const filteredFeatures = AVAILABLE_FEATURES.filter(feature => {
    const categoryMatch = filterCategory === 'all' || feature.category === filterCategory;
    const recommendedMatch = !showRecommendedOnly || recommendedFeatures.find(rf => rf.id === feature.id);
    
    return categoryMatch && recommendedMatch;
  });

  // Calculate total cost
  const totalCost = tempSelectedFeatures.reduce((sum, featureId) => {
    const feature = AVAILABLE_FEATURES.find(f => f.id === featureId);
    return sum + (feature ? feature.price : 0);
  }, 0);

  const handleFeatureToggle = (featureId) => {
    setTempSelectedFeatures(prev => {
      if (prev.includes(featureId)) {
        return prev.filter(id => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };

  const handleSelectRecommended = () => {
    const recommendedIds = recommendedFeatures.map(f => f.id);
    setTempSelectedFeatures(prev => {
      const newFeatures = [...prev];
      recommendedIds.forEach(id => {
        if (!newFeatures.includes(id)) {
          newFeatures.push(id);
        }
      });
      return newFeatures;
    });
  };

  const handleContinue = () => {
    setSelectedFeatures(tempSelectedFeatures);
    completeStep(ONBOARDING_STEPS.FEATURE_SELECTION);
    goToNextStep();
  };

  const getCategoryDisplayName = (category) => {
    const names = {
      social_media: 'Social Media',
      link_in_bio: 'Link in Bio',
      ecommerce: 'E-commerce',
      crm: 'CRM',
      courses: 'Courses',
      website: 'Website',
      analytics: 'Analytics',
      marketing: 'Marketing',
      integration: 'Integration'
    };
    return names[category] || category;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Mewayz</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Step 2 of 6: Feature Selection
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-2">
          <div className="w-full bg-muted/20 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: '33.33%' }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Choose your features
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Select the specific features you need. We've recommended features based on your goals.
            </p>
          </div>

          {/* Filters and Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-border rounded-lg px-3 py-2 bg-background"
              >
                <option value="all">All Categories</option>
                {categories.slice(1).map(category => (
                  <option key={category} value={category}>
                    {getCategoryDisplayName(category)}
                  </option>
                ))}
              </select>
            </div>

            {/* Recommended Filter */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recommended"
                checked={showRecommendedOnly}
                onChange={(e) => setShowRecommendedOnly(e.target.checked)}
                className="rounded border-border"
              />
              <label htmlFor="recommended" className="text-sm text-muted-foreground">
                Show recommended only
              </label>
            </div>

            {/* Quick Select */}
            <div className="flex-1 flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectRecommended}
              >
                <Star className="w-4 h-4 mr-2" />
                Select All Recommended
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filteredFeatures.map((feature) => {
              const isSelected = tempSelectedFeatures.includes(feature.id);
              const isRecommended = recommendedFeatures.find(rf => rf.id === feature.id);
              
              return (
                <div
                  key={feature.id}
                  onClick={() => handleFeatureToggle(feature.id)}
                  className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-lg'
                      : 'border-border bg-card hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  {/* Recommended Badge */}
                  {isRecommended && (
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        Recommended
                      </span>
                    </div>
                  )}

                  {/* Selection Indicator */}
                  <div className="absolute top-2 right-2">
                    {isSelected ? (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-muted-foreground rounded-full"></div>
                    )}
                  </div>

                  {/* Feature Content */}
                  <div className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-foreground">
                        {feature.name}
                      </h3>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {getCategoryDisplayName(feature.category)}
                      </span>
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <DollarSign className="w-4 h-4" />
                        {feature.price}/month
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selection Summary */}
          {tempSelectedFeatures.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Selected Features ({tempSelectedFeatures.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedFeatures.slice(0, 5).map(featureId => {
                      const feature = AVAILABLE_FEATURES.find(f => f.id === featureId);
                      return (
                        <span
                          key={featureId}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-900"
                        >
                          {feature.name}
                        </span>
                      );
                    })}
                    {tempSelectedFeatures.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-900">
                        +{tempSelectedFeatures.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">
                    ${totalCost}/month
                  </div>
                  <div className="text-sm text-blue-700">
                    Estimated monthly cost
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              size="lg"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            
            <Button
              onClick={handleContinue}
              disabled={tempSelectedFeatures.length === 0}
              size="lg"
              className="min-w-[200px]"
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Help Text */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              You can add or remove features after setup. Start with the essentials and expand as needed.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FeatureSelectionStep;