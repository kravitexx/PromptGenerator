'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  EyeOff,
  BarChart3,
  Sparkles,
  Target,
  Palette,
  Camera,
  Sun,
  Heart,
  Award,
  Save,
  X,
  TrendingUp,
  Zap
} from 'lucide-react';

interface ModernScaffoldDisplayProps {
  prompt: GeneratedPrompt;
  onScaffoldUpdate?: (updatedScaffold: ScaffoldSlot[]) => void;
  editable?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'interactive';
}

// Animation variants
const containerVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const slotVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    y: -2,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

const progressVariants = {
  initial: { width: 0 },
  animate: (percentage: number) => ({
    width: `${percentage}%`,
    transition: {
      duration: 1.5,
      ease: 'easeOut'
    }
  })
};

// Slot icons mapping
const getSlotIcon = (key: string) => {
  const iconMap: Record<string, React.ComponentType<any>> = {
    'S': Target,      // Subject
    'C': Palette,     // Context
    'St': Sparkles,   // Style
    'Co': Camera,     // Composition
    'L': Sun,         // Lighting
    'A': Heart,       // Atmosphere
    'Q': Award        // Quality
  };
  return iconMap[key] || Sparkles;
};

// Color schemes for different slots
const getSlotColors = (key: string, filled: boolean) => {
  const colorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
    'S': {
      bg: filled ? 'bg-gradient-to-br from-red-50 to-red-100' : 'bg-gray-50',
      border: filled ? 'border-red-200' : 'border-gray-200',
      text: filled ? 'text-red-700' : 'text-gray-500',
      icon: filled ? 'text-red-600' : 'text-gray-400'
    },
    'C': {
      bg: filled ? 'bg-gradient-to-br from-blue-50 to-blue-100' : 'bg-gray-50',
      border: filled ? 'border-blue-200' : 'border-gray-200',
      text: filled ? 'text-blue-700' : 'text-gray-500',
      icon: filled ? 'text-blue-600' : 'text-gray-400'
    },
    'St': {
      bg: filled ? 'bg-gradient-to-br from-purple-50 to-purple-100' : 'bg-gray-50',
      border: filled ? 'border-purple-200' : 'border-gray-200',
      text: filled ? 'text-purple-700' : 'text-gray-500',
      icon: filled ? 'text-purple-600' : 'text-gray-400'
    },
    'Co': {
      bg: filled ? 'bg-gradient-to-br from-green-50 to-green-100' : 'bg-gray-50',
      border: filled ? 'border-green-200' : 'border-gray-200',
      text: filled ? 'text-green-700' : 'text-gray-500',
      icon: filled ? 'text-green-600' : 'text-gray-400'
    },
    'L': {
      bg: filled ? 'bg-gradient-to-br from-yellow-50 to-yellow-100' : 'bg-gray-50',
      border: filled ? 'border-yellow-200' : 'border-gray-200',
      text: filled ? 'text-yellow-700' : 'text-gray-500',
      icon: filled ? 'text-yellow-600' : 'text-gray-400'
    },
    'A': {
      bg: filled ? 'bg-gradient-to-br from-pink-50 to-pink-100' : 'bg-gray-50',
      border: filled ? 'border-pink-200' : 'border-gray-200',
      text: filled ? 'text-pink-700' : 'text-gray-500',
      icon: filled ? 'text-pink-600' : 'text-gray-400'
    },
    'Q': {
      bg: filled ? 'bg-gradient-to-br from-indigo-50 to-indigo-100' : 'bg-gray-50',
      border: filled ? 'border-indigo-200' : 'border-gray-200',
      text: filled ? 'text-indigo-700' : 'text-gray-500',
      icon: filled ? 'text-indigo-600' : 'text-gray-400'
    }
  };
  return colorMap[key] || colorMap['S'];
};

