'use client';

import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  useAccessibility, 
  useKeyboardNavigation, 
  useScreenReader, 
  useFocusManagement,
  useAriaLiveRegion,
  a11yUtils
} from '@/hooks/useAccessibility';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Accessible button with enhanced keyboard and screen reader support
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loading?: boolean;
  loadingText?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ 
    children, 
    variant = 'default', 
    size = 'default',
    loading = false,
    loadingText = 'Loading',
    ariaLabel,
    ariaDescribedBy,
    disabled,
    onClick,
    ...props 
  }, ref) => {
    const accessibility = useAccessibility();
    const { announce } = useScreenReader();
    const [isPressed, setIsPressed] = useState(false);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      
      // Announce action for screen readers
      if (accessibility.screenReader && ariaLabel) {
        announce(`${ariaLabel} activated`);
      }
      
      onClick?.(e);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as any);
      }
    };

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-pressed={isPressed}
        aria-busy={loading}
        className={`
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${accessibility.highContrast ? 'border-2 border-current' : ''}
          ${accessibility.largeText ? 'text-lg px-6 py-3' : ''}
        `}
        {...props}
      >
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
              aria-hidden="true"
            />
            <span className="sr-only">{loadingText}</span>
            {accessibility.screenReader ? loadingText : children}
          </>
        ) : (
          children
        )}
      </Button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

// Accessible modal with focus trapping and ARIA support
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function AccessibleModal({ isOpen, onClose, title, children, className = '' }: AccessibleModalProps) {
  const { saveFocus, restoreFocus, trapFocus } = useFocusManagement();
  const { announce } = useScreenReader();
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = a11yUtils.generateId('modal-title');
  const descId = a11yUtils.generateId('modal-desc');

  useEffect(() => {
    if (isOpen) {
      saveFocus();
      announce(`Modal opened: ${title}`);
      
      if (modalRef.current) {
        const cleanup = trapFocus(modalRef.current);
        return cleanup;
      }
    } else {
      restoreFocus();
      announce('Modal closed');
    }
  }, [isOpen, saveFocus, restoreFocus, trapFocus, announce, title]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
              fixed inset-0 z-50 flex items-center justify-center p-4
              ${className}
            `}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
          >
            <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 id={titleId} className="text-lg font-semibold">
                    {title}
                  </h2>
                  <AccessibleButton
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    ariaLabel="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </AccessibleButton>
                </div>
                
                <div id={descId}>
                  {children}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Accessible notification/toast component
interface AccessibleNotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function AccessibleNotification({
  type,
  title,
  message,
  isVisible,
  onClose,
  autoClose = true,
  duration = 5000
}: AccessibleNotificationProps) {
  const { announce } = useScreenReader();
  const { updateLiveRegion, LiveRegion } = useAriaLiveRegion();

  useEffect(() => {
    if (isVisible) {
      const announcement = `${type}: ${title}${message ? `. ${message}` : ''}`;
      announce(announcement, type === 'error' ? 'assertive' : 'polite');
      updateLiveRegion(announcement, type === 'error' ? 'assertive' : 'polite');
    }
  }, [isVisible, type, title, message, announce, updateLiveRegion]);

  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <>
      <LiveRegion />
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.95 }}
            className={`
              fixed top-4 right-4 z-50 max-w-sm w-full
              border rounded-lg p-4 shadow-lg
              ${getStyles()}
            `}
            role="alert"
            aria-live={type === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0" aria-hidden="true">
                {getIcon()}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">
                  {title}
                </h3>
                {message && (
                  <p className="text-sm mt-1 opacity-90">
                    {message}
                  </p>
                )}
              </div>
              
              <AccessibleButton
                variant="ghost"
                size="icon"
                onClick={onClose}
                ariaLabel={`Close ${type} notification`}
                className="flex-shrink-0 -mr-1 -mt-1"
              >
                <X className="h-4 w-4" />
              </AccessibleButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Accessible accordion/collapsible component
interface AccessibleAccordionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export function AccessibleAccordion({ 
  title, 
  children, 
  defaultOpen = false, 
  className = '' 
}: AccessibleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { announce } = useScreenReader();
  const contentId = a11yUtils.generateId('accordion-content');
  const buttonId = a11yUtils.generateId('accordion-button');

  const toggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    announce(`${title} ${newState ? 'expanded' : 'collapsed'}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };

  return (
    <div className={`border rounded-lg ${className}`}>
      <button
        id={buttonId}
        className="
          w-full px-4 py-3 text-left font-medium
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
          hover:bg-gray-50 transition-colors
          flex items-center justify-between
        "
        onClick={toggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span>{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          aria-hidden="true"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            role="region"
            aria-labelledby={buttonId}
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Accessible skip link component
export function SkipLink({ href = '#main-content', children = 'Skip to main content' }) {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        bg-blue-600 text-white px-4 py-2 rounded-md z-50
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      "
    >
      {children}
    </a>
  );
}

// Screen reader only text component
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}