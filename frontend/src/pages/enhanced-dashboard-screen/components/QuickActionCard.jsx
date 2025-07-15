import React from 'react';
import { 
  Calendar, CalendarDays, BarChart3, Layout, QrCode, MousePointer,
  BookOpen, Users, Award, Package, ShoppingCart, Warehouse,
  Contact, TrendingUp, Mail, LayoutDashboard, FileBarChart,
  Target, Settings
} from 'lucide-react';
import { useDashboard } from './DashboardProvider';

const QuickActionCard = ({ action }) => {
  const { incrementFeatureUsage } = useDashboard();

  const iconMap = {
    Calendar,
    CalendarDays, 
    BarChart3,
    Layout,
    QrCode,
    MousePointer,
    BookOpen,
    Users,
    Award,
    Package,
    ShoppingCart,
    Warehouse,
    AddressBook: Contact,
    Contact,
    TrendingUp,
    Mail,
    LayoutDashboard,
    FileBarChart,
    Target,
    Settings
  };

  const IconComponent = iconMap[action.icon] || Target;

  const handleClick = () => {
    // Track feature usage if this is a feature action
    if (action.feature) {
      incrementFeatureUsage(action.feature);
    }
    
    // Navigate to the action route
    window.location.href = action.route;
  };

  return (
    <button
      onClick={handleClick}
      className="group flex flex-col items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 hover:scale-105"
    >
      <div 
        className="w-12 h-12 rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform"
        style={{ backgroundColor: action.color }}
      >
        <IconComponent size={20} />
      </div>
      
      <div className="text-center">
        <p className="font-medium text-gray-900 dark:text-white text-sm">
          {action.name}
        </p>
        {action.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {action.description}
          </p>
        )}
      </div>

      {/* Hover overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />
    </button>
  );
};

export default QuickActionCard;