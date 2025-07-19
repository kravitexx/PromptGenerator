'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useDrivePersistence } from '@/hooks/useDrivePersistence';
import { 
  Cloud, 
  CloudOff, 
  Download, 
  Upload, 
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  Archive,
  Settings
} from 'lucide-react';

interface DriveStatusProps {
  className?: string;
  showDetails?: boolean;
}

export function DriveStatus({ className, showDetails = false }: DriveStatusProps) {
  const {
    isLoading,
    hasAccess,
    lastSaved,
    error,
    data,
    checkAccess,
    loadData,
    createBackup,
    clearError
  } = useDrivePersistence();

  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [backupFileName, setBackupFileName] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    limit: number;
    available: number;
  } | null>(null);

  // Load storage info when component mounts
  useEffect(() => {
    if (hasAccess) {
      loadStorageInfo();
    }
  }, [hasAccess]);

  const loadStorageInfo = async () => {
    try {
      const response = await fetch('/api/drive/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'storageInfo' })
      });
      
      const result = await response.json();
      if (result.success && result.storageInfo) {
        setStorageInfo(result.storageInfo);
      }
    } catch (error) {
      console.error('Failed to load storage info:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const fileName = await createBackup();
      setBackupFileName(fileName);
      setShowBackupDialog(true);
    } catch (error) {
      console.error('Backup failed:', error);
    }
  };

  const handleRefresh = async () => {
    await checkAccess();
    if (hasAccess) {
      await loadData();
      await loadStorageInfo();
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    } else if (error) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (hasAccess) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else {
      return <CloudOff className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking...';
    if (error) return 'Error';
    if (hasAccess) return 'Connected';
    return 'Not Connected';
  };

  const getStatusColor = () => {
    if (error) return 'text-red-600 bg-red-50 border-red-200';
    if (hasAccess) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (!showDetails) {
    // Compact status indicator
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {getStatusIcon()}
        <span className="text-sm text-gray-600">
          Drive: {getStatusText()}
        </span>
        {lastSaved && (
          <span className="text-xs text-gray-500">
            Saved {new Date(lastSaved).toLocaleTimeString()}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cloud className="h-5 w-5 text-blue-600" />
              Google Drive Status
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                <span className="font-medium">{getStatusText()}</span>
              </div>
              {hasAccess && (
                <Badge variant="default" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
            {error && (
              <div className="mt-2">
                <p className="text-sm">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="mt-1 h-6 px-2 text-xs"
                >
                  Dismiss
                </Button>
              </div>
            )}
          </div>

          {/* Storage Information */}
          {hasAccess && storageInfo && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <HardDrive className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Storage Usage</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Used:</span>
                    <span>{formatBytes(storageInfo.used)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Available:</span>
                    <span>{formatBytes(storageInfo.available)}</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(storageInfo.used / storageInfo.limit) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Summary */}
          {hasAccess && data && (
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-700">
                  {data.chats?.length || 0}
                </div>
                <div className="text-xs text-gray-600">Chat Messages</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-700">
                  {data.customFormats?.length || 0}
                </div>
                <div className="text-xs text-gray-600">Custom Formats</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded">
                <div className="text-lg font-bold text-gray-700">
                  {lastSaved ? '✓' : '—'}
                </div>
                <div className="text-xs text-gray-600">Last Saved</div>
              </div>
            </div>
          )}

          {/* Actions */}
          {hasAccess && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadData()}
                disabled={isLoading}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-1" />
                Load Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateBackup}
                disabled={isLoading}
                className="flex-1"
              >
                <Archive className="h-4 w-4 mr-1" />
                Create Backup
              </Button>
            </div>
          )}

          {/* Last Saved Info */}
          {lastSaved && (
            <div className="text-xs text-gray-500 text-center">
              Last saved: {new Date(lastSaved).toLocaleString()}
            </div>
          )}

          {/* No Access Message */}
          {!hasAccess && !isLoading && (
            <div className="text-center py-4 text-gray-500">
              <CloudOff className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Google Drive not connected</p>
              <p className="text-xs mt-1 mb-3">
                Connect Google Drive to enable data persistence
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Import and show the auth component
                  import('@/components/DriveAuthButton').then(({ DriveAuthButton }) => {
                    // This would typically be handled by a modal or redirect
                    window.location.href = '/drive-setup';
                  });
                }}
              >
                <Cloud className="h-4 w-4 mr-1" />
                Connect Drive
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Success Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-green-600" />
              Backup Created Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Your data has been backed up to Google Drive.
            </p>
            {backupFileName && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600 mb-1">Backup file:</p>
                <p className="text-sm font-mono">{backupFileName}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowBackupDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}