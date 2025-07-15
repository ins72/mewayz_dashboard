import { VALIDATION_RULES } from './constants';

/**
 * Validation utility functions
 */

export const validateEmail = (email) => {
  if (!email) return { valid: false, error: 'Email is required' };
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
};

export const validatePassword = (password) => {
  if (!password) return { valid: false, error: 'Password is required' };
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters long` };
  }
  if (!VALIDATION_RULES.PASSWORD_REGEX.test(password)) {
    return { valid: false, error: 'Password must contain uppercase, lowercase, number, and special character' };
  }
  return { valid: true };
};

export const validatePhone = (phone) => {
  if (!phone) return { valid: true }; // Phone is optional
  if (!VALIDATION_RULES.PHONE_REGEX.test(phone)) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }
  return { valid: true };
};

export const validateUrl = (url) => {
  if (!url) return { valid: true }; // URL is optional
  if (!VALIDATION_RULES.URL_REGEX.test(url)) {
    return { valid: false, error: 'Please enter a valid URL' };
  }
  return { valid: true };
};

export const validateDomain = (domain) => {
  if (!domain) return { valid: true }; // Domain is optional
  if (!VALIDATION_RULES.DOMAIN_REGEX.test(domain)) {
    return { valid: false, error: 'Please enter a valid domain (e.g., yourdomain.com)' };
  }
  return { valid: true };
};

export const validateHexColor = (color) => {
  if (!color) return { valid: false, error: 'Color is required' };
  if (!VALIDATION_RULES.HEX_COLOR_REGEX.test(color)) {
    return { valid: false, error: 'Please enter a valid hex color (e.g., #FF0000)' };
  }
  return { valid: true };
};

export const validateSlug = (slug) => {
  if (!slug) return { valid: false, error: 'Slug is required' };
  if (!VALIDATION_RULES.SLUG_REGEX.test(slug)) {
    return { valid: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' };
  }
  return { valid: true };
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { valid: false, error: `${fieldName} is required` };
  }
  return { valid: true };
};

export const validateMinLength = (value, minLength, fieldName) => {
  if (!value || value.length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters long` };
  }
  return { valid: true };
};

export const validateMaxLength = (value, maxLength, fieldName) => {
  if (value && value.length > maxLength) {
    return { valid: false, error: `${fieldName} must not exceed ${maxLength} characters` };
  }
  return { valid: true };
};

