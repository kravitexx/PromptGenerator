'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  X, 
  MessageSquare, 
  Settings, 
  History, 
  Bookmark,
  TrendingUp,
  Clock,
  Cpu
} from 'lucide-react';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { DriveStatus } from '@/components/DriveStatus';
import { GeneratedPrompt } from '@/types';
import { formatDate } from '@/lib/utils';

interface ModernSidebarProps {
  currentPrompt?: GeneratedPrompt | null;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export function ModernSidebar({ 
  currentPrompt, 
  isOpen, 
  onToggle, 
  className = "" 
}: ModernSidebarProps) {
  const sidebarVariants = {
    open: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  const overlayVariants = {
    open: {
      opacity: 1,
      transition: { duration: 0.2 }
    },
    closed: {
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="xl:hidden fixed top-24 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="glass-card border-0 shadow-lg hover-glow"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        className={`
          fixed xl:relative top-0 right-0 h-full xl:h-auto
          w-80 xl:w-full xl:max-w-none
          bg-background/95 xl:bg-transparent
          backdrop-blur-lg xl:backdrop-blur-none
          border-l xl:border-l-0 border-border/50
          z-50 xl:z-auto
          overflow-y-auto
          ${className}
        `}
      >
        <div className="p-4 xl:p-0 space-y-4 h-full">
          {/* Header - Mobile Only */}
          <div className="xl:hidden flex items-center justify-between pb-4 border-b border-border/50">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation Menu - Mobile Only */}
          <div className="xl:hidden space-y-2">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Bookmark className="h-4 w-4 mr-2" />
              Saved
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Divider - Mobile Only */}
          <div className="xl:hidden border-t border-border/50" />

          {/* Cards Container */}
          <div className="space-y-4 flex-1">
            {/* API Key Manager Card */}
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-card border-0 shadow-lg hover-glow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    API Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ApiKeyManager />
                </CardContent>
              </Card>
            </motion.div>

            {/* Drive Status Card */}
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-card border-0 shadow-lg hover-glow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Storage Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <DriveStatus showDetails={true} />
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Current Prompt Card */}
            <AnimatePresence>
              {currentPrompt && (
                <motion.div
                  custom={2}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="glass-card border-0 shadow-lg hover-glow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Cpu className="h-4 w-4" />
                        Current Prompt
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {currentPrompt.metadata.model}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDate(currentPrompt.metadata.createdAt)}
                      </div>
                      <div className="text-xs text-foreground/80 line-clamp-3">
                        {currentPrompt.content.substring(0, 100)}...
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick Stats Card */}
            <motion.div
              custom={3}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-card border-0 shadow-lg hover-glow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Session Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-primary">
                        {currentPrompt ? '1' : '0'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Prompts
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-accent-foreground">
                        Active
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Status
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}