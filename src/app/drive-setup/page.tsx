'use client';

import { useRouter } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { DriveAuthButton } from '@/components/DriveAuthButton';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function DriveSetupPage() {
  const router = useRouter();

  const handleAuthSuccess = (_token: string) => {
    // Redirect back to chat after successful authentication
    setTimeout(() => {
      router.push('/chat');
    }, 1000);
  };

  const handleAuthError = (error: string) => {
    console.error('Drive auth error:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Google Drive Setup
              </h1>
            </div>
            <div className="flex items-center space-x-4">
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
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Connect Google Drive
          </h2>
          <p className="text-lg text-gray-600">
            Enable data persistence to save your chat history and custom formats across sessions.
          </p>
        </div>

        <DriveAuthButton
          onAuthSuccess={handleAuthSuccess}
          onAuthError={handleAuthError}
          className="max-w-md mx-auto"
        />

        <div className="mt-8 text-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/chat')}
          >
            Skip for now
          </Button>
        </div>
      </main>
    </div>
  );
}