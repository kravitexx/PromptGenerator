'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { GeneratedPrompt, ScaffoldSlot } from '@/types';
import { getEmptySlots, getFilledSlots } from '@/lib/scaffold';
import { calculatePromptQuality } from '@/lib/promptBuilder';
import { 
  CheckCircle, 
  AlertCircle, 
  Edit3, 
  Eye,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

interface ScaffoldDisplayProps {
  prompt: GeneratedPrompt;
  onScaffoldUpdate?: (updatedScaffold: ScaffoldSlot[]) => void;
  editable?: boolean;
  className?: string;
}

export function ScaffoldDisplay({ 
  prompt, 
  onScaffoldUpdate, 
  editable = false,
  className 
}: ScaffoldDisplayProps) {
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showQualityAnalysis, setShowQualityAnalysis] = useState(false);

  const filledSlots = getFilledSlots(prompt.scaffold);
  const emptySlots = getEmptySlots(prompt.scaffold);
  const qualityAnalysis = calculatePromptQuality(prompt);

  const handleEditSlot = (slotKey: string, currentContent: string) => {
    setEditingSlot(slotKey);
    setEditValues({ ...editValues, [slotKey]: currentContent });
  };

  const handleSaveSlot = (slotKey: string) => {
    if (!onScaffoldUpdate) return;

    const updatedScaffold = prompt.scaffold.map(slot => 
      slot.key === slotKey 
        ? { ...slot, content: editValues[slotKey] || '' }
        : slot
    );

    onScaffoldUpdate(updatedScaffold);
    setEditingSlot(null);
  };

  const handleCancelEdit = () => {
    setEditingSlot(null);
    setEditValues({});
  };

  const getSlotColor = (slot: ScaffoldSlot): string => {
    if (!slot.content.trim()) return 'border-gray-200 bg-gray-50';
    return 'border-green-200 bg-green-50';
  };

  const getSlotIcon = (slot: ScaffoldSlot) => {
    if (!slot.content.trim()) {
      return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Prompt Scaffold Structure
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={filledSlots.length === 7 ? 'default' : 'secondary'}>
              {filledSlots.length}/7 Complete
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQualityAnalysis(!showQualityAnalysis)}
            >
              <BarChart3 className="h-4 w-4 mr-1" />
              Quality: {qualityAnalysis.score}%
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quality Analysis */}
        {showQualityAnalysis && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Quality Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Score:</span>
                  <span className="font-medium">{qualityAnalysis.score}%</span>
                </div>
                {qualityAnalysis.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Recommendations:</p>
                    <ul className="text-xs space-y-1">
                      {qualityAnalysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-600">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scaffold Slots */}
        <div className="grid gap-3">
          {prompt.scaffold.map((slot) => (
            <Card key={slot.key} className={`${getSlotColor(slot)} transition-colors`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSlotIcon(slot)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-mono">
                          {slot.key}
                        </Badge>
                        <span className="font-medium text-sm">{slot.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{slot.description}</p>
                    </div>
                  </div>
                  {editable && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditSlot(slot.key, slot.content)}
                      disabled={editingSlot === slot.key}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                {editingSlot === slot.key ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editValues[slot.key] || ''}
                      onChange={(e) => setEditValues({ 
                        ...editValues, 
                        [slot.key]: e.target.value 
                      })}
                      placeholder={`Enter ${slot.name.toLowerCase()} details...`}
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveSlot(slot.key)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    {slot.content.trim() ? (
                      <p className="text-sm bg-white p-2 rounded border">
                        {slot.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No content added yet
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty Slots Warning */}
        {emptySlots.length > 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Incomplete Scaffold
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {emptySlots.length} slot{emptySlots.length > 1 ? 's' : ''} need content: {' '}
                    {emptySlots.map(slot => slot.name).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scaffold Legend */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-2">Scaffold Structure Guide</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>S</strong> - Subject: Main focus or object in the image</p>
              <p><strong>C</strong> - Context: Setting, environment, background</p>
              <p><strong>St</strong> - Style: Art style, medium, visual approach</p>
              <p><strong>Co</strong> - Composition: Camera angle, framing</p>
              <p><strong>L</strong> - Lighting: Lighting conditions and mood</p>
              <p><strong>A</strong> - Atmosphere: Emotional tone and feeling</p>
              <p><strong>Q</strong> - Quality: Technical specifications and quality</p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}