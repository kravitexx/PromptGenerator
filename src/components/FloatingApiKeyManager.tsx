'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useApiKey } from '@/hooks/useApiKey';
import { 
  Key, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Settings, 
  Shield, 
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Copy,
  RefreshCw
} from 'lucide-react';

interface FloatingApiKeyManagerProps {
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

// Animation variants
const containerVariants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      staggerChildren: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 10,
    filter: 'blur(2px)',
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
};

const itemVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

const statusVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  }
};

export function FloatingApiKeyManager({ isOpen, onToggle, className }: FloatingApiKeyManagerProps) {
  const { apiKey, setApiKey, hasValidKey, isValidating, validateKey } = useApiKey();
  const [localKey, setLocalKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Initialize local key when component mounts or API key changes
  useEffect(() => {
    setLocalKey(apiKey || '');
  }, [apiKey]);

  const handleSave = async () => {
    if (!localKey.trim()) return;
    
    setIsSaving(true);
    setSaveStatus('idle');
    
    try {
      await setApiKey(localKey.trim());
      const isValid = await validateKey(localKey.trim());
      
      if (isValid) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setLocalKey('');
    setApiKey('');
    setSaveStatus('idle');
  };

  const handleCopy = async () => {
    if (apiKey) {
      await navigator.clipboard.writeText(apiKey);
      // Could add a toast notification here
    }
  };

  const getStatusColor = () => {
    if (saveStatus === 'success') return 'text-green-600';
    if (saveStatus === 'error') return 'text-red-600';
    if (hasValidKey) return 'text-green-600';
    if (isValidating) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getStatusIcon = () => {
    if (saveStatus === 'success') return <Check className="h-4 w-4" />;
    if (saveStatus === 'error') return <X className="h-4 w-4" />;
    if (hasValidKey) return <Shield className="h-4 w-4" />;
    if (isValidating) return <RefreshCw className="h-4 w-4 animate-spin" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (saveStatus === 'success') return 'Key saved successfully!';
    if (saveStatus === 'error') return 'Invalid API key';
    if (hasValidKey) return 'API key is valid';
    if (isValidating) return 'Validating...';
    return 'API key required';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
          />
          
          {/* Floating Card */}
          <motion.div
            className={`fixed top-20 right-6 w-96 z-50 ${className}`}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className="glass-card p-6 rounded-2xl shadow-2xl border border-white/20 bg-white/90 backdrop-blur-xl">
              {/* Header */}
              <motion.div 
                className="flex items-center justify-between mb-6"
                variants={itemVariants}
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <Key className="h-6 w-6 text-blue-600" />
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">API Key Manager</h3>
                    <p className="text-xs text-gray-500">Secure Gemini AI configuration</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4 text-gray-500" />
                </motion.button>
              </motion.div>

              {/* Status Indicator */}
              <motion.div 
                className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-gray-50/50"
                variants={itemVariants}
              >
                <motion.div
                  variants={statusVariants}
                  className={getStatusColor()}
                >
                  {getStatusIcon()}
                </motion.div>
                <div className="flex-1">
                  <span className={`text-sm font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge 
                    variant={hasValidKey ? "default" : "secondary"}
                    className={`text-xs ${
                      hasValidKey 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {hasValidKey ? 'Active' : 'Inactive'}
                  </Badge>
                </motion.div>
              </motion.div>

              {/* API Key Input */}
              <motion.div 
                className="space-y-4"
                variants={itemVariants}
              >
                <div className="relative">
                  <Input
                    type={showKey ? 'text' : 'password'}
                    value={localKey}
                    onChange={(e) => setLocalKey(e.target.value)}
                    placeholder="Enter your Gemini API key..."
                    className="pr-20 bg-white/50 border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all"
                    disabled={isSaving}
                  />
                  
                  {/* Eye toggle button */}
                  <motion.button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </motion.button>
                  
                  {/* Copy button */}
                  {apiKey && (
                    <motion.button
                      type="button"
                      onClick={handleCopy}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Copy className="h-4 w-4 text-gray-500" />
                    </motion.button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.div
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      onClick={handleSave}
                      disabled={!localKey.trim() || isSaving || localKey === apiKey}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                    >
                      {isSaving ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                        </motion.div>
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? 'Saving...' : 'Save Key'}
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleClear}
                      disabled={!localKey && !apiKey}
                      className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Expandable Advanced Section */}
              <motion.div 
                className="mt-6 pt-4 border-t border-gray-200/50"
                variants={itemVariants}
              >
                <motion.button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Advanced Settings</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 space-y-4"
                    >
                      {/* Security Info */}
                      <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-blue-800">Security Notice</h4>
                            <p className="text-xs text-blue-600 mt-1 leading-relaxed">
                              Your API key is stored locally and encrypted. It's never sent to our servers.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Key Info */}
                      {apiKey && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Key Length:</span>
                            <span>{apiKey.length} characters</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Key Preview:</span>
                            <span className="font-mono">
                              {apiKey.substring(0, 8)}...{apiKey.substring(apiKey.length - 4)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Test Connection Button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => validateKey(apiKey || '')}
                          disabled={!apiKey || isValidating}
                          className="w-full"
                        >
                          {isValidating ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                            </motion.div>
                          ) : (
                            <Sparkles className="h-4 w-4 mr-2" />
                          )}
                          {isValidating ? 'Testing...' : 'Test Connection'}
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Footer */}
              <motion.div 
                className="mt-6 pt-4 border-t border-gray-200/50 text-center"
                variants={itemVariants}
              >
                <p className="text-xs text-gray-500">
                  Get your API key from{' '}
                  <a 
                    href="https://makersuite.google.com/app/apikey" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    Google AI Studio
                  </a>
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}