export const validateFileSize = (file, maxSize = 5 * 1024 * 1024) => {
  if (!file) return { valid: false, error: 'File is required' };
  if (file.size > maxSize) {
    return { valid: false, error: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` };
  }
  return { valid: true };
};

export const validateFileType = (file, allowedTypes) => {
  if (!file) return { valid: false, error: 'File is required' };
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  return { valid: true };
};

export const validateImageFile = (file) => {
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.valid) return sizeValidation;
  
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
  const typeValidation = validateFileType(file, allowedTypes);
  if (!typeValidation.valid) {
    return { valid: false, error: 'File must be an image (JPEG, PNG, GIF, or SVG)' };
  }
  
  return { valid: true };
};

export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(fieldName => {
    const value = formData[fieldName];
    const rules = validationRules[fieldName];

    for (const rule of rules) {
      const result = rule(value);
      if (!result.valid) {
        errors[fieldName] = result.error;
        isValid = false;
        break;
      }
    }
  });

  return { isValid, errors };
};

// Workspace validation
export const validateWorkspaceData = (workspaceData) => {
  const rules = {
    name: [
      (value) => validateRequired(value, 'Workspace name'),
      (value) => validateMinLength(value, 2, 'Workspace name'),
      (value) => validateMaxLength(value, 100, 'Workspace name')
    ],
    description: [
      (value) => validateMaxLength(value, 500, 'Description')
    ]
  };

  return validateForm(workspaceData, rules);
};

// User registration validation
export const validateUserRegistration = (userData) => {
  const rules = {
    name: [
      (value) => validateRequired(value, 'Full name'),
      (value) => validateMinLength(value, 2, 'Full name'),
      (value) => validateMaxLength(value, 100, 'Full name')
    ],
    email: [
      (value) => validateRequired(value, 'Email'),
      (value) => validateEmail(value)
    ],
    password: [
      (value) => validateRequired(value, 'Password'),
      (value) => validatePassword(value)
    ],
    confirmPassword: [
      (value) => validateRequired(value, 'Confirm password'),
      (value) => userData.password === value ? { valid: true } : { valid: false, error: 'Passwords do not match' }
    ]
  };

  return validateForm(userData, rules);
};

// CRM contact validation
export const validateCrmContact = (contactData) => {
  const rules = {
    first_name: [
      (value) => validateRequired(value, 'First name'),
      (value) => validateMinLength(value, 1, 'First name'),
      (value) => validateMaxLength(value, 50, 'First name')
    ],
    last_name: [
      (value) => validateRequired(value, 'Last name'),
      (value) => validateMinLength(value, 1, 'Last name'),
      (value) => validateMaxLength(value, 50, 'Last name')
    ],
    email: [
      (value) => value ? validateEmail(value) : { valid: true }
    ],
    phone: [
      (value) => validatePhone(value)
    ]
  };

  return validateForm(contactData, rules);
};

// Course validation
export const validateCourse = (courseData) => {
  const rules = {
    title: [
      (value) => validateRequired(value, 'Course title'),
      (value) => validateMinLength(value, 3, 'Course title'),
      (value) => validateMaxLength(value, 200, 'Course title')
    ],
    slug: [
      (value) => validateRequired(value, 'Course slug'),
      (value) => validateSlug(value)
    ],
    description: [
      (value) => validateMaxLength(value, 1000, 'Description')
    ],
    price: [
      (value) => {
        if (value && (isNaN(value) || value < 0)) {
          return { valid: false, error: 'Price must be a valid number' };
        }
        return { valid: true };
      }
    ]
  };

  return validateForm(courseData, rules);
};

// Product validation
export const validateProduct = (productData) => {
  const rules = {
    name: [
      (value) => validateRequired(value, 'Product name'),
      (value) => validateMinLength(value, 2, 'Product name'),
      (value) => validateMaxLength(value, 200, 'Product name')
    ],
    slug: [
      (value) => validateRequired(value, 'Product slug'),
      (value) => validateSlug(value)
    ],
    description: [
      (value) => validateMaxLength(value, 1000, 'Description')
    ],
    price: [
      (value) => {
        if (!value || isNaN(value) || value < 0) {
          return { valid: false, error: 'Price must be a valid number' };
        }
        return { valid: true };
      }
    ],
    stock: [
      (value) => {
        if (value && (isNaN(value) || value < 0)) {
          return { valid: false, error: 'Stock must be a valid number' };
        }
        return { valid: true };
      }
    ]
  };

  return validateForm(productData, rules);
};

// Email campaign validation
export const validateEmailCampaign = (campaignData) => {
  const rules = {
    subject: [
      (value) => validateRequired(value, 'Email subject'),
      (value) => validateMinLength(value, 3, 'Email subject'),
      (value) => validateMaxLength(value, 200, 'Email subject')
    ],
    sender: [
      (value) => validateRequired(value, 'Sender email'),
      (value) => validateEmail(value)
    ],
    template: [
      (value) => validateRequired(value, 'Email template')
    ],
    audience: [
      (value) => validateRequired(value, 'Email audience')
    ]
  };

  return validateForm(campaignData, rules);
};

// Link-in-bio page validation
export const validateLinkInBioPage = (pageData) => {
  const rules = {
    title: [
      (value) => validateRequired(value, 'Page title'),
      (value) => validateMinLength(value, 2, 'Page title'),
      (value) => validateMaxLength(value, 100, 'Page title')
    ],
    slug: [
      (value) => validateRequired(value, 'Page slug'),
      (value) => validateSlug(value)
    ],
    bio: [
      (value) => validateMaxLength(value, 500, 'Bio')
    ]
  };

  return validateForm(pageData, rules);
};

// Social media post validation
export const validateSocialMediaPost = (postData) => {
  const rules = {
    title: [
      (value) => validateMaxLength(value, 200, 'Post title')
    ],
    content: [
      (value) => validateRequired(value, 'Post content'),
      (value) => validateMinLength(value, 1, 'Post content'),
      (value) => validateMaxLength(value, 2000, 'Post content')
    ]
  };

  return validateForm(postData, rules);
};

// Invitation validation
export const validateInvitation = (invitationData) => {
  const rules = {
    email: [
      (value) => validateRequired(value, 'Email address'),
      (value) => validateEmail(value)
    ],
    role: [
      (value) => validateRequired(value, 'Role')
    ]
  };

  return validateForm(invitationData, rules);
};

// Branding validation
export const validateBranding = (brandingData) => {
  const rules = {
    primaryColor: [
      (value) => validateHexColor(value)
    ],
    secondaryColor: [
      (value) => validateHexColor(value)
    ],
    customDomain: [
      (value) => validateDomain(value)
    ]
  };

  return validateForm(brandingData, rules);
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateUrl,
  validateDomain,
  validateHexColor,
  validateSlug,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateFileSize,
  validateFileType,
  validateImageFile,
  validateForm,
  validateWorkspaceData,
  validateUserRegistration,
  validateCrmContact,
  validateCourse,
  validateProduct,
  validateEmailCampaign,
  validateLinkInBioPage,
  validateSocialMediaPost,
  validateInvitation,
  validateBranding
};