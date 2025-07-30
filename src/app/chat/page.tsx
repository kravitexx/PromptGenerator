'use client';

import { SimpleChatWindow } from '@/components/SimpleChatWindow'
import { ApiKeyGuard } from '@/components/ApiKeyGuard'
import { GeneratedPrompt } from '@/types'
import { useState } from 'react'
import { Menu, Plus, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ChatPage() {
  const [currentPrompt] = useState<GeneratedPrompt | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handlePromptGenerated = (prompt: GeneratedPrompt) => {
    // Handle prompt generation if needed
    console.log('Prompt generated:', prompt);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ApiKeyGuard>
      <div className="h-screen flex bg-white">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-gray-900">
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-white font-semibold">Prompt Generator</h2>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600">
                <Plus className="h-4 w-4 mr-2" />
                New chat
              </Button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Recent
                </div>
                {/* Sample chat items */}
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm truncate">
                    Generate fantasy landscape prompt
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm truncate">
                    Portrait photography style
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm truncate">
                    Abstract art composition
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Mobile */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out lg:hidden`}>
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h2 className="text-white font-semibold">Prompt Generator</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="text-white hover:bg-gray-800"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            {/* New Chat Button */}
            <div className="p-4">
              <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white border-gray-600">
                <Plus className="h-4 w-4 mr-2" />
                New chat
              </Button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                <div className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                  Recent
                </div>
                {/* Sample chat items */}
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm truncate">
                    Generate fantasy landscape prompt
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm truncate">
                    Portrait photography style
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded hover:bg-gray-800 cursor-pointer">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm truncate">
                    Abstract art composition
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Prompt Generator</h1>
            <div></div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-hidden">
            <SimpleChatWindow 
              onPromptGenerated={handlePromptGenerated}
              className="h-full"
            />
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </div>
    </ApiKeyGuard>
  )
}