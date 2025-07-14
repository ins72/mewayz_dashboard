import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  Calendar,
  Download,
  Eye,
  RefreshCw,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

const PaymentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentStats, setPaymentStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0,
    totalTransactions: 0,
    pendingPayments: 0,
    refundedAmount: 0
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);

  // Mock data - in production, this would come from Stripe API
  useEffect(() => {
    setPaymentStats({
      totalRevenue: 24567.89,
      monthlyRevenue: 3456.78,
      activeSubscriptions: 142,
      totalTransactions: 1247,
      pendingPayments: 234.56,
      refundedAmount: 189.00
    });

    setRecentTransactions([
      {
        id: 'txn_1234567890',
        amount: 49.99,
        currency: 'USD',
        status: 'succeeded',
        customer: 'john.doe@example.com',
        description: 'Monthly Pro Subscription',
        created: '2024-01-15T10:30:00Z',
        payment_method: 'card_visa_4242'
      },
      {
        id: 'txn_1234567891',
        amount: 99.99,
        currency: 'USD',
        status: 'succeeded',
        customer: 'jane.smith@example.com',
        description: 'Annual Enterprise Plan',
        created: '2024-01-15T09:15:00Z',
        payment_method: 'card_mastercard_5555'
      },
      {
        id: 'txn_1234567892',
        amount: 29.99,
        currency: 'USD',
        status: 'failed',
        customer: 'failed.payment@example.com',
        description: 'Monthly Basic Plan',
        created: '2024-01-15T08:45:00Z',
        payment_method: 'card_visa_4000'
      },
      {
        id: 'txn_1234567893',
        amount: 149.99,
        currency: 'USD',
        status: 'refunded',
        customer: 'refund.request@example.com',
        description: 'Quarterly Pro Plan',
        created: '2024-01-14T16:20:00Z',
        payment_method: 'card_amex_3782'
      }
    ]);

    setSubscriptions([
      {
        id: 'sub_1234567890',
        customer: 'john.doe@example.com',
        plan: 'Pro Monthly',
        amount: 49.99,
        status: 'active',
        current_period_start: '2024-01-01T00:00:00Z',
        current_period_end: '2024-02-01T00:00:00Z',
        cancel_at_period_end: false
      },
      {
        id: 'sub_1234567891',
        customer: 'jane.smith@example.com',
        plan: 'Enterprise Annual',
        amount: 999.99,
        status: 'active',
        current_period_start: '2024-01-01T00:00:00Z',
        current_period_end: '2025-01-01T00:00:00Z',
        cancel_at_period_end: false
      },
      {
        id: 'sub_1234567892',
        customer: 'basic.user@example.com',
        plan: 'Basic Monthly',
        amount: 29.99,
        status: 'past_due',
        current_period_start: '2024-01-01T00:00:00Z',
        current_period_end: '2024-02-01T00:00:00Z',
        cancel_at_period_end: true
      }
    ]);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'succeeded':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />;
      case 'refunded':
        return <RefreshCw className="h-4 w-4 text-yellow-400" />;
      case 'past_due':
        return <AlertCircle className="h-4 w-4 text-orange-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'succeeded':
      case 'active':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'refunded':
        return 'text-yellow-400';
      case 'past_due':
        return 'text-orange-400';
      case 'pending':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'subscriptions', label: 'Subscriptions', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {formatAmount(paymentStats.totalRevenue)}
              </div>
              <div className="text-sm text-gray-400">Total Revenue</div>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {formatAmount(paymentStats.monthlyRevenue)}
              </div>
              <div className="text-sm text-gray-400">This Month</div>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {paymentStats.activeSubscriptions}
              </div>
              <div className="text-sm text-gray-400">Active Subscriptions</div>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {paymentStats.totalTransactions}
              </div>
              <div className="text-sm text-gray-400">Total Transactions</div>
            </div>
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Receipt className="h-6 w-6 text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {formatAmount(paymentStats.pendingPayments)}
              </div>
              <div className="text-sm text-gray-400">Pending Payments</div>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-400">
                {formatAmount(paymentStats.refundedAmount)}
              </div>
              <div className="text-sm text-gray-400">Refunded Amount</div>
            </div>
            <div className="p-3 bg-red-500/20 rounded-lg">
              <RefreshCw className="h-6 w-6 text-red-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
        
        <div className="space-y-4">
          {recentTransactions.slice(0, 5).map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(transaction.status)}
                <div>
                  <div className="font-medium text-white">{transaction.description}</div>
                  <div className="text-sm text-gray-400">{transaction.customer}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-white">
                  {formatAmount(transaction.amount, transaction.currency)}
                </div>
                <div className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const renderTransactions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">All Transactions</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-300">Transaction ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">Amount</th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="py-3 px-4 text-gray-300 font-mono text-sm">
                    {transaction.id}
                  </td>
                  <td className="py-3 px-4 text-white">{transaction.customer}</td>
                  <td className="py-3 px-4 text-white font-semibold">
                    {formatAmount(transaction.amount, transaction.currency)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(transaction.status)}
                      <span className={`capitalize ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {formatDate(transaction.created)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderSubscriptions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Active Subscriptions</h3>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Manage Plans
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-white">{subscription.plan}</div>
                  <div className="text-sm text-gray-400">{subscription.customer}</div>
                  <div className="text-sm text-gray-500">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-white text-lg">
                  {formatAmount(subscription.amount)}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(subscription.status)}
                  <span className={`capitalize text-sm ${getStatusColor(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </div>
                {subscription.cancel_at_period_end && (
                  <div className="text-xs text-orange-400 mt-1">
                    Cancels at period end
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white">Payment Settings</h3>
      
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-white mb-4">Stripe Configuration</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Test Mode</div>
                  <div className="text-sm text-gray-400">Use test keys for development</div>
                </div>
                <Button variant="outline" size="sm">
                  Enabled
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Webhook Endpoints</div>
                  <div className="text-sm text-gray-400">Manage webhook configurations</div>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Payment Methods</div>
                  <div className="text-sm text-gray-400">Card, Apple Pay, Google Pay</div>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h4 className="font-medium text-white mb-4">Tax Settings</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-white">Tax Calculation</div>
                  <div className="text-sm text-gray-400">Automatically calculate tax rates</div>
                </div>
                <Button variant="outline" size="sm">
                  Disabled
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <CreditCard className="h-8 w-8 mr-3 text-green-400" />
          Payment Dashboard
        </h1>
        <p className="text-gray-400">
          Manage your payments, subscriptions, and billing all in one place
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <IconComponent className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'transactions' && renderTransactions()}
        {activeTab === 'subscriptions' && renderSubscriptions()}
        {activeTab === 'settings' && renderSettings()}
      </motion.div>
    </div>
  );
};

export default PaymentDashboard;