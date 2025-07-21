'use client';

import { motion } from 'framer-motion';
import { ChatWindow } from '@/components/ChatWindow'
import { ApiKeyGuard } from '@/components/ApiKeyGuard'
import { ModernSidebar } from '@/components/ModernSidebar'
import { StaggerContainer, StaggerItem, ScrollTriggeredStagger } from '@/components/PageTransition'
import { ResponsiveContainer } from '@/components/ResponsiveContainer'
import { GeneratedPrompt } from '@/types'
import { useState } from 'react'

export default function ChatPage() {
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlePromptGenerated = (prompt: GeneratedPrompt) => {
    setCurrentPrompt(prompt);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20">
      {/* Main Container with Enhanced Animations */}
      <StaggerContainer 
        delay={0.1}
        staggerDelay={0.12}
        direction="normal"
        className="relative min-h-screen"
      >
        {/* Animated Background Pattern */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.05, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute inset-0 bg-grid-pattern pointer-events-none" 
        />
        
        <ResponsiveContainer variant="wide" padding="md" className="py-4 sm:py-6 lg:py-8">
          <ApiKeyGuard>
            {/* Enhanced Grid Layout with Stagger */}
            <ScrollTriggeredStagger 
              threshold={0.2}
              rootMargin="-20px"
              className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6 h-[calc(100vh-200px)] sm:h-[calc(100vh-180px)]"
            >
              {/* Main Chat Interface with Enhanced Animation */}
              <StaggerItem 
                className="xl:col-span-3"
                direction="left"
                intensity="normal"
              >
                <motion.div 
                  className="glass-card h-full overflow-hidden hover-glow"
                  whileHover={{ 
                    scale: 1.01,
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                  }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <ChatWindow 
                    onPromptGenerated={handlePromptGenerated}
                    className="h-full"
                    showPromptGenerator={true}
                  />
                </motion.div>
              </StaggerItem>
              
              {/* Desktop Sidebar with Enhanced Animation */}
              <div className="hidden xl:block xl:col-span-1">
                <StaggerItem
                  direction="right"
                  intensity="normal"
                  delay={0.2}
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <ModernSidebar
                      currentPrompt={currentPrompt}
                      isOpen={true}
                      onToggle={toggleSidebar}
                    />
                  </motion.div>
                </StaggerItem>
              </div>
            </ScrollTriggeredStagger>
          </ApiKeyGuard>
        </div>
      </StaggerContainer>

      {/* Mobile Sidebar */}
      <ModernSidebar
        currentPrompt={currentPrompt}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        className="xl:hidden"
      />
    </div>
  )
}