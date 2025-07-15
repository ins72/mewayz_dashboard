import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuickActionCard from './QuickActionCard';

const QuickActionsGrid = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Instagram",
      description: "Manage your Instagram content and analytics",
      icon: "Instagram",
      color: "#FF6B6B",
      onClick: () => navigate('/dashboard/instagram')
    },
    {
      title: "Link Builder",
      description: "Create and manage custom links",
      icon: "Link",
      color: "#45B7D1",
      onClick: () => navigate('/dashboard/link-builder')
    },
    {
      title: "Course Creator",
      description: "Build and publish online courses",
      icon: "GraduationCap",
      color: "#F9CA24",
      onClick: () => navigate('/dashboard/course-creator')
    },
    {
      title: "Store Manager",
      description: "Manage your e-commerce store",
      icon: "Store",
      color: "#6C5CE7",
      onClick: () => navigate('/dashboard/store-manager')
    },
    {
      title: "CRM Hub",
      description: "Customer relationship management",
      icon: "Users",
      color: "#FF3838",
      onClick: () => navigate('/dashboard/crm-hub')
    },
    {
      title: "Analytics",
      description: "View detailed performance analytics",
      icon: "BarChart3",
      color: "#26DE81",
      onClick: () => navigate('/dashboard/analytics')
    },
    {
      title: "Payments",
      description: "Manage payments and subscriptions",
      icon: "CreditCard",
      color: "#22C55E",
      onClick: () => navigate('/dashboard/payments')
    },
    {
      title: "Email Campaigns",
      description: "Create and send email campaigns",
      icon: "Mail",
      color: "#3B82F6",
      onClick: () => navigate('/dashboard/email-campaigns')
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Quick Actions
        </h2>
        <button 
          onClick={() => navigate('/dashboard/quick-actions')}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          View All →
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <QuickActionCard
            key={index}
            title={action.title}
            description={action.description}
            icon={action.icon}
            color={action.color}
            onClick={action.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;