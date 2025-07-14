import React from 'react';
import QuickActionCard from './QuickActionCard';

const QuickActionsGrid = () => {
  const quickActions = [
    {
      title: "Instagram",
      description: "Manage your Instagram content and analytics",
      icon: "Instagram",
      color: "#FF6B6B",
      onClick: () => console.log("Instagram clicked")
    },
    {
      title: "Link Builder",
      description: "Create and manage custom links",
      icon: "Link",
      color: "#45B7D1",
      onClick: () => console.log("Link Builder clicked")
    },
    {
      title: "Course Creator",
      description: "Build and publish online courses",
      icon: "GraduationCap",
      color: "#F9CA24",
      onClick: () => console.log("Course Creator clicked")
    },
    {
      title: "Store Manager",
      description: "Manage your e-commerce store",
      icon: "Store",
      color: "#6C5CE7",
      onClick: () => console.log("Store Manager clicked")
    },
    {
      title: "CRM Hub",
      description: "Customer relationship management",
      icon: "Users",
      color: "#FF3838",
      onClick: () => console.log("CRM Hub clicked")
    },
    {
      title: "Analytics",
      description: "View detailed performance analytics",
      icon: "BarChart3",
      color: "#26DE81",
      onClick: () => console.log("Analytics clicked")
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Quick Actions
        </h2>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          Customize →
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