import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useInputValidation, ValidationConfig } from '@/hooks/useInputValidation';
import { useRateLimiting } from '@/hooks/useRateLimiting';
import { AlertTriangle, Shield } from 'lucide-react';

interface SecureInputProps extends React.ComponentProps<typeof Input> {
  validationConfig?: ValidationConfig;
  rateLimitConfig?: {
    maxRequests: number;
    windowMs: number;
  };
  onValidatedChange?: (value: string, isValid: boolean) => void;
  showValidationStatus?: boolean;
  showCharacterCount?: boolean;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  validationConfig,
  rateLimitConfig,
  onValidatedChange,
  showValidationStatus = true,
  showCharacterCount = true,
  value,
  onChange,
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const { validate, sanitize } = useInputValidation(validationConfig);
  const rateLimiter = rateLimitConfig ? useRateLimiting(rateLimitConfig) : null;

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Rate limiting check
    if (rateLimiter && !rateLimiter.checkRateLimit()) {
      return;
    }

    // Validation
    const { isValid, errors } = validate(newValue);
    setValidationErrors(errors);
    setInputValue(newValue);

    // Call original onChange
    if (onChange) {
      onChange(e);
    }

    // Call validated change callback
    if (onValidatedChange) {
      onValidatedChange(sanitize(newValue), isValid);
    }
  };

  const maxLength = validationConfig?.maxLength || 4000;
  const characterCount = String(inputValue).length;
  const isNearLimit = characterCount > maxLength * 0.8;
  const hasErrors = validationErrors.length > 0;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          {...props}
          value={inputValue}
          onChange={handleChange}
          className={hasErrors ? 'border-destructive' : ''}
          maxLength={maxLength}
        />
        
        {showValidationStatus && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {hasErrors ? (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            ) : inputValue && (
              <Shield className="w-4 h-4 text-green-600" />
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        {showCharacterCount && (
          <Badge variant={isNearLimit ? 'destructive' : 'secondary'} className="text-xs">
            {characterCount}/{maxLength}
          </Badge>
        )}
        
        {rateLimiter && (
          <Badge variant="outline" className="text-xs">
            {rateLimiter.getRemainingRequests()} requests remaining
          </Badge>
        )}
      </div>

      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};