import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWizard } from 'contexts/WizardContext';
import { useAuth } from 'contexts/AuthContext';
import WizardContainer from 'pages/workspace-setup-wizard-welcome-basics/components/WizardContainer';
import LogoUploader from './components/LogoUploader';
import ColorPicker from './components/ColorPicker';
import FontSelector from './components/FontSelector';
import DomainSettings from './components/DomainSettings';
import WhiteLabelSettings from './components/WhiteLabelSettings';
import BrandingPreview from './components/BrandingPreview';
import brandingService from 'utils/brandingService';

const WorkspaceSetupWizardBranding = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    formData, 
    updateFormData, 
    nextStep, 
    previousStep, 
    setLoading, 
    isLoading,
    setError,
    clearError 
  } = useWizard();

  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Initialize branding data if not present
  useEffect(() => {
    if (!formData?.step6) {
      updateFormData('step6', {
        branding: {
          logo: null,
          primaryColor: '#007AFF',
          secondaryColor: '#6C5CE7',
          fontFamily: 'Inter',
          customDomain: ''
        },
        whiteLabelSettings: {
          removeWatermark: false,
          customLoginPage: false,
          customEmails: false
        }
      });
    }
  }, [formData?.step6, updateFormData]);

  const handleLogoUpload = async (file) => {
    setUploadingLogo(true);
    try {
      const validation = brandingService.validateLogoFile(file);
      if (!validation.valid) {
        setError('logo', validation.error);
        return;
      }

      // For demo purposes, we'll just store the file info // In production, you'd upload to Supabase storage
      const logoData = {
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size
      };

      updateFormData('step6', {
        branding: {
          ...formData?.step6?.branding,
          logo: logoData
        }
      });

      clearError('logo');
    } catch (error) {
      setError('logo', 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleColorChange = (type, color) => {
    if (!brandingService.validateHexColor(color)) {
      setError('color', 'Please enter a valid hex color');
      return;
    }

    updateFormData('step6', {
      branding: {
        ...formData?.step6?.branding,
        [type]: color
      }
    });

    clearError('color');
  };

  const handleFontChange = (fontFamily) => {
    updateFormData('step6', {
      branding: {
        ...formData?.step6?.branding,
        fontFamily
      }
    });
  };

  const handleDomainChange = (domain) => {
    const validation = brandingService.validateCustomDomain(domain);
    if (!validation.valid) {
      setError('domain', validation.error);
      return;
    }

    updateFormData('step6', {
      branding: {
        ...formData?.step6?.branding,
        customDomain: domain
      }
    });

    clearError('domain');
  };

  const handleWhiteLabelChange = (setting, value) => {
    updateFormData('step6', {
      whiteLabelSettings: {
        ...formData?.step6?.whiteLabelSettings,
        [setting]: value
      }
    });
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      // Complete the wizard setup
      // In production, you would save the branding settings here
      
      // For now, mark wizard as completed and redirect to dashboard
      navigate('/dashboard-screen');
    } catch (error) {
      setError('branding', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    previousStep();
    navigate('/workspace-setup-wizard-team-setup');
  };

  const handleSkip = () => {
    // Use default branding and complete wizard
    navigate('/dashboard-screen');
  };

  const selectedPlan = formData?.step4?.selectedPlan;
  const isEnterprise = selectedPlan === 'enterprise';

  return (
    <WizardContainer
      title="Brand Your Workspace"
      description="Customize your workspace appearance and make it truly yours. These settings can be changed anytime."
      currentStep={6}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Branding Settings */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LogoUploader
              logo={formData?.step6?.branding?.logo}
              onUpload={handleLogoUpload}
              uploading={uploadingLogo}
            />
          </motion.div>

          {/* Color Picker */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ColorPicker
              primaryColor={formData?.step6?.branding?.primaryColor}
              secondaryColor={formData?.step6?.branding?.secondaryColor}
              onColorChange={handleColorChange}
            />
          </motion.div>

          {/* Font Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FontSelector
              selectedFont={formData?.step6?.branding?.fontFamily}
              onFontChange={handleFontChange}
            />
          </motion.div>

          {/* Domain Settings */}
          {(selectedPlan === 'pro' || selectedPlan === 'enterprise') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <DomainSettings
                domain={formData?.step6?.branding?.customDomain}
                onDomainChange={handleDomainChange}
                isPro={selectedPlan === 'pro'}
                isEnterprise={isEnterprise}
              />
            </motion.div>
          )}

          {/* White Label Settings */}
          {isEnterprise && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <WhiteLabelSettings
                settings={formData?.step6?.whiteLabelSettings}
                onSettingChange={handleWhiteLabelChange}
              />
            </motion.div>
          )}
        </div>

        {/* Branding Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <BrandingPreview
            branding={formData?.step6?.branding}
            whiteLabelSettings={formData?.step6?.whiteLabelSettings}
            selectedPlan={selectedPlan}
          />
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-8 mt-8 border-t border-gray-700">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          Back
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={handleSkip}
            className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            disabled={isLoading}
          >
            Skip
          </button>
          
          <button
            onClick={handleNext}
            disabled={isLoading}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </div>
      </div>
    </WizardContainer>
  );
};

export default WorkspaceSetupWizardBranding;