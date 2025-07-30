'use client';

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export default function Home() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && isSignedIn) {
      router.push('/chat')
    }
  }, [mounted, isSignedIn, router])

  if (!mounted) {
    return null
  }

  if (isSignedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6 text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Prompt Generator
          </h1>
          <p className="text-gray-600">
            AI-powered text-to-image prompt generator
          </p>
        </div>
        
        <SignInButton mode="modal">
          <Button size="lg" className="w-full">
            Get Started
          </Button>
        </SignInButton>
      </div>
    </div>
  )
}