export function ModernScaffoldDisplay({ 
  prompt, 
  onScaffoldUpdate, 
  editable = false,
  className = '',
  variant = 'default'
}: ModernScaffoldDisplayProps) {
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [showQualityAnalysis, setShowQualityAnalysis] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const filledSlots = getFilledSlots(prompt.scaffold);
  const emptySlots = getEmptySlots(prompt.scaffold);
  const qualityAnalysis = calculatePromptQuality(prompt);
  const completionPercentage = Math.round((filledSlots.length / prompt.scaffold.length) * 100);

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

  if (variant === 'compact') {
    return (
      <motion.div
        className={`space-y-3 ${className}`}
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Compact progress bar */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Scaffold Progress</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              variants={progressVariants}
              custom={completionPercentage}
              initial="initial"
              animate="animate"
            />
          </div>
          <Badge variant="secondary" className="text-xs">
            {completionPercentage}%
          </Badge>
        </div>

        {/* Compact slot indicators */}
        <div className="grid grid-cols-7 gap-2">
          {prompt.scaffold.map((slot, index) => {
            const colors = getSlotColors(slot.key, !!slot.content.trim());
            const IconComponent = getSlotIcon(slot.key);
            
            return (
              <motion.div
                key={slot.key}
                className={`aspect-square rounded-lg ${colors.bg} ${colors.border} border-2 flex items-center justify-center cursor-pointer`}
                variants={slotVariants}
                whileHover="hover"
                title={`${slot.name}: ${slot.content.trim() ? 'Filled' : 'Empty'}`}
              >
                <IconComponent className={`h-4 w-4 ${colors.icon}`} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <Card className="overflow-hidden bg-gradient-to-br from-white to-blue-50/30 border-blue-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <Eye className="h-5 w-5 text-white" />
                </div>
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Prompt Scaffold</h3>
                <p className="text-sm text-gray-600">Interactive structure visualization</p>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Badge 
                  variant={completionPercentage === 100 ? 'default' : 'secondary'}
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {filledSlots.length}/{prompt.scaffold.length} Complete
                </Badge>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQualityAnalysis(!showQualityAnalysis)}
                  className="hover:bg-blue-50 hover:border-blue-300"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Quality: {qualityAnalysis.score}%
                </Button>
              </motion.div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress visualization */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Completion Progress</span>
              <span className="text-sm text-gray-600">{completionPercentage}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-sm"
                variants={progressVariants}
                custom={completionPercentage}
                initial="initial"
                animate="animate"
              />
            </div>
            
            {/* Mini slot indicators */}
            <div className="grid grid-cols-7 gap-1">
              {prompt.scaffold.map((slot, index) => (
                <motion.div
                  key={slot.key}
                  className={`h-2 rounded-full ${
                    slot.content.trim() 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gray-300'
                  }`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.2, y: -2 }}
                  title={`${slot.name}: ${slot.content.trim() ? 'Filled' : 'Empty'}`}
                />
              ))}
            </div>
          </div>

          {/* Quality Analysis */}
          <AnimatePresence>
            {showQualityAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <h4 className="font-semibold text-gray-800">Quality Analysis</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Overall Score:</span>
                        <Badge variant="outline" className="bg-white">
                          {qualityAnalysis.score}%
                        </Badge>
                      </div>
                      
                      {qualityAnalysis.recommendations.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Recommendations:</p>
                          <ul className="space-y-1">
                            {qualityAnalysis.recommendations.map((rec, index) => (
                              <motion.li
                                key={index}
                                className="flex items-start gap-2 text-xs text-gray-600"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                              >
                                <span className="text-blue-600 mt-1">•</span>
                                <span>{rec}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Scaffold Slots */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Scaffold Structure
            </h4>
            
            <div className="grid gap-3">
              {prompt.scaffold.map((slot, index) => {
                const colors = getSlotColors(slot.key, !!slot.content.trim());
                const IconComponent = getSlotIcon(slot.key);
                const isEditing = editingSlot === slot.key;
                const isHovered = hoveredSlot === slot.key;
                
                return (
                  <motion.div
                    key={slot.key}
                    variants={slotVariants}
                    whileHover="hover"
                    onHoverStart={() => setHoveredSlot(slot.key)}
                    onHoverEnd={() => setHoveredSlot(null)}
                  >
                    <Card className={`${colors.bg} ${colors.border} border-2 transition-all duration-200 ${
                      isHovered ? 'shadow-lg' : 'shadow-sm'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <motion.div
                              animate={{ 
                                rotate: isHovered ? 360 : 0,
                                scale: isHovered ? 1.1 : 1
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className={`w-8 h-8 rounded-lg ${colors.bg} ${colors.border} border flex items-center justify-center`}>
                                <IconComponent className={`h-4 w-4 ${colors.icon}`} />
                              </div>
                            </motion.div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs font-mono bg-white">
                                  {slot.key}
                                </Badge>
                                <span className={`font-semibold text-sm ${colors.text}`}>
                                  {slot.name}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600">{slot.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {slot.content.trim() ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                            )}
                            
                            {editable && (
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditSlot(slot.key, slot.content)}
                                  disabled={isEditing}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                              </motion.div>
                            )}
                          </div>
                        </div>

                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div
                              key="editing"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="space-y-3"
                            >
                              <Textarea
                                value={editValues[slot.key] || ''}
                                onChange={(e) => setEditValues({ 
                                  ...editValues, 
                                  [slot.key]: e.target.value 
                                })}
                                placeholder={`Enter ${slot.name.toLowerCase()} details...`}
                                className="min-h-[80px] bg-white/80 border-gray-300 focus:border-blue-500"
                              />
                              <div className="flex gap-2">
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveSlot(slot.key)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Save
                                  </Button>
                                </motion.div>
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                  </Button>
                                </motion.div>
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="content"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              {slot.content.trim() ? (
                                <div className="bg-white/80 p-3 rounded-lg border border-gray-200/50">
                                  <p className="text-sm text-gray-800 leading-relaxed">
                                    {slot.content}
                                  </p>
                                </div>
                              ) : (
                                <div className="bg-white/50 p-3 rounded-lg border border-dashed border-gray-300">
                                  <p className="text-sm text-gray-500 italic">
                                    No content added yet - click edit to add details
                                  </p>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Empty Slots Warning */}
          <AnimatePresence>
            {emptySlots.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-800 mb-1">
                          Incomplete Scaffold Structure
                        </p>
                        <p className="text-xs text-yellow-700">
                          {emptySlots.length} slot{emptySlots.length > 1 ? 's' : ''} still need content: {' '}
                          <span className="font-medium">
                            {emptySlots.map(slot => slot.name).join(', ')}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}