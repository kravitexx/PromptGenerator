'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrowserInfo, 
  initializeBrowserCompatibility,
  getBrowserSpecificConfig,
  checkCompatibilityWarnings
} from '@/utils/browserCompatibility';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface CrossBrowserContextType {
  browserInfo: BrowserInfo | null;
  config: any;
  isSupported: boolean;
  warnings: string[];
}

const CrossBrowserContext = createContext<CrossBrowserContextType>({
  browserInfo: null,
  config: {},
  isSupported: true,
  warnings: []
});

export function useCrossBrowser() {
  const context = useContext(CrossBrowserContext);
  if (!context) {
    throw new Error('useCrossBrowser must be used within CrossBrowserProvider');
  }
  return context;
}

interface CrossBrowserProviderProps {
  children: React.ReactNode;
  showWarnings?: boolean;
  fallbackComponent?: React.ComponentType<{ browserInfo: BrowserInfo }>;
}

export function CrossBrowserProvider({ 
  children, 
  showWarnings = true,
  fallbackComponent: FallbackComponent
}: CrossBrowserProviderProps) {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
  const [config, setConfig] = useState({});
  const [warnings, setWarnings] = useState<string[]>([]);
  const [showWarningBanner, setShowWarningBanner] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initBrowser = async () => {
      try {
        const info = initializeBrowserCompatibility();
        const browserConfig = getBrowserSpecificConfig(info);
        const compatibilityWarnings = checkCompatibilityWarnings(info);

        setBrowserInfo(info);
        setConfig(browserConfig);
        setWarnings(compatibilityWarnings);
        setShowWarningBanner(compatibilityWarnings.length > 0 && showWarnings);
        setIsInitialized(true);

        // Store browser info in sessionStorage for debugging
        if (process.env.NODE_ENV === 'development') {
          sessionStorage.setItem('browserInfo', JSON.stringify(info));
        }
      } catch (error) {
        console.error('Failed to initialize browser compatibility:', error);
        setIsInitialized(true);
      }
    };

    initBrowser();
  }, [showWarnings]);

  // Check if browser is supported
  const isSupported = browserInfo ? (
    (browserInfo.name === 'Chrome' && parseInt(browserInfo.version) >= 70) ||
    (browserInfo.name === 'Firefox' && parseInt(browserInfo.version) >= 70) ||
    (browserInfo.name === 'Safari' && parseInt(browserInfo.version) >= 12) ||
    (browserInfo.name === 'Edge' && parseInt(browserInfo.version) >= 79)
  ) : true;

  // Show fallback for unsupported browsers
  if (browserInfo && !isSupported && FallbackComponent) {
    return <FallbackComponent browserInfo={browserInfo} />;
  }

  const contextValue: CrossBrowserContextType = {
    browserInfo,
    config,
    isSupported,
    warnings
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <CrossBrowserContext.Provider value={contextValue}>
      {/* Browser compatibility warning banner */}
      <AnimatePresence>
        {showWarningBanner && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200"
          >
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">
                      Browser Compatibility Notice
                    </p>
                    <p className="text-xs text-yellow-700">
                      {warnings[0]} Some features may not work as expected.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open('https://browsehappy.com/', '_blank')}
                    className="text-yellow-700 hover:text-yellow-800"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Update Browser
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowWarningBanner(false)}
                    className="text-yellow-700 hover:text-yellow-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with browser-specific adjustments */}
      <div 
        className={showWarningBanner ? 'pt-16' : ''}
        style={{
          '--animation-duration': `${config.animationDuration || 0.3}s`,
          '--stagger-delay': `${config.staggerDelay || 0.1}s`
        } as React.CSSProperties}
      >
        {children}
      </div>

      {/* Development browser info panel */}
      {process.env.NODE_ENV === 'development' && (
        <BrowserInfoPanel browserInfo={browserInfo} config={config} />
      )}
    </CrossBrowserContext.Provider>
  );
}

// Development browser info panel
function BrowserInfoPanel({ 
  browserInfo, 
  config 
}: { 
  browserInfo: BrowserInfo | null;
  config: any;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!browserInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white shadow-lg"
      >
        Browser Info
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-12 right-0 w-80"
          >
            <Card className="shadow-xl">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Browser Information</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {browserInfo.name}
                    </div>
                    <div>
                      <span className="font-medium">Version:</span> {browserInfo.version}
                    </div>
                    <div>
                      <span className="font-medium">Engine:</span> {browserInfo.engine}
                    </div>
                    <div>
                      <span className="font-medium">Platform:</span> {browserInfo.platform}
                    </div>
                    <div>
                      <span className="font-medium">Mobile:</span> {browserInfo.isMobile ? 'Yes' : 'No'}
                    </div>
                    <div>
                      <span className="font-medium">Tablet:</span> {browserInfo.isTablet ? 'Yes' : 'No'}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Feature Support</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      {Object.entries(browserInfo.supports).map(([feature, supported]) => (
                        <div key={feature} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${supported ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className={supported ? 'text-green-700' : 'text-red-700'}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Performance Config</h4>
                    <div className="text-xs space-y-1">
                      <div>Animation Duration: {config.animationDuration}s</div>
                      <div>Stagger Delay: {config.staggerDelay}s</div>
                      <div>Max Animations: {config.maxConcurrentAnimations}</div>
                      <div>Blur Effects: {config.enableBlur ? 'Enabled' : 'Disabled'}</div>
                      <div>Shadows: {config.enableShadows ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fallback component for unsupported browsers
export function UnsupportedBrowserFallback({ browserInfo }: { browserInfo: BrowserInfo }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Browser Not Supported</h1>
          <p className="text-gray-600 mb-4">
            Your browser ({browserInfo.name} {browserInfo.version}) is not fully supported. 
            For the best experience, please update to a newer version or use a different browser.
          </p>
          
          <div className="space-y-2 mb-6">
            <h3 className="font-semibold">Recommended Browsers:</h3>
            <ul className="text-sm text-gray-600">
              <li>Chrome 70+</li>
              <li>Firefox 70+</li>
              <li>Safari 12+</li>
              <li>Edge 79+</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => window.open('https://browsehappy.com/', '_blank')}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Update Browser
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex-1"
            >
              Continue Anyway
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}