/**
 * Performance monitoring dashboard for development and debugging
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PerformanceMonitor, 
  MemoryMonitor, 
  NetworkMonitor, 
  WebVitalsMonitor,
  PerformanceOptimizer,
  type PerformanceMetrics 
} from '@/lib/performance';
import { 
  Activity, 
  Zap, 
  Globe, 
  Memory, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface PerformanceDashboardProps {
  className?: string;
  showInProduction?: boolean;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  className,
  showInProduction = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [webVitals, setWebVitals] = useState<any>({});
  const [memoryUsage, setMemoryUsage] = useState<any>(null);
  const [networkStats, setNetworkStats] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Don't show in production unless explicitly enabled
  const shouldShow = process.env.NODE_ENV === 'development' || showInProduction;

  const refreshData = useCallback(() => {
    const monitor = PerformanceMonitor.getInstance();
    setMetrics(monitor.getMetrics());
    setWebVitals(WebVitalsMonitor.getVitals());
    setMemoryUsage(MemoryMonitor.getCurrentUsage());
    setNetworkStats(NetworkMonitor.getRequests());
    setRecommendations(PerformanceOptimizer.analyzeAndRecommend());
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    // Initial data load
    refreshData();

    // Set up periodic refresh
    const interval = setInterval(refreshData, 5000);

    // Set up performance observer
    const monitor = PerformanceMonitor.getInstance();
    const observer = (metric: PerformanceMetrics) => {
      setMetrics(prev => [...prev.slice(-19), metric]); // Keep last 20 metrics
    };
    monitor.addObserver(observer);

    return () => {
      clearInterval(interval);
      monitor.removeObserver(observer);
    };
  }, [shouldShow, refreshData]);

  if (!shouldShow) return null;

  const getVitalStatus = (name: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      FID: { good: 100, poor: 300 },
      CLS: { good: 0.1, poor: 0.25 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[name];
    if (!threshold) return 'unknown';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className={className}>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Activity className="h-4 w-4 mr-2" />
        Performance
      </Button>

      {/* Dashboard Modal */}
      {isVisible && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Dashboard
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={refreshData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsVisible(false)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <Tabs defaultValue="vitals" className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
                  <TabsTrigger value="metrics">Metrics</TabsTrigger>
                  <TabsTrigger value="memory">Memory</TabsTrigger>
                  <TabsTrigger value="network">Network</TabsTrigger>
                  <TabsTrigger value="recommendations">Tips</TabsTrigger>
                </TabsList>

                {/* Web Vitals Tab */}
                <TabsContent value="vitals" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(webVitals).map(([name, value]) => {
                      const status = getVitalStatus(name, value as number);
                      return (
                        <Card key={name}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium">{name}</p>
                                <p className="text-2xl font-bold">
                                  {formatDuration(value as number)}
                                </p>
                              </div>
                              {getStatusIcon(status)}
                            </div>
                            <Badge 
                              variant={status === 'good' ? 'default' : status === 'needs-improvement' ? 'secondary' : 'destructive'}
                              className="mt-2"
                            >
                              {status.replace('-', ' ')}
                            </Badge>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Performance Metrics Tab */}
                <TabsContent value="metrics" className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Recent Operations
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {metrics.slice(-10).reverse().map((metric, index) => (
                        <Card key={index}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{metric.name}</p>
                                {metric.metadata && (
                                  <p className="text-sm text-gray-500">
                                    {JSON.stringify(metric.metadata)}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  {formatDuration(metric.duration || 0)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(metric.startTime).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Memory Tab */}
                <TabsContent value="memory" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Memory className="h-5 w-5" />
                          Current Usage
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {memoryUsage ? (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Used:</span>
                              <span className="font-bold">
                                {formatBytes(memoryUsage.used)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Total:</span>
                              <span className="font-bold">
                                {formatBytes(memoryUsage.total)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Usage:</span>
                              <span className="font-bold">
                                {memoryUsage.percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  memoryUsage.percentage > 80 
                                    ? 'bg-red-500' 
                                    : memoryUsage.percentage > 60 
                                    ? 'bg-yellow-500' 
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${memoryUsage.percentage}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">Memory info not available</p>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Memory Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {MemoryMonitor.getMeasurements().slice(-5).map((measurement, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>
                                {new Date(measurement.timestamp).toLocaleTimeString()}
                              </span>
                              <span>
                                {formatBytes(measurement.used)} / {formatBytes(measurement.total)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Network Tab */}
                <TabsContent value="network" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Network Requests
                      </h3>
                      <div className="text-sm text-gray-500">
                        Avg: {formatDuration(NetworkMonitor.getAverageResponseTime())}
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {networkStats.slice(-10).reverse().map((request, index) => (
                        <Card key={index}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {request.method} {request.url}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge 
                                    variant={
                                      request.status < 300 ? 'default' :
                                      request.status < 400 ? 'secondary' :
                                      'destructive'
                                    }
                                  >
                                    {request.status}
                                  </Badge>
                                  {request.size && (
                                    <span className="text-xs text-gray-500">
                                      {formatBytes(request.size)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  {formatDuration(request.duration || 0)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Recommendations
                    </h3>
                    
                    {recommendations.length > 0 ? (
                      <div className="space-y-2">
                        {recommendations.map((recommendation, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                                <p className="text-sm">{recommendation}</p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <Card>
                        <CardContent className="p-4 text-center">
                          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            No performance issues detected. Great job!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};