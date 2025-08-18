import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface SecurityContextType {
  isSecurityMode: boolean;
  enableSecurityMode: () => void;
  disableSecurityMode: () => void;
  validateInput: (input: string) => boolean;
  sanitizeOutput: (output: string) => string;
  logSecurityEvent: (event: string, details?: any) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isSecurityMode, setIsSecurityMode] = useState(false);

  useEffect(() => {
    // Auto-enable security mode in production
    if (process.env.NODE_ENV === 'production') {
      setIsSecurityMode(true);
    }
  }, []);

  const enableSecurityMode = () => {
    setIsSecurityMode(true);
    toast.success('Enhanced security mode enabled');
    logSecurityEvent('security_mode_enabled');
  };

  const disableSecurityMode = () => {
    setIsSecurityMode(false);
    toast.info('Security mode disabled');
    logSecurityEvent('security_mode_disabled');
  };

  const validateInput = (input: string): boolean => {
    if (!isSecurityMode) return true;

    // Check for potential injection patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /(union|select|insert|delete|update|drop)\s+/i,
      /(ignore|forget|disregard).*(previous|above|system|instruction)/i,
      /you\s+(are|must|should|will|now).*(instead|override|actually)/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(input)) {
        logSecurityEvent('input_validation_failed', { input: input.substring(0, 100) });
        return false;
      }
    }

    return true;
  };

  const sanitizeOutput = (output: string): string => {
    if (!isSecurityMode) return output;

    return output
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  const logSecurityEvent = (event: string, details?: any) => {
    const logData = {
      event,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      details
    };

    // In a real app, send this to your security monitoring service
    console.log('[SECURITY EVENT]', logData);

    // Store in localStorage for demo purposes
    try {
      const existingLogs = JSON.parse(localStorage.getItem('security_logs') || '[]');
      existingLogs.push(logData);
      
      // Keep only last 100 events
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('security_logs', JSON.stringify(existingLogs));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        isSecurityMode,
        enableSecurityMode,
        disableSecurityMode,
        validateInput,
        sanitizeOutput,
        logSecurityEvent
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};
