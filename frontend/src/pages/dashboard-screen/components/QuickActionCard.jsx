import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickActionCard = ({ 
  title, 
  description, 
  icon, 
  color, 
  onClick,
  className = "" 
}) => {
  return (
    <button
      onClick={onClick}
      className={`group bg-card border border-border rounded-lg p-6 hover:shadow-card hover:scale-105 transition-all duration-200 text-left w-full ${className}`}
    >
      <div className="space-y-4">
        {/* Icon */}
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          <Icon name={icon} size={24} color="white" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex justify-end">
          <Icon 
            name="ArrowRight" 
            size={16} 
            className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
          />
        </div>
      </div>
    </button>
  );
};

export default QuickActionCard;