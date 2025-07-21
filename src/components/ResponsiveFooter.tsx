'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Github, 
  Twitter, 
  Heart,
  Sparkles
} from 'lucide-react';

interface ResponsiveFooterProps {
  className?: string;
}

export function ResponsiveFooter({ className = '' }: ResponsiveFooterProps) {
  return (
    <footer className={`w-full border-t bg-white/80 backdrop-blur-md py-6 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-2">
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
              className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md"
            >
              <Sparkles className="h-3 w-3 text-white" />
            </motion.div>
            <span className="text-sm text-gray-600">
              © {new Date().getFullYear()} Prompt Generator. All rights reserved.
            </span>
          </div>

          {/* Links - Responsive Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 text-center sm:text-left">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Product</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/" className="text-gray-600 hover:text-blue-600 transition-colors">Home</Link></li>
                <li><Link href="/chat" className="text-gray-600 hover:text-blue-600 transition-colors">Chat</Link></li>
                <li><Link href="/formats" className="text-gray-600 hover:text-blue-600 transition-colors">Formats</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Resources</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/docs" className="text-gray-600 hover:text-blue-600 transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="text-gray-600 hover:text-blue-600 transition-colors">API</Link></li>
                <li><Link href="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Company</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="text-gray-600 hover:text-blue-600 transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Legal</h3>
              <ul className="space-y-1 text-sm">
                <li><Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Terms</Link></li>
                <li><Link href="/support" className="text-gray-600 hover:text-blue-600 transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Links & Made with Love */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
              <Link href="https://github.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="text-gray-600 hover:text-blue-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>Made with</span>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Heart className="h-4 w-4 text-red-500 fill-current" />
              </motion.div>
              <span>by developers</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}