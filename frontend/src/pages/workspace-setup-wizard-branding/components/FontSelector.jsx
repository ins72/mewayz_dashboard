import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Type, ChevronDown } from 'lucide-react';
import brandingService from 'utils/brandingService';

const FontSelector = ({ selectedFont, onFontChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fontFamilies = brandingService.getFontFamilies();
  
  const selectedFontData = fontFamilies.find(font => font.value === selectedFont) || fontFamilies[0];

  const handleFontSelect = (fontValue) => {
    onFontChange(fontValue);
    setIsOpen(false);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
          <Type className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Typography</h3>
          <p className="text-gray-400 text-sm">Choose your brand font family</p>
        </div>
      </div>

      {/* Font Selector */}
      <div className="relative mb-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 flex items-center justify-between text-left hover:bg-gray-750 transition-colors"
        >
          <div>
            <p className="text-white font-medium" style={{ fontFamily: selectedFontData.value }}>
              {selectedFontData.name}
            </p>
            <p className="text-gray-400 text-sm">{selectedFontData.category}</p>
          </div>
          <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 max-h-64 overflow-y-auto"
          >
            {fontFamilies.map((font, index) => (
              <button
                key={font.value}
                onClick={() => handleFontSelect(font.value)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 ${
                  selectedFont === font.value ? 'bg-blue-500/10' : ''
                }`}
              >
                <p
                  className="text-white font-medium mb-1"
                  style={{ fontFamily: font.value }}
                >
                  {font.name}
                </p>
                <p className="text-gray-400 text-sm">{font.category}</p>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Font Preview */}
      <div className="bg-gray-800 rounded-lg p-4 mb-4">
        <h4 className="text-white font-medium mb-3">Font Preview</h4>
        <div style={{ fontFamily: selectedFontData.value }} className="space-y-2">
          <p className="text-2xl font-bold text-white">The quick brown fox</p>
          <p className="text-lg font-semibold text-gray-300">Jumps over the lazy dog</p>
          <p className="text-base font-medium text-gray-400">Regular text appears like this</p>
          <p className="text-sm text-gray-500">Small text and captions look like this</p>
        </div>
      </div>

      {/* Font Categories */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {['Sans Serif', 'Serif', 'Monospace'].map(category => {
          const categoryFonts = fontFamilies.filter(font => font.category === category);
          return (
            <div key={category} className="bg-gray-800 rounded-lg p-3">
              <h5 className="text-white text-sm font-medium mb-2">{category}</h5>
              <p className="text-gray-400 text-xs">{categoryFonts.length} fonts</p>
            </div>
          );
        })}
      </div>

      {/* Font Guidelines */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-2">Typography Guidelines</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Sans serif fonts are great for digital interfaces</li>
          <li>• Serif fonts add elegance and readability</li>
          <li>• Monospace fonts are perfect for code and data</li>
          <li>• Consider loading speed when choosing web fonts</li>
        </ul>
      </div>
    </div>
  );
};

export default FontSelector;