import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Hash, Users, Target, BarChart3 } from 'lucide-react';
import { useDashboard } from './DashboardProvider';

const SearchBar = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const { goals, features, workspace, incrementFeatureUsage } = useDashboard();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = [];
    const queryLower = query.toLowerCase();

    // Search goals
    goals?.forEach(goal => {
      if (goal?.name?.toLowerCase().includes(queryLower) || 
          goal?.description?.toLowerCase().includes(queryLower)) {
        searchResults.push({
          type: 'goal',
          icon: Target,
          title: goal.name,
          description: goal.description,
          color: goal.icon_color || '#6B7280',
          action: () => window.location.href = `/goals/${goal.slug}`
        });
      }
    });

    // Search features
    features?.forEach(feature => {
      if (feature?.name?.toLowerCase().includes(queryLower) || 
          feature?.description?.toLowerCase().includes(queryLower)) {
        searchResults.push({
          type: 'feature',
          icon: Hash,
          title: feature.name,
          description: feature.description,
          action: () => {
            incrementFeatureUsage(feature.slug);
            window.location.href = `/features/${feature.slug}`;
          }
        });
      }
    });

    // Add quick actions
    const quickActions = [
      {
        type: 'action',
        icon: Users,
        title: 'Team Management',
        description: 'Manage workspace members and permissions',
        action: () => window.location.href = '/team'
      },
      {
        type: 'action',
        icon: BarChart3,
        title: 'Analytics Overview',
        description: 'View detailed analytics and reports',
        action: () => window.location.href = '/analytics'
      }
    ];

    quickActions.forEach(action => {
      if (action.title.toLowerCase().includes(queryLower)) {
        searchResults.push(action);
      }
    });

    setResults(searchResults.slice(0, 8));
    setSelectedIndex(-1);
  }, [query, goals, features, incrementFeatureUsage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      results[selectedIndex]?.action?.();
      onClose();
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'goal': return 'text-blue-600 bg-blue-50';
      case 'feature': return 'text-green-600 bg-green-50';
      case 'action': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search size={20} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search goals, features, actions..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => {
                const IconComponent = result.icon;
                const isSelected = index === selectedIndex;
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      result.action?.();
                      onClose();
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      isSelected 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' :'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${getTypeColor(result.type)} dark:bg-gray-600`}>
                      <IconComponent size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {result.title}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {result.description}
                      </p>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          ) : query.trim() ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-1">Try searching for goals, features, or actions</p>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search size={48} className="mx-auto mb-4 opacity-50" />
              <p>Start typing to search...</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Goals</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Features</span>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Actions</span>
              </div>
            </div>
          )}
        </div>

        {/* Keyboard Shortcuts */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-750 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex justify-center gap-4">
            <span><kbd className="px-1 bg-white dark:bg-gray-600 rounded border">↑↓</kbd> Navigate</span>
            <span><kbd className="px-1 bg-white dark:bg-gray-600 rounded border">↵</kbd> Select</span>
            <span><kbd className="px-1 bg-white dark:bg-gray-600 rounded border">Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;