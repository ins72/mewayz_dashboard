import apiClient from './apiClient';

class BrandingService {
  // Upload logo file
  async uploadLogo(workspaceId, logoFile) {
    try {
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${workspaceId}/logo.${fileExt}`;
      const filePath = `workspace-branding/${fileName}`;

      const { data, error } = await supabase.storage
        .from('assets')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      return { success: true, data: { path: data.path, publicUrl } };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to storage service. Please check your internet connection and try again.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to upload logo' 
      };
    }
  }

  // Save branding settings
  async saveBrandingSettings(workspaceId, brandingData) {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .update({
          branding: {
            logo: brandingData.logo,
            primaryColor: brandingData.primaryColor,
            secondaryColor: brandingData.secondaryColor,
            fontFamily: brandingData.fontFamily,
            customDomain: brandingData.customDomain
          },
          white_label_enabled: brandingData.whiteLabelSettings?.removeWatermark || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', workspaceId)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to save branding settings' 
      };
    }
  }

  // Get workspace branding
  async getWorkspaceBranding(workspaceId) {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('branding, white_label_enabled, custom_domain')
        .eq('id', workspaceId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      if (error?.message?.includes('Failed to fetch') || 
          error?.message?.includes('NetworkError')) {
        return { 
          success: false, 
          error: 'Cannot connect to database. Your Supabase project may be paused or deleted. Please visit your Supabase dashboard to check project status.' 
        };
      }
      
      return { 
        success: false, 
        error: 'Failed to load branding settings' 
      };
    }
  }

  // Validate logo file
  validateLogoFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];

    if (!file) {
      return { valid: false, error: 'No file selected' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 5MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File must be an image (JPEG, PNG, GIF, or SVG)' };
    }

    return { valid: true };
  }

  // Validate color hex code
  validateHexColor(color) {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  }

  // Validate custom domain
  validateCustomDomain(domain) {
    if (!domain) return { valid: true }; // Optional field
    
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    
    if (!domainRegex.test(domain)) {
      return { valid: false, error: 'Please enter a valid domain (e.g., yourdomain.com)' };
    }

    return { valid: true };
  }

  // Get predefined color palette
  getColorPalette() {
    return [
      { name: 'Mewayz Blue', primary: '#007AFF', secondary: '#6C5CE7' },
      { name: 'Ocean Breeze', primary: '#45B7D1', secondary: '#96CEB4' },
      { name: 'Sunset Orange', primary: '#FF6B6B', secondary: '#FF9F43' },
      { name: 'Forest Green', primary: '#26DE81', secondary: '#2ED573' },
      { name: 'Purple Dream', primary: '#A55EEA', secondary: '#CD84F1' },
      { name: 'Rose Gold', primary: '#FF7675', secondary: '#FDCB6E' },
      { name: 'Corporate Gray', primary: '#2D3436', secondary: '#636E72' },
      { name: 'Teal Splash', primary: '#00B894', secondary: '#00CEC9' }
    ];
  }

  // Get font families
  getFontFamilies() {
    return [
      { name: 'Inter', value: 'Inter, sans-serif', category: 'Sans Serif' },
      { name: 'Roboto', value: 'Roboto, sans-serif', category: 'Sans Serif' },
      { name: 'Open Sans', value: 'Open Sans, sans-serif', category: 'Sans Serif' },
      { name: 'Lato', value: 'Lato, sans-serif', category: 'Sans Serif' },
      { name: 'Poppins', value: 'Poppins, sans-serif', category: 'Sans Serif' },
      { name: 'Montserrat', value: 'Montserrat, sans-serif', category: 'Sans Serif' },
      { name: 'Playfair Display', value: 'Playfair Display, serif', category: 'Serif' },
      { name: 'Merriweather', value: 'Merriweather, serif', category: 'Serif' },
      { name: 'Fira Code', value: 'Fira Code, monospace', category: 'Monospace' }
    ];
  }

  // Generate CSS custom properties for branding
  generateBrandingCSS(brandingData) {
    return `
      :root {
        --brand-primary: ${brandingData.primaryColor || '#007AFF'};
        --brand-secondary: ${brandingData.secondaryColor || '#6C5CE7'};
        --brand-font-family: ${brandingData.fontFamily || 'Inter, sans-serif'};
      }
      
      .brand-primary { color: var(--brand-primary); }
      .brand-secondary { color: var(--brand-secondary); }
      .bg-brand-primary { background-color: var(--brand-primary); }
      .bg-brand-secondary { background-color: var(--brand-secondary); }
      .border-brand-primary { border-color: var(--brand-primary); }
      .border-brand-secondary { border-color: var(--brand-secondary); }
      .font-brand { font-family: var(--brand-font-family); }
    `;
  }
}

const brandingService = new BrandingService();
export default brandingService;