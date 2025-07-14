import React from 'react';
import { Minus, Plus } from 'lucide-react';

const FeatureCountSelector = ({ count, maxCount, onChange }) => {
  const handleDecrement = () => {
    if (count > 0) {
      onChange(count - 1);
    }
  };

  const handleIncrement = () => {
    if (count < maxCount) {
      onChange(count + 1);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Select Feature Count</h3>
        <p className="text-gray-400 text-sm mb-6">
          Choose how many features you want to enable for your workspace.
          You selected {maxCount} features in the previous step.
        </p>
        
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={handleDecrement}
            disabled={count <= 0}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
          >
            <Minus className="w-5 h-5 text-white" />
          </button>
          
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-1">{count}</div>
            <div className="text-sm text-gray-400">features enabled</div>
          </div>
          
          <button
            onClick={handleIncrement}
            disabled={count >= maxCount}
            className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          Maximum: {maxCount} features (based on your selections)
        </div>
      </div>
    </div>
  );
};

export default FeatureCountSelector;