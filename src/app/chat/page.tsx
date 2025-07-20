'use client';

import { motion } from 'framer-motion';
import { ChatWindow } from '@/components/ChatWindow'
import { ApiKeyGuard } from '@/components/ApiKeyGuard'
import { ModernHeader } from '@/components/ModernHeader'
import { ModernSidebar } from '@/components/ModernSidebar'
import { StaggerContainer, StaggerItem } from '@/components/PageTransition'
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
      <StaggerContainer 
        delay={0.2}
        staggerDelay={0.15}
        className="relative"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ApiKeyGuard>
            {/* Modern Grid Layout */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-[calc(100vh-180px)]">
              {/* Main Chat Interface - Takes up most space */}
              <StaggerItem className="xl:col-span-3">
                <div className="glass-card h-full overflow-hidden hover-glow">
                  <ChatWindow 
                    onPromptGenerated={handlePromptGenerated}
                    className="h-full"
                    showPromptGenerator={true}
                  />
                </div>
              </StaggerItem>
              
              {/* Desktop Sidebar */}
              <div className="hidden xl:block xl:col-span-1">
                <StaggerItem>
                  <ModernSidebar
                    currentPrompt={currentPrompt}
                    isOpen={true}
                    onToggle={toggleSidebar}
                  />
                </StaggerItem>
              </div>
            </div>
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