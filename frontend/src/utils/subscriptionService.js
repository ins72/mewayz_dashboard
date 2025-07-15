/**
 * Subscription Service
 * Handles subscription plans, billing, and feature-based pricing
 */

import apiClient from './apiClient';

class SubscriptionService {
  /**
   * Get all available subscription plans
   * @returns {Promise} API response with subscription plans
   */
  async getSubscriptionPlans() {
    try {
      const response = await apiClient.get('/subscription/plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  /**
   * Calculate subscription cost based on plan and features
   * @param {Object} plan - The subscription plan
   * @param {string} billingCycle - 'monthly' or 'yearly'
   * @param {number} featureCount - Number of features selected
   * @returns {Object} Cost calculation details
   */
  calculateSubscriptionCost(plan, billingCycle = 'monthly', featureCount = 0) {
    let baseCost = 0;
    let featureCost = 0;
    let totalCost = 0;
    let yearlyDiscount = 0;

    switch (plan.slug) {
      case 'free':
        baseCost = 0;
        featureCost = 0;
        totalCost = 0;
        break;
      
      case 'professional':
        baseCost = 0;
        featureCost = billingCycle === 'yearly' ? 10 * featureCount : 1 * featureCount;
        totalCost = baseCost + featureCost;
        if (billingCycle === 'yearly') {
          yearlyDiscount = (1 * featureCount * 12) - featureCost;
        }
        break;
      
      case 'enterprise':
        baseCost = 0;
        featureCost = billingCycle === 'yearly' ? 15 * featureCount : 1.5 * featureCount;
        totalCost = baseCost + featureCost;
        if (billingCycle === 'yearly') {
          yearlyDiscount = (1.5 * featureCount * 12) - featureCost;
        }
        break;
      
      default:
        baseCost = 0;
        featureCost = 0;
        totalCost = 0;
    }

    return {
      baseCost,
      featureCost,
      totalCost,
      yearlyDiscount,
      billingCycle,
      featureCount,
      costPerFeature: plan.slug === 'free' ? 0 : (plan.slug === 'professional' ? 1 : 1.5)
    };
  }

  /**
   * Get mock subscription plans for development
   * @returns {Array} Mock subscription plans
   */
  getMockSubscriptionPlans() {
    return [
      {
        id: '1',
        slug: 'free',
        name: 'Free Plan',
        description: 'Perfect for getting started',
        pricing_model: 'fixed',
        features: [
          'Up to 10 features',
          'Basic functionality',
          'Community support',
          'Mewayz branding on external content'
        ],
        limitations: [
          'Limited to 10 features',
          'Basic analytics',
          'Community support only',
          'Mewayz branding required'
        ],
        price_monthly: 0,
        price_yearly: 0,
        max_features: 10,
        popular: false,
        color: 'gray'
      },
      {
        id: '2',
        slug: 'professional',
        name: 'Professional Plan',
        description: 'For growing businesses',
        pricing_model: 'feature_based',
        features: [
          '$1 per feature per month',
          '$10 per feature per year',
          'Advanced functionality',
          'Priority support',
          'Mewayz branding on external content',
          'Advanced analytics',
          'Team collaboration'
        ],
        limitations: [
          'Mewayz branding on external content',
          'Standard support hours'
        ],
        price_monthly: 1,
        price_yearly: 10,
        max_features: 50,
        popular: true,
        color: 'blue'
      },
      {
        id: '3',
        slug: 'enterprise',
        name: 'Enterprise Plan',
        description: 'For large organizations',
        pricing_model: 'feature_based',
        features: [
          '$1.50 per feature per month',
          '$15 per feature per year',
          'White-label capabilities',
          'Custom branding options',
          'Dedicated account management',
          'Advanced analytics and reporting',
          'Priority support',
          'Custom integrations',
          'Advanced security'
        ],
        limitations: [],
        price_monthly: 1.5,
        price_yearly: 15,
        max_features: 100,
        popular: false,
        color: 'purple'
      }
    ];
  }

  /**
   * Create a new subscription
   * @param {Object} subscriptionData - The subscription data
   * @returns {Promise} API response
   */
  async createSubscription(subscriptionData) {
    try {
      const response = await apiClient.post('/subscriptions', subscriptionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update subscription
   * @param {string} subscriptionId - The subscription ID
   * @param {Object} updateData - The update data
   * @returns {Promise} API response
   */
  async updateSubscription(subscriptionId, updateData) {
    try {
      const response = await apiClient.put(`/subscriptions/${subscriptionId}`, updateData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel subscription
   * @param {string} subscriptionId - The subscription ID
   * @returns {Promise} API response
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await apiClient.delete(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user's current subscription
   * @returns {Promise} API response
   */
  async getCurrentSubscription() {
    try {
      const response = await apiClient.get('/subscription/current');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get subscription usage statistics
   * @returns {Promise} API response
   */
  async getSubscriptionUsage() {
    try {
      const response = await apiClient.get('/subscription/usage');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create Stripe checkout session
   * @param {Object} checkoutData - The checkout data
   * @returns {Promise} API response
   */
  async createCheckoutSession(checkoutData) {
    try {
      const response = await apiClient.post('/subscription/checkout', checkoutData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create free subscription
   * @param {Object} subscriptionData - The subscription data
   * @returns {Promise} API response
   */
  async createFreeSubscription(subscriptionData) {
    try {
      const response = await apiClient.post('/subscription/free', subscriptionData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate feature limits for plan
   * @param {string} planSlug - The plan slug
   * @param {number} featureCount - Number of features
   * @returns {Object} Validation result
   */
  validateFeatureLimits(planSlug, featureCount) {
    const plans = this.getMockSubscriptionPlans();
    const plan = plans.find(p => p.slug === planSlug);
    
    if (!plan) {
      return {
        valid: false,
        error: 'Invalid plan selected'
      };
    }

    if (featureCount > plan.max_features) {
      return {
        valid: false,
        error: `${plan.name} is limited to ${plan.max_features} features. You have selected ${featureCount} features.`,
        maxFeatures: plan.max_features
      };
    }

    return {
      valid: true,
      plan,
      featureCount
    };
  }
}

export default new SubscriptionService();