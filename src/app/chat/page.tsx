'use client';

import { motion } from 'framer-motion';
import { ChatWindow } from '@/components/ChatWindow'
import { ApiKeyGuard } from '@/components/ApiKeyGuard'
import { ModernHeader } from '@/components/ModernHeader'
import { ModernSidebar } from '@/components/ModernSidebar'
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Modern Header */}
      <ModernHeader />
      
      {/* Main Container with Glass Morphism */}
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ApiKeyGuard>
            {/* Modern Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
              {/* Main Chat Interface - Takes up most space */}
              <motion.div 
                className="xl:col-span-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="glass-card h-full overflow-hidden hover-glow">
                  <ChatWindow 
                    onPromptGenerated={handlePromptGenerated}
                    className="h-full"
                    showPromptGenerator={true}
                  />
                </div>
              </motion.div>
              
              {/* Desktop Sidebar */}
              <div className="hidden xl:block xl:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <ModernSidebar
                    currentPrompt={currentPrompt}
                    isOpen={true}
                    onToggle={toggleSidebar}
                  />
                </motion.div>
              </div>
            </div>
          </ApiKeyGuard>
        </div>
      </motion.main>

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