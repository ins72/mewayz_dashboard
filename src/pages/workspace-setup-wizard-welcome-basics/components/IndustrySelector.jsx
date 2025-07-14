import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Building, Monitor, Megaphone, ShoppingBag, GraduationCap, Heart, Briefcase, Palette, Home, Coffee, DollarSign, Settings, Play, MapPin } from 'lucide-react';
import workspaceService from '../../../utils/workspaceService';

const iconMap = {
  Monitor, Megaphone, ShoppingBag, GraduationCap, Heart, Briefcase, 
  Palette, Home, Coffee, DollarSign, Settings, Play, MapPin, Building
};

const IndustrySelector = ({ value, onChange, error }) => {
  const [industries, setIndustries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    loadIndustries();
  }, []);

  const loadIndustries = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      
      const result = await workspaceService.getIndustries();
      
      if (result.success) {
        setIndustries(result.data);
      } else {
        setLoadError(result.error);
      }
    } catch (error) {
      setLoadError('Failed to load industries');
      console.log('Error loading industries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredIndustries = industries.filter(industry =>
    industry?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase() || '') ||
    industry?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase() || '')
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Industry *
        </label>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-200 mb-2">
          Industry *
        </label>
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400 text-sm">{loadError}</p>
          <button
            onClick={loadIndustries}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-200 mb-2">
        Industry *
      </label>
      
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search industries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
      </div>

      {/* Industry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto custom-scrollbar">
        {filteredIndustries?.map((industry, index) => {
          const IconComponent = iconMap[industry?.icon_name] || Building;
          const isSelected = value === industry?.slug;
          
          return (
            <motion.button
              key={industry?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => onChange(industry?.slug)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 text-left group ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                  : 'border-gray-600 bg-gray-700/50 hover:border-gray-500 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg transition-colors duration-300 ${
                  isSelected 
                    ? 'bg-blue-500 text-white' :'bg-gray-600 text-gray-300 group-hover:bg-gray-500'
                }`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm transition-colors duration-300 ${
                    isSelected ? 'text-blue-300' : 'text-white'
                  }`}>
                    {industry?.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                    {industry?.description}
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* No Results */}
      {filteredIndustries?.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <Building className="h-12 w-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No industries found matching "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm mt-2"
        >
          {error}
        </motion.p>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default IndustrySelector;