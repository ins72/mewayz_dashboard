import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Instagram, 
  Link, 
  BookOpen, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Calendar,
  MessageCircle,
  CreditCard,
  Settings,
  ArrowRight,
  Zap,
  TrendingUp,
  Eye,
  Edit,
  Share2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

const QuickActionsHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentActivity, setRecentActivity] = useState([]);
  const [quickStats, setQuickStats] = useState({
    totalPosts: 0,
    activeLinks: 0,
    coursesCreated: 0,
    totalSales: 0,
    leadsCaptured: 0
  });

  // Mock data - in production, this would come from APIs
  useEffect(() => {
    setRecentActivity([
      { id: 1, type: 'post', description: 'Instagram post scheduled for 2PM', time: '5 min ago' },
      { id: 2, type: 'link', description: 'New link added to bio page', time: '1 hour ago' },
      { id: 3, type: 'course', description: 'Course "Digital Marketing 101" published', time: '2 hours ago' },
      { id: 4, type: 'sale', description: 'New order received - $49.99', time: '3 hours ago' },
      { id: 5, type: 'lead', description: '3 new leads captured', time: '4 hours ago' }
    ]);

    setQuickStats({
      totalPosts: 24,
      activeLinks: 8,
      coursesCreated: 3,
      totalSales: 1247.50,
      leadsCaptured: 89
    });
  }, []);

  const quickActions = [
    {
      id: 'instagram_post',
      title: 'Create Instagram Post',
      description: 'Create and schedule Instagram content',
      icon: Instagram,
      color: 'from-pink-500 to-purple-500',
      action: () => navigate('/dashboard/instagram'),
      category: 'social_media'
    },
    {
      id: 'add_link',
      title: 'Add Link to Bio',
      description: 'Add new link to your bio page',
      icon: Link,
      color: 'from-blue-500 to-cyan-500',
      action: () => navigate('/dashboard/link-builder'),
      category: 'link_in_bio'
    },
    {
      id: 'create_course',
      title: 'Create Course',
      description: 'Start building a new course',
      icon: BookOpen,
      color: 'from-green-500 to-teal-500',
      action: () => console.log('Create Course'),
      category: 'courses'
    },
    {
      id: 'add_product',
      title: 'Add Product',
      description: 'Add new product to your store',
      icon: ShoppingCart,
      color: 'from-orange-500 to-red-500',
      action: () => console.log('Add Product'),
      category: 'ecommerce'
    },
    {
      id: 'add_contact',
      title: 'Add Contact',
      description: 'Add new contact to CRM',
      icon: Users,
      color: 'from-indigo-500 to-purple-500',
      action: () => console.log('Add Contact'),
      category: 'crm'
    },
    {
      id: 'view_analytics',
      title: 'View Analytics',
      description: 'Check your performance metrics',
      icon: BarChart3,
      color: 'from-yellow-500 to-orange-500',
      action: () => console.log('View Analytics'),
      category: 'analytics'
    },
    {
      id: 'schedule_post',
      title: 'Schedule Content',
      description: 'Schedule social media posts',
      icon: Calendar,
      color: 'from-violet-500 to-purple-500',
      action: () => console.log('Schedule Post'),
      category: 'social_media'
    },
    {
      id: 'send_campaign',
      title: 'Send Campaign',
      description: 'Send email marketing campaign',
      icon: MessageCircle,
      color: 'from-cyan-500 to-blue-500',
      action: () => navigate('/dashboard/email-campaigns'),
      category: 'email_marketing'
    },
    {
      id: 'manage_payments',
      title: 'Manage Payments',
      description: 'View payments and subscriptions',
      icon: CreditCard,
      color: 'from-green-500 to-emerald-500',
      action: () => navigate('/dashboard/payments'),
      category: 'payments'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'post': return Instagram;
      case 'link': return Link;
      case 'course': return BookOpen;
      case 'sale': return ShoppingCart;
      case 'lead': return Users;
      default: return Settings;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4">
          Quick Actions Hub
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Take quick actions to grow your business. Everything you need is just one click away.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
      >
        <Card className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-400">{quickStats.totalPosts}</div>
            <div className="text-sm text-gray-400">Posts Created</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{quickStats.activeLinks}</div>
            <div className="text-sm text-gray-400">Active Links</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500/10 to-teal-500/10 border-green-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{quickStats.coursesCreated}</div>
            <div className="text-sm text-gray-400">Courses Created</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">${quickStats.totalSales}</div>
            <div className="text-sm text-gray-400">Total Sales</div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{quickStats.leadsCaptured}</div>
            <div className="text-sm text-gray-400">Leads Captured</div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions Grid */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-yellow-400" />
              Quick Actions
            </h2>
            <p className="text-gray-400">Take immediate action to grow your business</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-r ${action.color} flex-shrink-0`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-green-400" />
                Recent Activity
              </h2>
              <p className="text-gray-400">Your latest actions and updates</p>
            </div>

            <Card className="space-y-4">
              {recentActivity.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.type);
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="p-2 bg-gray-700 rounded-lg flex-shrink-0">
                      <IconComponent className="h-4 w-4 text-blue-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-300">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </Card>

            {/* Quick Access Panel */}
            <Card className="mt-6">
              <div className="mb-4">
                <h3 className="font-semibold text-white mb-2">Quick Access</h3>
                <p className="text-sm text-gray-400">Frequently used actions</p>
              </div>
              
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left hover:bg-gray-800"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left hover:bg-gray-800"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Bio Page
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left hover:bg-gray-800"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Content
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-left hover:bg-gray-800"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsHub;