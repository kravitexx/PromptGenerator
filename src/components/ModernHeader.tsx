'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { DriveStatus } from '@/components/DriveStatus';
import { 
  Sparkles, 
  Zap, 
  Settings,
  Menu,
  X
} from 'lucide-react';

interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  showApiKeyManager?: boolean;
  showDriveStatus?: boolean;
  className?: string;
}

export function ModernHeader({ 
  title = "AI Prompt Generator",
  subtitle = "Create perfect prompts with AI assistance",
  showApiKeyManager = true,
  showDriveStatus = true,
  className = ""
}: ModernHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 gradient-primary opacity-90" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20" />
      
      {/* Floating Orbs */}
      <div className="absolute top-4 left-1/4 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" />
      <div className="absolute top-8 right-1/3 w-24 h-24 bg-cyan-400/20 rounded-full blur-lg animate-float" style={{ animationDelay: '1s' }} />
      <div className="absolute -top-4 right-1/4 w-40 h-40 bg-purple-400/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left Section - Logo and Title */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 rounded-full animate-pulse-glow" />
              </div>
              
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  {title}
                </h1>
                <p className="text-sm text-white/80 font-medium">
                  {subtitle}
                </p>
              </div>
            </div>
            
            {/* Status Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Badge 
                variant="secondary" 
                className="bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <Zap className="h-3 w-3 mr-1" />
                Powered by Gemini 2.5
              </Badge>
            </motion.div>
          </motion.div>

          {/* Right Section - Actions */}
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-3">
              {showDriveStatus && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <DriveStatus />
                </motion.div>
              )}
              
              {showApiKeyManager && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ApiKeyManager compact />
                </motion.div>
              )}
              
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
                >
                  Clear Data
                </Button>
              )}
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-9 w-9 ring-2 ring-white/30 ring-offset-2 ring-offset-transparent"
                    }
                  }}
                />
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:bg-white/20 backdrop-blur-sm border border-white/20"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-white/20 pt-4 pb-6 space-y-4"
          >
            <div className="flex flex-col space-y-3">
              {showDriveStatus && (
                <div className="flex justify-center">
                  <DriveStatus showDetails={false} />
                </div>
              )}
              
              {showApiKeyManager && (
                <div className="flex justify-center">
                  <ApiKeyManager compact />
                </div>
              )}
              
              <div className="flex justify-center">
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "h-10 w-10 ring-2 ring-white/30 ring-offset-2 ring-offset-transparent"
                    }
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Bottom Glow Effect */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </motion.header>
  );
}