import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { StaggerContainer, StaggerItem, MagneticHover } from '@/components/PageTransition'
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
      
      <StaggerContainer 
        className="max-w-lg w-full space-y-8 p-8 relative z-10"
        delay={0.2}
        staggerDelay={0.15}
      >
        <div className="text-center space-y-6">
          {/* Logo and Icon with Magnetic Effect */}
          <StaggerItem direction="scale" intensity="normal">
            <MagneticHover strength={0.2} speed={0.4}>
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg"
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.2)"
                    }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <Sparkles className="h-10 w-10 text-white" />
                  </motion.div>
                  <motion.div 
                    className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />
                </div>
              </div>
            </MagneticHover>
          </StaggerItem>

          {/* Title with Enhanced Animation */}
          <StaggerItem direction="up" intensity="strong">
            <motion.h1 
              className="text-5xl font-bold text-gradient mb-4"
              whileHover={{ 
                scale: 1.05,
                textShadow: "0 0 20px rgba(0,0,0,0.3)"
              }}
              transition={{ duration: 0.2 }}
            >
              Prompt Generator
            </motion.h1>
          </StaggerItem>

          {/* Subtitle */}
          <StaggerItem direction="up" intensity="normal">
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              AI-powered text-to-image prompt generator with universal scaffold support
            </p>
          </StaggerItem>

          {/* Features with Stagger and Hover Effects */}
          <StaggerItem direction="up" intensity="normal">
            <StaggerContainer 
              staggerDelay={0.1}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            >
              <StaggerItem>
                <MagneticHover strength={0.15}>
                  <motion.div 
                    className="glass-card p-4 text-center hover-lift"
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Zap className="h-6 w-6 text-primary mx-auto mb-2" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">AI Powered</p>
                  </motion.div>
                </MagneticHover>
              </StaggerItem>
              
              <StaggerItem>
                <MagneticHover strength={0.15}>
                  <motion.div 
                    className="glass-card p-4 text-center hover-lift"
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Palette className="h-6 w-6 text-accent-foreground mx-auto mb-2" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">Universal Support</p>
                  </motion.div>
                </MagneticHover>
              </StaggerItem>
              
              <StaggerItem>
                <MagneticHover strength={0.15}>
                  <motion.div 
                    className="glass-card p-4 text-center hover-lift"
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Sparkles className="h-6 w-6 text-secondary-foreground mx-auto mb-2" />
                    </motion.div>
                    <p className="text-sm text-muted-foreground">Smart Scaffolds</p>
                  </motion.div>
                </MagneticHover>
              </StaggerItem>
            </StaggerContainer>
          </StaggerItem>

          {/* Description */}
          <StaggerItem direction="up" intensity="subtle">
            <p className="text-sm text-muted-foreground mb-8">
              Create structured prompts for Stable Diffusion, Midjourney, DALL·E, and more with our intelligent scaffold system
            </p>
          </StaggerItem>

          {/* CTA Button with Enhanced Interaction */}
          <StaggerItem direction="scale" intensity="normal">
            <SignInButton mode="modal">
              <MagneticHover strength={0.1}>
                <motion.div
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 15px 35px rgba(0,0,0,0.2)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button size="lg" className="w-full gradient-primary text-white shadow-lg">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                    </motion.div>
                    Get Started
                  </Button>
                </motion.div>
              </MagneticHover>
            </SignInButton>
          </StaggerItem>
        </div>
      </StaggerContainer>
    </div>
  )
}
