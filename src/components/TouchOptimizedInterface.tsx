'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGestures } from '@/hooks/useGestures';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Vibrate,
  Volume2,
  VolumeX,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';

interface TouchOptimizedInterfaceProps {
  children: React.ReactNode;
  className?: string;
}

// Device detection hook
function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return deviceType;
}

// Touch feedback hook
function useTouchFeedback() {
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (!hapticEnabled) return;

    if ('vibrate' in navigator) {
      const patterns = {
        light: 25,
        medium: 50,
        heavy: 100
      };
      navigator.vibrate(patterns[type]);
    }
  };

  const triggerSound = (type: 'tap' | 'success' | 'error' = 'tap') => {
    if (!soundEnabled) return;

    // Create audio context for touch sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    const frequencies = {
      tap: 800,
      success: 1000,
      error: 400
    };

    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  return {
    hapticEnabled,
    soundEnabled,
    setHapticEnabled,
    setSoundEnabled,
    triggerHaptic,
    triggerSound
  };
}

export function TouchOptimizedInterface({ children, className = '' }: TouchOptimizedInterfaceProps) {
  const deviceType = useDeviceType();
  const touchFeedback = useTouchFeedback();
  const [showSettings, setShowSettings] = useState(false);

  // Touch-optimized button sizes based on device
  const buttonSizes = {
    mobile: 'h-12 min-w-12 text-base',
    tablet: 'h-10 min-w-10 text-sm',
    desktop: 'h-9 min-w-9 text-sm'
  };

  // Touch-optimized spacing
  const spacing = {
    mobile: 'p-4 gap-4',
    tablet: 'p-3 gap-3',
    desktop: 'p-2 gap-2'
  };

  // Enhanced touch button component
  const TouchButton = ({ 
    children, 
    onClick, 
    variant = 'default',
    disabled = false,
    hapticType = 'light',
    ...props 
  }: any) => {
    const gestures = useGestures({
      onTap: () => {
        if (!disabled) {
          touchFeedback.triggerHaptic(hapticType);
          touchFeedback.triggerSound('tap');
          onClick?.();
        }
      }
    });

    return (
      <motion.div
        ref={gestures.ref}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Button
          variant={variant}
          disabled={disabled}
          className={`${buttonSizes[deviceType]} touch-manipulation select-none`}
          {...props}
        >
          {children}
        </Button>
      </motion.div>
    );
  };

  // Touch-optimized card component
  const TouchCard = ({ children, onTap, onLongPress, ...props }: any) => {
    const gestures = useGestures({
      onTap: () => {
        touchFeedback.triggerHaptic('light');
        onTap?.();
      },
      onLongPress: () => {
        touchFeedback.triggerHaptic('medium');
        onLongPress?.();
      }
    });

    return (
      <motion.div
        ref={gestures.ref}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Card 
          className={`touch-manipulation select-none cursor-pointer ${spacing[deviceType]}`}
          {...props}
        >
          {children}
        </Card>
      </motion.div>
    );
  };

  return (
    <div className={`touch-optimized-interface ${className}`}>
      {/* Device-specific styles */}
      <style jsx>{`
        .touch-optimized-interface {
          /* Prevent text selection on touch */
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          
          /* Optimize touch targets */
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
          
          /* Smooth scrolling */
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }
        
        /* Touch-friendly scrollbars */
        .touch-optimized-interface ::-webkit-scrollbar {
          width: ${deviceType === 'mobile' ? '8px' : '6px'};
        }
        
        .touch-optimized-interface ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        
        .touch-optimized-interface ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        
        .touch-optimized-interface ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.5);
        }
      `}</style>

      {/* Touch feedback settings */}
      <div className="fixed top-4 right-4 z-50">
        <TouchButton
          variant="ghost"
          onClick={() => setShowSettings(!showSettings)}
          className="bg-white/80 backdrop-blur-sm shadow-lg"
        >
          {deviceType === 'mobile' && <Smartphone className="h-4 w-4" />}
          {deviceType === 'tablet' && <Tablet className="h-4 w-4" />}
          {deviceType === 'desktop' && <Monitor className="h-4 w-4" />}
        </TouchButton>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute top-12 right-0 bg-white rounded-lg shadow-xl p-4 min-w-48"
            >
              <h3 className="font-semibold mb-3 text-sm">Touch Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Haptic Feedback</span>
                  <TouchButton
                    variant={touchFeedback.hapticEnabled ? 'default' : 'outline'}
                    onClick={() => touchFeedback.setHapticEnabled(!touchFeedback.hapticEnabled)}
                    className="h-8 w-8 p-0"
                  >
                    <Vibrate className="h-3 w-3" />
                  </TouchButton>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Touch Sounds</span>
                  <TouchButton
                    variant={touchFeedback.soundEnabled ? 'default' : 'outline'}
                    onClick={() => touchFeedback.setSoundEnabled(!touchFeedback.soundEnabled)}
                    className="h-8 w-8 p-0"
                  >
                    {touchFeedback.soundEnabled ? (
                      <Volume2 className="h-3 w-3" />
                    ) : (
                      <VolumeX className="h-3 w-3" />
                    )}
                  </TouchButton>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">
                    Device: {deviceType}
                  </div>
                  <div className="text-xs text-gray-500">
                    Screen: {window.innerWidth}×{window.innerHeight}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Enhanced children with touch context */}
      <div className={`${spacing[deviceType]} min-h-screen`}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              ...child.props,
              touchOptimized: true,
              deviceType,
              TouchButton,
              TouchCard,
              touchFeedback
            } as any);
          }
          return child;
        })}
      </div>

      {/* Touch gesture hints for first-time users */}
      <AnimatePresence>
        {deviceType === 'mobile' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center"
          >
            <div className="text-sm text-blue-800">
              💡 <strong>Touch Tips:</strong> Swipe to navigate • Long press for options • Double tap for actions
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}