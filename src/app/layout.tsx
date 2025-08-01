import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DataCleaner } from '@/components/DataCleaner';
import { PageTransition } from '@/components/PageTransition';
import { RouteTransition } from '@/components/RouteTransition';
import { FloatingApiKeyTrigger } from '@/components/FloatingApiKeyTrigger';
import { ResponsiveHeader } from '@/components/ResponsiveHeader';
import { ResponsiveFooter } from '@/components/ResponsiveFooter';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false, // Only preload if needed
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export const metadata: Metadata = {
  title: "AI Prompt Generator",
  description: "AI-powered text-to-image prompt generator with universal scaffold support for Stable Diffusion, Midjourney, DALL·E, and more",
  keywords: ["AI", "prompt generator", "image generation", "Stable Diffusion", "Midjourney", "DALL-E"],
  authors: [{ name: "AI Prompt Generator Team" }],
  creator: "AI Prompt Generator",
  publisher: "AI Prompt Generator",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'AI Prompt Generator',
    description: 'Create perfect prompts for AI image generation with our universal scaffold system',
    siteName: 'AI Prompt Generator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Prompt Generator',
    description: 'Create perfect prompts for AI image generation',
  },

};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#000000",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Preconnect to external domains */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://api.openai.com" />
          <link rel="preconnect" href="https://generativelanguage.googleapis.com" />

          {/* DNS prefetch for performance */}
          <link rel="dns-prefetch" href="https://clerk.com" />
          <link rel="dns-prefetch" href="https://www.googleapis.com" />

          {/* Preload critical resources */}
          <link
            rel="preload"
            href="/fonts/geist-sans.woff2"
            as="font"
            type="font/woff2"
            crossOrigin="anonymous"
          />

          {/* Performance hints */}
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />

          {/* Security headers */}
          <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
          <meta httpEquiv="X-Frame-Options" content="DENY" />
          <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white font-sans`}
          suppressHydrationWarning
        >
          <ErrorBoundary>
            <DataCleaner />
            {children}
          </ErrorBoundary>
          <Toaster />

          {/* Performance monitoring and optimization script */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Initialize performance monitoring and optimizations
                if (typeof window !== 'undefined') {
                  // Report Core Web Vitals
                  function reportWebVitals(metric) {
                    if (typeof gtag !== 'undefined') {
                      gtag('event', metric.name, {
                        event_category: 'Web Vitals',
                        value: Math.round(metric.value),
                        non_interaction: true,
                      });
                    }
                  }
                  
                  // Monitor memory usage
                  if ('memory' in performance) {
                    setInterval(() => {
                      const memory = performance.memory;
                      if (memory.usedJSHeapSize / memory.totalJSHeapSize > 0.9) {
                        console.warn('High memory usage detected');
                      }
                    }, 30000);
                  }
                  
                  // Initialize performance optimizations
                  window.addEventListener('load', () => {
                    // Remove debug code in production
                    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                      console.log = () => {};
                      console.debug = () => {};
                      console.info = () => {};
                    }
                    
                    // Optimize images
                    const images = document.querySelectorAll('img');
                    images.forEach(img => {
                      if (!img.hasAttribute('loading')) img.loading = 'lazy';
                      if (!img.hasAttribute('decoding')) img.decoding = 'async';
                    });
                    
                    // Preload critical resources
                    const criticalResources = [
                      { href: '/fonts/geist-sans.woff2', as: 'font', type: 'font/woff2' }
                    ];
                    
                    criticalResources.forEach(resource => {
                      const link = document.createElement('link');
                      link.rel = 'preload';
                      link.href = resource.href;
                      link.as = resource.as;
                      if (resource.type) link.type = resource.type;
                      link.crossOrigin = 'anonymous';
                      document.head.appendChild(link);
                    });
                  });
                }
              `,
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
