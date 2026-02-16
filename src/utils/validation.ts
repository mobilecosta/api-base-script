export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const validatePasswordStrength = (password: string): {
  isStrong: boolean;
  feedback: string[];
} => {
  const feedback: string[] = [];

  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long');
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Password should contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Password should contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Password should contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    feedback.push('Password should contain at least one special character (!@#$%^&*)');
  }

  return {
    isStrong: feedback.length === 0,
    feedback,
  };
};

export const validateAuthRequest = (email: string, password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!password) {
    errors.push('Password is required');
  } else if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
