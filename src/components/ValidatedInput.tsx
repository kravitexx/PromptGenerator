'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { validateEmail, validateApiKey, validatePromptInput, sanitizeInput } from '@/lib/errorHandling';

interface ValidationRule {
  type: 'email' | 'apiKey' | 'prompt' | 'required' | 'minLength' | 'maxLength' | 'custom';
  value?: number;
  message?: string;
  validator?: (value: string) => { isValid: boolean; message?: string };
}

interface ValidatedInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, message?: string) => void;
  rules?: ValidationRule[];
  type?: 'text' | 'email' | 'password' | 'textarea';
  disabled?: boolean;
  required?: boolean;
  autoSanitize?: boolean;
  showValidationIcon?: boolean;
  className?: string;
}

export function ValidatedInput({
  label,
  placeholder,
  value,
  onChange,
  onValidationChange,
  rules = [],
  type = 'text',
  disabled = false,
  required = false,
  autoSanitize = false,
  showValidationIcon = true,
  className = '',
}: ValidatedInputProps) {
  const [validationState, setValidationState] = useState<{
    isValid: boolean;
    message?: string;
    isDirty: boolean;
  }>({
    isValid: true,
    isDirty: false,
  });

  // Add required rule if specified
  const allRules = required 
    ? [{ type: 'required' as const, message: `${label || 'This field'} is required` }, ...rules]
    : rules;

  const validateValue = (inputValue: string) => {
    // If empty and not required, it's valid
    if (!inputValue.trim() && !required) {
      return { isValid: true };
    }

    // Check all validation rules
    for (const rule of allRules) {
      let result: { isValid: boolean; message?: string };

      switch (rule.type) {
        case 'required':
          result = {
            isValid: Boolean(inputValue.trim()),
            message: rule.message || 'This field is required',
          };
          break;

        case 'email':
          result = validateEmail(inputValue);
          break;

        case 'apiKey':
          result = validateApiKey(inputValue);
          break;

        case 'prompt':
          result = validatePromptInput(inputValue);
          break;

        case 'minLength':
          result = {
            isValid: inputValue.length >= (rule.value || 0),
            message: rule.message || `Minimum ${rule.value} characters required`,
          };
          break;

        case 'maxLength':
          result = {
            isValid: inputValue.length <= (rule.value || Infinity),
            message: rule.message || `Maximum ${rule.value} characters allowed`,
          };
          break;

        case 'custom':
          result = rule.validator ? rule.validator(inputValue) : { isValid: true };
          break;

        default:
          result = { isValid: true };
      }

      if (!result.isValid) {
        return result;
      }
    }

    return { isValid: true };
  };

  const handleChange = (newValue: string) => {
    const processedValue = autoSanitize ? sanitizeInput(newValue) : newValue;
    onChange(processedValue);

    // Mark as dirty after first interaction
    if (!validationState.isDirty) {
      setValidationState(prev => ({ ...prev, isDirty: true }));
    }
  };

  // Validate on value change
  useEffect(() => {
    const validation = validateValue(value);
    
    setValidationState(prev => ({
      ...validation,
      isDirty: prev.isDirty,
    }));

    // Notify parent of validation state
    if (onValidationChange) {
      onValidationChange(validation.isValid, validation.message);
    }
  }, [value, rules, required]);

  const showError = validationState.isDirty && !validationState.isValid;
  const showSuccess = validationState.isDirty && validationState.isValid && value.trim();

  const inputProps = {
    placeholder,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
      handleChange(e.target.value),
    disabled,
    className: `${className} ${
      showError 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
        : showSuccess 
        ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
        : ''
    }`,
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {type === 'textarea' ? (
          <Textarea {...inputProps} />
        ) : (
          <Input {...inputProps} type={type} />
        )}
        
        {showValidationIcon && (showError || showSuccess) && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {showError ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>

      {showError && validationState.message && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {validationState.message}
        </p>
      )}
    </div>
  );
}

// Specialized components for common use cases
export function EmailInput(props: Omit<ValidatedInputProps, 'type' | 'rules'>) {
  return (
    <ValidatedInput
      {...props}
      type="email"
      rules={[{ type: 'email' }]}
    />
  );
}

export function ApiKeyInput(props: Omit<ValidatedInputProps, 'type' | 'rules'>) {
  return (
    <ValidatedInput
      {...props}
      type="password"
      rules={[{ type: 'apiKey' }]}
      autoSanitize={true}
    />
  );
}

export function PromptInput(props: Omit<ValidatedInputProps, 'type' | 'rules'>) {
  return (
    <ValidatedInput
      {...props}
      type="textarea"
      rules={[{ type: 'prompt' }]}
      autoSanitize={true}
    />
  );
}