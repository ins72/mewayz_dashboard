import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, X } from 'lucide-react';
import Button from 'components/ui/Button';

const LogoUploader = ({ logo, onUpload, uploading }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const handleRemoveLogo = () => {
    onUpload(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
          <Image className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Logo Upload</h3>
          <p className="text-gray-400 text-sm">Add your company or personal logo</p>
        </div>
      </div>

      {/* Upload Area */}
      {!logo ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-xl p-8 text-center cursor-pointer transition-colors"
        >
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          
          <h4 className="text-white font-medium mb-2">Upload Your Logo</h4>
          <p className="text-gray-400 text-sm mb-4">
            Drag and drop or click to browse
          </p>
          
          <Button variant="outline" size="sm" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Choose File'}
          </Button>
          
          <p className="text-gray-500 text-xs mt-3">
            Supports: JPEG, PNG, GIF, SVG • Max size: 5MB
          </p>
        </div>
      ) : (
        /* Logo Preview */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gray-800 rounded-xl p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-medium">Logo Preview</h4>
            <button
              onClick={handleRemoveLogo}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Logo Preview */}
            <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
              {logo?.preview ? (
                <img
                  src={logo.preview}
                  alt="Logo preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image className="w-6 h-6 text-gray-400" />
              )}
            </div>
            
            {/* File Info */}
            <div className="flex-1">
              <p className="text-white font-medium truncate">{logo?.name}</p>
              <p className="text-gray-400 text-sm">{formatFileSize(logo?.size || 0)}</p>
            </div>
          </div>
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
            className="w-full mt-4"
          >
            Replace Logo
          </Button>
        </motion.div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Tips */}
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="text-blue-400 font-medium mb-2">Logo Tips</h4>
        <ul className="text-blue-300 text-sm space-y-1">
          <li>• Use a square or horizontal logo for best results</li>
          <li>• SVG format provides the best quality at any size</li>
          <li>• Transparent backgrounds work best for dark themes</li>
          <li>• Keep file size under 1MB for optimal performance</li>
        </ul>
      </div>
    </div>
  );
};

export default LogoUploader;