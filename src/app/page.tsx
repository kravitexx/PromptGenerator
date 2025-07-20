import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { StaggerContainer, StaggerItem } from '@/components/PageTransition'
import { Sparkles, Zap, Palette } from 'lucide-react'

export default async function Home() {
  const { userId } = await auth()
  
  if (userId) {
    redirect('/chat')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      
      <StaggerContainer className="max-w-lg w-full space-y-8 p-8 relative z-10">
        <div className="text-center space-y-6">
          {/* Logo and Icon */}
          <StaggerItem>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full animate-pulse-glow" />
              </div>
            </div>
          </StaggerItem>

          {/* Title */}
          <StaggerItem>
            <h1 className="text-5xl font-bold text-gradient mb-4">
              Prompt Generator
            </h1>
          </StaggerItem>

          {/* Subtitle */}
          <StaggerItem>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              AI-powered text-to-image prompt generator with universal scaffold support
            </p>
          </StaggerItem>

          {/* Features */}
          <StaggerItem>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="glass-card p-4 text-center hover-lift">
                <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">AI Powered</p>
              </div>
              <div className="glass-card p-4 text-center hover-lift">
                <Palette className="h-6 w-6 text-accent-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Universal Support</p>
              </div>
              <div className="glass-card p-4 text-center hover-lift">
                <Sparkles className="h-6 w-6 text-secondary-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Smart Scaffolds</p>
              </div>
            </div>
          </StaggerItem>

          {/* Description */}
          <StaggerItem>
            <p className="text-sm text-muted-foreground mb-8">
              Create structured prompts for Stable Diffusion, Midjourney, DALL·E, and more with our intelligent scaffold system
            </p>
          </StaggerItem>

          {/* CTA Button */}
          <StaggerItem>
            <SignInButton mode="modal">
              <Button size="lg" className="w-full gradient-primary text-white hover-scale shadow-lg">
                <Sparkles className="h-4 w-4 mr-2" />
                Get Started
              </Button>
            </SignInButton>
          </StaggerItem>
        </div>
      </StaggerContainer>
    </div>
  )
}
