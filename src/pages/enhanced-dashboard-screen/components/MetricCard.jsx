import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';

const MetricCard = ({ 
  title, 
  value, 
  format = 'number', 
  trend, 
  chart, 
  goal,
  onClick 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatValue = (val, fmt) => {
    if (typeof val !== 'number') return val;
    
    switch (fmt) {
      case 'currency':
        return `$${(val / 1000).toFixed(1)}k`;
      case 'percentage':
        return `${val}%`;
      case 'number':
        if (val > 1000) {
          return `${(val / 1000).toFixed(1)}k`;
        }
        return val.toLocaleString();
      default:
        return val;
    }
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'down':
        return <TrendingDown size={16} className="text-red-600" />;
      default:
        return <Minus size={16} className="text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const generateMiniChart = () => {
    if (!chart?.data || chart.data.length === 0) return null;

    const max = Math.max(...chart.data);
    const min = Math.min(...chart.data);
    const range = max - min || 1;

    const points = chart.data.map((point, index) => {
      const x = (index / (chart.data.length - 1)) * 100;
      const y = 100 - ((point - min) / range) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="mt-4 h-12 relative overflow-hidden">
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          preserveAspectRatio="none"
          className="absolute inset-0"
        >
          {chart.type === 'area' && (
            <defs>
              <linearGradient id={`gradient-${goal}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={chart.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={chart.color} stopOpacity="0.05" />
              </linearGradient>
            </defs>
          )}
          
          {chart.type === 'line' && (
            <polyline
              fill="none"
              stroke={chart.color}
              strokeWidth="2"
              points={points}
              className="drop-shadow-sm"
            />
          )}
          
          {chart.type === 'area' && (
            <>
              <polygon
                fill={`url(#gradient-${goal})`}
                points={`0,100 ${points} 100,100`}
              />
              <polyline
                fill="none"
                stroke={chart.color}
                strokeWidth="2"
                points={points}
              />
            </>
          )}
          
          {chart.type === 'bar' && chart.data.map((point, index) => {
            const x = (index / chart.data.length) * 100;
            const width = (1 / chart.data.length) * 80;
            const height = ((point - min) / range) * 100;
            const y = 100 - height;
            
            return (
              <rect
                key={index}
                x={`${x}%`}
                y={`${y}%`}
                width={`${width}%`}
                height={`${height}%`}
                fill={chart.color}
                opacity="0.7"
                rx="1"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${isHovered ? 'scale-105' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue(value, format)}
            </span>
            {onClick && (
              <ExternalLink size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
        
        {trend && (
          <div className="flex items-center gap-1">
            {getTrendIcon()}
          </div>
        )}
      </div>

      {trend && (
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-medium ${getTrendColor()}`}>
            {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '' : ''}{trend.value}%
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {trend.period}
          </span>
        </div>
      )}

      {/* Mini Chart */}
      {generateMiniChart()}

      {/* Interactive Hover State */}
      {isHovered && onClick && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      )}
    </div>
  );
};

export default MetricCard;