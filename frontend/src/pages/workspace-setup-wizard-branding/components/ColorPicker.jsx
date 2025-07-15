import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Palette, Eye } from 'lucide-react';
import Input from 'components/ui/Input';
import brandingService from 'utils/brandingService';

const ColorPicker = ({ primaryColor, secondaryColor, onColorChange }) => {
  const [showPalette, setShowPalette] = useState(false);
  const colorPalette = brandingService.getColorPalette();

  const handlePaletteSelect = (colors) => {
    onColorChange('primaryColor', colors.primary);
    onColorChange('secondaryColor', colors.secondary);
    setShowPalette(false);
  };

  const ColorInput = ({ label, value, type, placeholder }) => (
    <div className="flex-1">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            type="text"
            value={value}
            onChange={(e) => onColorChange(type, e.target.value)}
            placeholder={placeholder}
            className="pr-12"
          />
          <div
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded border border-gray-600"
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="color"
          value={value}
          onChange={(e) => onColorChange(type, e.target.value)}
          className="w-12 h-10 rounded border border-gray-600 cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Brand Colors</h3>
            <p className="text-gray-400 text-sm">Define your brand color scheme</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowPalette(!showPalette)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Color Inputs */}
      <div className="flex space-x-4 mb-6">
        <ColorInput
          label="Primary Color"
          value={primaryColor}
          type="primaryColor"
          placeholder="#007AFF"
        />
        <ColorInput
          label="Secondary Color"
          value={secondaryColor}
          type="secondaryColor"
          placeholder="#6C5CE7"
        />
      </div>

      {/* Color Preview */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h4 className="text-white font-medium mb-3">Color Preview</h4>
        <div className="flex space-x-3">
          <div className="flex-1">
            <div
              className="h-12 rounded-lg mb-2"
              style={{ backgroundColor: primaryColor }}
            />
            <p className="text-xs text-gray-400 text-center">Primary</p>
          </div>
          <div className="flex-1">
            <div
              className="h-12 rounded-lg mb-2"
              style={{ backgroundColor: secondaryColor }}
            />
            <p className="text-xs text-gray-400 text-center">Secondary</p>
          </div>
          <div className="flex-1">
            <div
              className="h-12 rounded-lg mb-2"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
              }}
            />
            <p className="text-xs text-gray-400 text-center">Gradient</p>
          </div>
        </div>
      </div>

      {/* Predefined Palettes */}
      {showPalette && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-700 pt-4"
        >
          <h4 className="text-white font-medium mb-3">Predefined Palettes</h4>
          <div className="grid grid-cols-2 gap-3">
            {colorPalette.map((palette, index) => (
              <motion.button
                key={palette.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handlePaletteSelect(palette)}
                className="bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors text-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded"
                    style={{ backgroundColor: palette.secondary }}
                  />
                  <span className="text-white text-sm font-medium">{palette.name}</span>
                </div>
                <div className="flex space-x-1 text-xs text-gray-400">
                  <span>{palette.primary}</span>
                  <span>•</span>
                  <span>{palette.secondary}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Usage Guidelines */}
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-2">Color Guidelines</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Primary color is used for buttons, links, and highlights</li>
          <li>• Secondary color complements and supports the primary</li>
          <li>• Ensure good contrast against dark backgrounds</li>
          <li>• Test colors in different lighting conditions</li>
        </ul>
      </div>
    </div>
  );
};

export default ColorPicker;