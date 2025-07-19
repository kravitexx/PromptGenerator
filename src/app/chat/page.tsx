'use client';

import { UserButton } from '@clerk/nextjs'
import { ChatWindow } from '@/components/ChatWindow'
import { ApiKeyGuard } from '@/components/ApiKeyGuard'
import { DriveStatus } from '@/components/DriveStatus'
import { ApiKeyManager } from '@/components/ApiKeyManager'
import { GeneratedPrompt } from '@/types'
import { useState } from 'react'

export default function ChatPage() {
  const [currentPrompt, setCurrentPrompt] = useState<GeneratedPrompt | null>(null);

  const handlePromptGenerated = (prompt: GeneratedPrompt) => {
    setCurrentPrompt(prompt);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Prompt Generator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ApiKeyManager compact />
              <DriveStatus />
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8"
                  }
                }}
              />
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ApiKeyGuard>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chat Interface */}
            <div className="lg:col-span-2">
              <ChatWindow 
                onPromptGenerated={handlePromptGenerated}
                className="h-[calc(100vh-200px)]"
                showPromptGenerator={true}
              />
            </div>
            
            {/* Sidebar with API Key, Drive Status and Info */}
            <div className="space-y-6">
              <ApiKeyManager />
              <DriveStatus showDetails={true} />
              
              {currentPrompt && (
                <div className="bg-white rounded-lg shadow-sm p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Current Prompt</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Model: {currentPrompt.metadata.model}
                  </p>
                  <p className="text-xs text-gray-500">
                    Generated: {new Date(currentPrompt.metadata.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </ApiKeyGuard>
      </main>
    </div>
  )
}