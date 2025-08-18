import { useMemo } from 'react';

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface ValidationConfig {
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  customRules?: ValidationRule[];
  preventInjection?: boolean;
}

export const useInputValidation = (config: ValidationConfig = {}) => {
  const {
    maxLength = 4000,
    minLength = 0,
    required = false,
    customRules = [],
    preventInjection = true
  } = config;

  const injectionPatterns = useMemo(() => [
    // Prompt injection patterns
    /(ignore|forget|disregard).*(previous|above|system|instruction|prompt)/i,
    /(you\s+(are|must|should|will|now)).*(instead|override|actually)/i,
    /jailbreak|prompt.injection|system.override/i,
    // SQL injection patterns (basic)
    /(union|select|insert|delete|update|drop|exec|script)/i,
    // XSS patterns (basic)
    /<script|javascript:|on\w+\s*=/i
  ], []);

  const validate = (value: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required validation
    if (required && !value.trim()) {
      errors.push('This field is required');
    }

    // Length validations
    if (value.length < minLength) {
      errors.push(`Minimum ${minLength} characters required`);
    }

    if (value.length > maxLength) {
      errors.push(`Maximum ${maxLength} characters allowed`);
    }

    // Injection prevention
    if (preventInjection && value.trim()) {
      for (const pattern of injectionPatterns) {
        if (pattern.test(value)) {
          errors.push('Input contains potentially harmful content');
          break;
        }
      }
    }

    // Custom rules
    for (const rule of customRules) {
      if (!rule.test(value)) {
        errors.push(rule.message);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const sanitize = (value: string): string => {
    // Basic sanitization
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  return {
    validate,
    sanitize
  };
};