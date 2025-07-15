import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Download, AlertTriangle, CheckCircle, FileText } from 'lucide-react';
import Button from 'components/ui/Button';
import invitationService from 'utils/invitationService';

const BulkImportModal = ({ workspaceId, onClose, onSuccess }) => {
  const [step, setStep] = useState('upload'); // 'upload', 'preview', 'processing', 'complete'
  const [csvData, setCsvData] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const csvTemplate = `email,role,department,position,message
john@example.com,member,Engineering,Software Engineer,Welcome to the team!
sarah@example.com,manager,Marketing,Marketing Manager,Looking forward to working with you
mike@example.com,member,Design,UI/UX Designer,Excited to have you join our design team`;

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleTextareaChange = (event) => {
    setCsvData(event.target.value);
  };

  const parseCsvData = () => {
    setError(null);
    
    if (!csvData.trim()) {
      setError('Please provide CSV data');
      return;
    }

    const result = invitationService.parseCsvData(csvData);
    
    if (result.success) {
      setParsedData(result.data);
      setStep('preview');
    } else {
      setError(result.error);
    }
  };

  const processBulkInvitations = async () => {
    setLoading(true);
    setError(null);
    setStep('processing');

    try {
      const result = await invitationService.createBulkInvitations(
        workspaceId,
        parsedData.invitations,
        `CSV Import - ${new Date().toLocaleDateString()}`
      );

      if (result.success) {
        setResults(result.data);
        setStep('complete');
      } else {
        setError(result.error);
        setStep('preview');
      }
    } catch (error) {
      setError('Failed to process bulk invitations');
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const element = document.createElement('a');
    const file = new Blob([csvTemplate], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = 'invitation-template.csv';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleComplete = () => {
    onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-white">Bulk Import Invitations</h2>
              <p className="text-gray-400 text-sm">Upload a CSV file to invite multiple team members at once</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Step: Upload */}
            {step === 'upload' && (
              <div className="p-6">
                {/* CSV Template Download */}
                <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <h3 className="text-blue-300 font-medium mb-1">Download CSV Template</h3>
                      <p className="text-blue-200 text-sm mb-3">
                        Use our template to ensure your CSV file has the correct format.
                      </p>
                      <button
                        onClick={downloadTemplate}
                        className="flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Upload CSV File
                  </label>
                  <div className="border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg p-8 text-center transition-colors">
                    <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <div className="mb-4">
                      <label className="cursor-pointer">
                        <span className="text-blue-400 hover:text-blue-300 font-medium">
                          Click to upload a file
                        </span>
                        <span className="text-gray-400"> or drag and drop</span>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-gray-500 text-sm">CSV files only</p>
                  </div>
                </div>

                {/* Or separator */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">or paste CSV data</span>
                  </div>
                </div>

                {/* Manual CSV Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Paste CSV Data
                  </label>
                  <textarea
                    value={csvData}
                    onChange={handleTextareaChange}
                    placeholder="email,role,department,position,message&#10;john@example.com,member,Engineering,Software Engineer,Welcome!"
                    rows="8"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                      <p className="text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end space-x-3">
                  <Button variant="secondary" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button onClick={parseCsvData} disabled={!csvData.trim()}>
                    Parse CSV Data
                  </Button>
                </div>
              </div>
            )}

            {/* Step: Preview */}
            {step === 'preview' && parsedData && (
              <div className="p-6">
                {/* Summary */}
                <div className="mb-6 p-4 bg-gray-700/30 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Import Summary</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Total Records:</span>
                      <span className="text-white ml-2 font-medium">{parsedData.summary.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Valid:</span>
                      <span className="text-green-400 ml-2 font-medium">{parsedData.summary.valid}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Invalid:</span>
                      <span className="text-red-400 ml-2 font-medium">{parsedData.summary.invalid}</span>
                    </div>
                  </div>
                </div>

                {/* Errors */}
                {parsedData.errors.length > 0 && (
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <h4 className="text-red-300 font-medium mb-2">Validation Errors</h4>
                    <ul className="space-y-1 text-sm text-red-200">
                      {parsedData.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Valid Invitations Preview */}
                {parsedData.invitations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-3">
                      Valid Invitations ({parsedData.invitations.length})
                    </h4>
                    <div className="bg-gray-700/30 rounded-lg border border-gray-600 overflow-hidden">
                      <div className="max-h-64 overflow-y-auto">
                        {parsedData.invitations.slice(0, 10).map((invitation, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border-b border-gray-600 last:border-b-0"
                          >
                            <div>
                              <p className="text-white font-medium">{invitation.email}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-400">
                                <span>{invitation.role}</span>
                                {invitation.department && <span>• {invitation.department}</span>}
                                {invitation.position && <span>• {invitation.position}</span>}
                              </div>
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          </div>
                        ))}
                        
                        {parsedData.invitations.length > 10 && (
                          <div className="p-3 text-center text-gray-400 text-sm">
                            ... and {parsedData.invitations.length - 10} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                      <p className="text-red-300">{error}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between">
                  <Button variant="secondary" onClick={() => setStep('upload')}>
                    Back to Upload
                  </Button>
                  
                  <div className="flex space-x-3">
                    <Button variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      onClick={processBulkInvitations}
                      disabled={parsedData.invitations.length === 0 || loading}
                    >
                      Send {parsedData.invitations.length} Invitation{parsedData.invitations.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step: Processing */}
            {step === 'processing' && (
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <h3 className="text-xl font-semibold text-white mb-2">Processing Invitations</h3>
                  <p className="text-gray-400">
                    Sending {parsedData?.invitations?.length || 0} invitations...
                  </p>
                </div>
              </div>
            )}

            {/* Step: Complete */}
            {step === 'complete' && results && (
              <div className="p-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Import Complete!</h3>
                  <p className="text-gray-400">Your bulk invitation import has been processed.</p>
                </div>

                {/* Results Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-700/30 rounded-lg text-center">
                    <div className="text-2xl font-bold text-white mb-1">{results.summary.total}</div>
                    <div className="text-sm text-gray-400">Total Processed</div>
                  </div>
                  <div className="p-4 bg-green-900/30 rounded-lg text-center border border-green-700">
                    <div className="text-2xl font-bold text-green-400 mb-1">{results.summary.successful}</div>
                    <div className="text-sm text-green-300">Successful</div>
                  </div>
                  <div className="p-4 bg-red-900/30 rounded-lg text-center border border-red-700">
                    <div className="text-2xl font-bold text-red-400 mb-1">{results.summary.failed}</div>
                    <div className="text-sm text-red-300">Failed</div>
                  </div>
                </div>

                {/* Failed Invitations */}
                {results.summary.failed > 0 && (
                  <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                    <h4 className="text-red-300 font-medium mb-2">Failed Invitations</h4>
                    <div className="space-y-2 text-sm">
                      {results.results
                        .filter(result => !result.success)
                        .map((result, index) => (
                          <div key={index} className="text-red-200">
                            • {result.email}: {result.error}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-end">
                  <Button onClick={handleComplete}>
                    Complete
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BulkImportModal;