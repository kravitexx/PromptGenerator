'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { CustomFormat } from '@/types';
import { FormatWizard } from '@/components/FormatWizard';
import { useCustomFormatsPersistence } from '@/hooks/useDrivePersistence';
import { 
  validateCustomFormat,
  exportCustomFormats,
  importCustomFormats,
  searchCustomFormats
} from '@/lib/customFormats';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Download, 
  Upload, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Settings,
  Eye
} from 'lucide-react';

interface CustomFormatManagerProps {
  onFormatSelect?: (format: CustomFormat) => void;
  selectedFormatId?: string;
  className?: string;
}

export function CustomFormatManager({ 
  onFormatSelect, 
  selectedFormatId, 
  className 
}: CustomFormatManagerProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [editingFormat, setEditingFormat] = useState<CustomFormat | undefined>();
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');

  const { 
    formats: customFormats, 
    addFormat, 
    updateFormat, 
    deleteFormat,
    isLoading 
  } = useCustomFormatsPersistence();

  const handleCreateNew = () => {
    setEditingFormat(undefined);
    setShowWizard(true);
  };

  const handleEdit = (format: CustomFormat) => {
    setEditingFormat(format);
    setShowWizard(true);
  };

  const handleSaveFormat = async (format: CustomFormat) => {
    try {
      if (editingFormat) {
        await updateFormat(format.id, format);
      } else {
        await addFormat(format);
      }
      setShowWizard(false);
      setEditingFormat(undefined);
    } catch (error) {
      console.error('Failed to save format:', error);
    }
  };

  const handleDelete = async (formatId: string) => {
    try {
      await deleteFormat(formatId);
      setShowDeleteDialog(null);
    } catch (error) {
      console.error('Failed to delete format:', error);
    }
  };

  const handleDuplicate = async (formatId: string) => {
    try {
      const originalFormat = customFormats.find(f => f.id === formatId);
      if (originalFormat) {
        const duplicatedFormat: CustomFormat = {
          ...originalFormat,
          id: crypto.randomUUID(),
          name: `${originalFormat.name} (Copy)`
        };
        await addFormat(duplicatedFormat);
      }
    } catch (error) {
      console.error('Failed to duplicate format:', error);
    }
  };

  const handleExport = () => {
    const jsonData = exportCustomFormats();
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-formats.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      // Parse and validate the import data manually
      const data = JSON.parse(importData);
      if (!Array.isArray(data)) {
        alert('Import failed: Expected an array of custom formats');
        return;
      }

      let imported = 0;
      const errors: string[] = [];

      data.forEach((format, index) => {
        try {
          if (!format.id || !format.name || !format.template) {
            errors.push(`Format ${index + 1}: Missing required fields`);
            return;
          }

          // Add the format
          addFormat(format);
          imported++;
        } catch (err) {
          errors.push(`Format ${index + 1}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      });

      setShowImportDialog(false);
      setImportData('');
      
      if (imported > 0) {
        alert(`Successfully imported ${imported} format(s)${errors.length > 0 ? ` with ${errors.length} errors` : ''}`);
      } else {
        alert(`Import failed: ${errors.join(', ')}`);
      }
    } catch {
      alert('Import failed: Invalid JSON format');
    }
  };

  const filteredFormats = searchQuery 
    ? searchCustomFormats(searchQuery)
    : customFormats;

  const getFormatValidation = (format: CustomFormat) => {
    return validateCustomFormat(format.template);
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Custom Formats
              <Badge variant="secondary" className="text-xs">
                {customFormats.length}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExport} disabled={customFormats.length === 0}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
                <Upload className="h-4 w-4 mr-1" />
                Import
              </Button>
              <Button size="sm" onClick={handleCreateNew}>
                <Plus className="h-4 w-4 mr-1" />
                Create New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search custom formats..."
              className="pl-10"
            />
          </div>

          {/* Format List */}
          {filteredFormats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? (
                <p>No formats found matching &quot;{searchQuery}&quot;</p>
              ) : (
                <div>
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium mb-2">No Custom Formats</p>
                  <p className="text-sm mb-4">Create your first custom format to get started</p>
                  <Button onClick={handleCreateNew}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Custom Format
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFormats.map((format) => {
                const validation = getFormatValidation(format);
                const isSelected = selectedFormatId === format.id;
                
                return (
                  <Card 
                    key={format.id} 
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onFormatSelect?.(format)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-sm truncate">{format.name}</h4>
                            {validation.isValid ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            {isSelected && (
                              <Badge variant="default" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                          
                          <div className="text-xs font-mono text-gray-600 bg-gray-100 p-2 rounded mb-2 truncate">
                            {format.template}
                          </div>
                          
                          {!validation.isValid && (
                            <div className="text-xs text-red-600 mb-2">
                              {validation.errors.join(', ')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Show preview or details
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(format);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(format.id);
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteDialog(format.id);
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Format Wizard */}
      <FormatWizard
        isOpen={showWizard}
        onClose={() => {
          setShowWizard(false);
          setEditingFormat(undefined);
        }}
        onSave={handleSaveFormat}
        existingFormat={editingFormat}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Custom Format</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this custom format? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => showDeleteDialog && handleDelete(showDeleteDialog)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Custom Formats</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Paste the JSON data of custom formats to import:
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON data here..."
              className="w-full h-32 p-2 border rounded text-sm font-mono"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={!importData.trim()}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}