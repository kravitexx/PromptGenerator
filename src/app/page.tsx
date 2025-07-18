import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const { userId } = await auth()
  
  if (userId) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Prompt Generator
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            AI-powered text-to-image prompt generator with universal scaffold support
          </p>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Create structured prompts for Stable Diffusion, Midjourney, DALL·E, and more
            </p>
            <SignInButton mode="modal">
              <Button size="lg" className="w-full">
                Get Started
              </Button>
            </SignInButton>
          </div>
        </div>
      </div>
    </div>
  )
}
