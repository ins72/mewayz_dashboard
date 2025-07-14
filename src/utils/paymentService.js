import { loadStripe } from '@stripe/stripe-js';
import apiClient from './apiClient';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

class PaymentService {
  constructor() {
    this.stripe = stripePromise;
  }

  /**
   * Get available subscription packages
   */
  async getPackages() {
    try {
      const response = await apiClient.get('/payments/packages');
      return {
        success: true,
        data: response.data.packages
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch packages'
      };
    }
  }

  /**
   * Create a checkout session for subscription
   */
  async createCheckoutSession(packageId, workspaceId) {
    try {
      const response = await apiClient.post('/payments/checkout/session', {
        package_id: packageId,
        workspace_id: workspaceId,
        origin_url: window.location.origin
      });

      if (response.data.success) {
        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        error: response.data.message || 'Failed to create checkout session'
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create checkout session'
      };
    }
  }

  /**
   * Redirect to Stripe checkout
   */
  async redirectToCheckout(sessionId) {
    try {
      const stripe = await this.stripe;
      const { error } = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to redirect to checkout'
      };
    }
  }

  /**
   * Process subscription payment
   */
  async processSubscriptionPayment(packageId, workspaceId) {
    try {
      // Create checkout session
      const sessionResult = await this.createCheckoutSession(packageId, workspaceId);
      
      if (!sessionResult.success) {
        return sessionResult;
      }

      // Redirect to Stripe checkout
      const redirectResult = await this.redirectToCheckout(sessionResult.data.session_id);
      
      return redirectResult;
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process payment'
      };
    }
  }

  /**
   * Get checkout session status
   */
  async getCheckoutStatus(sessionId) {
    try {
      const response = await apiClient.get(`/payments/checkout/status/${sessionId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get checkout status'
      };
    }
  }

  /**
   * Get user's payment transactions
   */
  async getTransactions(params = {}) {
    try {
      const response = await apiClient.get('/payments/transactions', { params });
      return {
        success: true,
        data: response.data.transactions
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch transactions'
      };
    }
  }

  /**
   * Get workspace subscription details
   */
  async getSubscription(workspaceId) {
    try {
      const response = await apiClient.get(`/payments/subscription/${workspaceId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch subscription'
      };
    }
  }

  /**
   * Format currency amount
   */
  formatAmount(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase()
    }).format(amount);
  }

  /**
   * Get package display information
   */
  getPackageInfo(packageId) {
    const packages = {
      basic: {
        name: 'Basic Plan',
        price: 29.99,
        currency: 'USD',
        features: ['5 Workspaces', 'Basic Support', 'Social Media Tools'],
        color: 'blue',
        popular: false
      },
      professional: {
        name: 'Professional Plan',
        price: 79.99,
        currency: 'USD',
        features: ['15 Workspaces', 'Priority Support', 'Advanced Analytics', 'CRM Tools'],
        color: 'green',
        popular: true
      },
      enterprise: {
        name: 'Enterprise Plan',
        price: 199.99,
        currency: 'USD',
        features: ['Unlimited Workspaces', '24/7 Support', 'Custom Integrations', 'API Access'],
        color: 'purple',
        popular: false
      }
    };

    return packages[packageId] || null;
  }

  /**
   * Validate payment form data
   */
  validatePaymentData(data) {
    const errors = {};

    if (!data.packageId) {
      errors.packageId = 'Package selection is required';
    }

    if (!data.workspaceId) {
      errors.workspaceId = 'Workspace selection is required';
    }

    const packageInfo = this.getPackageInfo(data.packageId);
    if (!packageInfo) {
      errors.packageId = 'Invalid package selected';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Handle payment success
   */
  async handlePaymentSuccess(sessionId, onSuccess) {
    try {
      const statusResult = await this.getCheckoutStatus(sessionId);
      
      if (statusResult.success && statusResult.data.payment_status === 'paid') {
        if (onSuccess) {
          onSuccess(statusResult.data);
        }
        return { success: true };
      }

      return {
        success: false,
        error: 'Payment was not completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to verify payment status'
      };
    }
  }

  /**
   * Handle payment cancellation
   */
  handlePaymentCancel(onCancel) {
    if (onCancel) {
      onCancel();
    }
  }

  /**
   * Create a one-time payment (for future use)
   */
  async createOneTimePayment(amount, currency = 'usd', metadata = {}) {
    try {
      const response = await apiClient.post('/payments/one-time', {
        amount,
        currency,
        metadata,
        origin_url: window.location.origin
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create one-time payment'
      };
    }
  }

  /**
   * Process refund (for admin use)
   */
  async processRefund(transactionId, amount, reason = '') {
    try {
      const response = await apiClient.post('/payments/refund', {
        transaction_id: transactionId,
        amount,
        reason
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to process refund'
      };
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;