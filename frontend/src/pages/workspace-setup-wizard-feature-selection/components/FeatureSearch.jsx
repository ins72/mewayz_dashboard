import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';

const FeatureSearch = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange, 
  goals, 
  selectedGoals 
}) => {
  // Filter goals to only show selected ones
  const availableGoals = goals.filter(goal => 
    selectedGoals.some(sg => sg.goalId === goal.id)
  );

  const clearSearch = () => {
    onSearchChange('');
  };

  const clearFilters = () => {
    onSearchChange('');
    onCategoryChange('all');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="bg-gray-800/30 border border-gray-700 rounded-lg p-6"
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search features..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="
              w-full pl-10 pr-10 py-3 
              bg-gray-700 border border-gray-600 rounded-lg 
              text-white placeholder-gray-400
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors
            "
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-gray-300" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="
              pl-10 pr-8 py-3 min-w-48
              bg-gray-700 border border-gray-600 rounded-lg
              text-white appearance-none cursor-pointer
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-colors
            "
          >
            <option value="all">All Categories</option>
            {availableGoals.map(goal => (
              <option key={goal.id} value={goal.id}>
                {goal.name}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters */}
        {(searchTerm || selectedCategory !== 'all') && (
          <button
            onClick={clearFilters}
            className="
              px-4 py-3 
              bg-gray-700 border border-gray-600 rounded-lg
              text-gray-300 hover:text-white hover:bg-gray-600
              transition-colors
              whitespace-nowrap
            "
          >
            Clear All
          </button>
        )}
      </div>

      {/* Active Filters */}
      {(searchTerm || selectedCategory !== 'all') && (
        <div className="mt-4 flex flex-wrap gap-2">
          {searchTerm && (
            <span className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full">
              Search: "{searchTerm}"
              <button
                onClick={clearSearch}
                className="ml-2 hover:text-blue-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedCategory !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full">
              Category: {goals.find(g => g.id === selectedCategory)?.name}
              <button
                onClick={() => onCategoryChange('all')}
                className="ml-2 hover:text-purple-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FeatureSearch;