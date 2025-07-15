import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ 
  title, 
  value, 
  trend, 
  trendValue, 
  trendIcon, 
  description,
  className = "" 
}) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-success';
    if (trend === 'down') return 'text-destructive';
    return 'text-muted-foreground';
  };

  const getTrendBgColor = () => {
    if (trend === 'up') return 'bg-success/10';
    if (trend === 'down') return 'bg-destructive/10';
    return 'bg-muted/10';
  };

  return (
    <div className={`bg-card border border-border rounded-lg p-6 hover:shadow-card transition-all duration-200 ${className}`}>
      <div className="space-y-4">
        {/* Title */}
        <h3 className="text-sm font-medium text-muted-foreground">
          {title}
        </h3>

        {/* Value */}
        <div className="text-3xl font-bold text-foreground">
          {value}
        </div>

        {/* Trend and Description */}
        <div className="flex items-center justify-between">
          {trend && trendValue && (
            <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getTrendBgColor()}`}>
              <Icon 
                name={trendIcon || (trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus')} 
                size={14} 
                className={getTrendColor()}
              />
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {trendValue}
              </span>
            </div>
          )}
          
          {description && (
            <span className="text-xs text-muted-foreground">
              {description}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;