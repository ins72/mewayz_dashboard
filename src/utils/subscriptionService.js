import { supabase } from './supabase';

class SubscriptionService {
  // Get all subscription plans
  async getSubscriptionPlans() {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('base_price_monthly', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to load subscription plans' 
      };
    }
  }

  // Get plan by slug
  async getPlanBySlug(slug) {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to load subscription plan' 
      };
    }
  }

  // Calculate subscription cost
  calculateSubscriptionCost(plan, billingCycle, selectedFeatureCount = 0) {
    const isYearly = billingCycle === 'yearly';
    
    if (plan?.slug === 'free') {
      return {
        monthly: 0,
        yearly: 0,
        savings: 0
      };
    }

    let basePrice = isYearly ? plan?.base_price_yearly || 0 : plan?.base_price_monthly || 0;
    let featurePrice = 0;

    if (plan?.pricing_model === 'feature_based') {
      const featureCost = isYearly ? plan?.feature_price_yearly || 0 : plan?.feature_price_monthly || 0;
      featurePrice = featureCost * selectedFeatureCount;
    }

    const totalPrice = basePrice + featurePrice;
    const monthlyEquivalent = isYearly ? totalPrice / 12 : totalPrice;
    const yearlyEquivalent = isYearly ? totalPrice : totalPrice * 12;
    
    // Calculate savings for yearly billing
    const monthlyTotal = plan?.base_price_monthly || 0;
    const monthlyFeatureCost = (plan?.feature_price_monthly || 0) * selectedFeatureCount;
    const fullMonthlyPrice = monthlyTotal + monthlyFeatureCost;
    const yearlyFromMonthly = fullMonthlyPrice * 12;
    const savings = Math.max(0, yearlyFromMonthly - yearlyEquivalent);

    return {
      monthly: monthlyEquivalent,
      yearly: yearlyEquivalent,
      savings: isYearly ? savings : 0
    };
  }

  // Create Stripe checkout session
  async createCheckoutSession(workspaceId, planId, billingCycle, selectedFeatureCount) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user?.user?.id) {
        return { success: false, error: 'User not authenticated' };
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          workspaceId,
          planId,
          billingCycle,
          selectedFeatureCount,
          userId: user.user.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to create checkout session' };
      }

      return { success: true, data: result };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to payment service. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to create checkout session' 
      };
    }
  }

  // Get workspace subscription
  async getWorkspaceSubscription(workspaceId) {
    try {
      const { data, error } = await supabase
        .from('workspace_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('workspace_id', workspaceId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to load subscription' 
      };
    }
  }

  // Update workspace subscription
  async updateWorkspaceSubscription(workspaceId, subscriptionData) {
    try {
      const { data, error } = await supabase
        .from('workspace_subscriptions')
        .upsert({
          workspace_id: workspaceId,
          plan_id: subscriptionData.planId,
          status: subscriptionData.status || 'active',
          stripe_subscription_id: subscriptionData.stripeSubscriptionId,
          stripe_customer_id: subscriptionData.stripeCustomerId,
          current_period_start: subscriptionData.currentPeriodStart,
          current_period_end: subscriptionData.currentPeriodEnd,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to update subscription' 
      };
    }
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;