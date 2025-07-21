'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { MobileNavigation } from './MobileNavigation';
import { Button } from '@/components/ui/button';
import { UserButton } from '@clerk/nextjs';
import { 
  Home, 
  MessageSquare, 
  FileText, 
  BarChart3,
  Settings,
  Sparkles
} from 'lucide-react';

interface ResponsiveHeaderProps {
  className?: string;
}

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/formats', label: 'Formats', icon: FileText },
  { href: '/performance', label: 'Performance', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function ResponsiveHeader({ className = '' }: ResponsiveHeaderProps) {
  const pathname = usePathname();

  return (
    <header className={`w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-30 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
              >
                <Sparkles className="h-5 w-5 text-white" />
              </motion.div>
              <span className="font-bold text-xl hidden sm:inline-block">Prompt Generator</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={`gap-2 ${isActive ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:text-blue-800' : ''}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right Side - User Button & Mobile Menu */}
          <div className="flex items-center gap-2">
            <UserButton afterSignOutUrl="/" />
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  );
}