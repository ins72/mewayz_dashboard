import React from 'react';
import MetricCard from './MetricCard';

const MetricsGrid = () => {
  const metrics = [
    {
      title: "Total Revenue",
      value: "$24,567",
      trend: "up",
      trendValue: "+12.5%",
      description: "vs last month"
    },
    {
      title: "Active Users",
      value: "1,234",
      trend: "up",
      trendValue: "+8.2%",
      description: "vs last month"
    },
    {
      title: "Conversion Rate",
      value: "3.24%",
      trend: "down",
      trendValue: "-2.1%",
      description: "vs last month"
    },
    {
      title: "Total Orders",
      value: "567",
      trend: "up",
      trendValue: "+15.3%",
      description: "vs last month"
    },
    {
      title: "Customer Satisfaction",
      value: "4.8/5",
      trend: "up",
      trendValue: "+0.2",
      description: "average rating"
    },
    {
      title: "Support Tickets",
      value: "23",
      trend: "down",
      trendValue: "-18.5%",
      description: "vs last month"
    }
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Key Metrics
        </h2>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          View All →
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            trend={metric.trend}
            trendValue={metric.trendValue}
            description={metric.description}
          />
        ))}
      </div>
    </div>
  );
};

export default MetricsGrid;