'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GeneratedPrompt } from '@/types';
import { formatDate, copyToClipboard } from '@/lib/utils';
import { getFormattedPrompt } from '@/lib/promptBuilder';
import { getAllTemplates } from '@/lib/modelTemplates';
import { 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Download,
  Share2,
  BarChart3,
  Wand2,
  RefreshCw,
  Star,
  TrendingUp,
  Zap
} from 'lucide-react';

interface ModernPromptCardProps {
  prompt: GeneratedPrompt;
  onPromptUpdate?: (updatedPrompt: GeneratedPrompt) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
}

// Animation variants for the card
const cardVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Action button reveal animation
const actionVariants = {
  initial: { opacity: 0, scale: 0.8, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: 10,
    transition: {
      duration: 0.15,
      ease: 'easeIn'
    }
  }
};

// Shimmer effect for hover
const shimmerVariants = {
  animate: {
    x: ['-100%', '100%'],
    transition: {
      duration: 1.5,
      ease: 'easeInOut'
    }
  }
};

export function ModernPromptCard({ 
  prompt, 
  onPromptUpdate, 
  className = '',
  variant = 'default',
  showActions = true
}: ModernPromptCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState('stable-diffusion-3.5');
  const [showDetails, setShowDetails] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const templates = getAllTemplates();
  const currentTemplate = templates.find(t => t.id === selectedModel);

  const handleCopy = async (text: string, label: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const handleShare = async () => {
    const shareText = getFormattedPrompt(prompt, selectedModel);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Prompt',
          text: shareText,
        });
      } catch (error) {
        await navigator.clipboard.writeText(shareText);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const handleExport = () => {
    const exportData = {
      id: prompt.id,
      scaffold: prompt.scaffold,
      formattedOutputs: prompt.formattedOutputs,
      metadata: prompt.metadata,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-${prompt.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      // Simulate regeneration
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In real implementation, this would call the API
    } finally {
      setIsRegenerating(false);
    }
  };

  const getCompletionStats = () => {
    const filledSlots = prompt.scaffold.filter(slot => slot.content.trim());
    const totalSlots = prompt.scaffold.length;
    const percentage = Math.round((filledSlots.length / totalSlots) * 100);
    
    return {
      filled: filledSlots.length,
      total: totalSlots,
      percentage,
    };
  };

  const getQualityScore = () => {
    const stats = getCompletionStats();
    const wordCount = prompt.rawText.split(' ').length;
    const baseScore = stats.percentage;
    const wordBonus = Math.min(wordCount / 50 * 10, 20); // Up to 20% bonus for word count
    return Math.min(Math.round(baseScore + wordBonus), 100);
  };

  const stats = getCompletionStats();
  const qualityScore = getQualityScore();

  if (variant === 'compact') {
    return (
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        className={className}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card className="relative overflow-hidden bg-gradient-to-br from-white to-blue-50/30 border-blue-200/50">
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            variants={shimmerVariants}
            animate={isHovered ? "animate" : ""}
          />
          
          <CardContent className="p-4 relative z-10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: isHovered ? 360 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </motion.div>
                <span className="text-sm font-semibold text-gray-800">
                  Prompt v{prompt.metadata.version}
                </span>
              </div>
              <Badge 
                variant={stats.percentage === 100 ? 'default' : 'secondary'}
                className="bg-blue-100 text-blue-700 border-blue-200"
              >
                {stats.percentage}%
              </Badge>
            </div>
            
            <p className="text-xs text-gray-600 line-clamp-2 mb-3">
              {prompt.rawText}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatDate(prompt.metadata.createdAt)}
              </span>
              <div className="flex gap-1">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleCopy(prompt.rawText, 'compact-prompt')}
                  >
                    {copiedText === 'compact-prompt' ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      className={className}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 border-blue-200/50 shadow-lg">
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
          animate={{
            backgroundPosition: isHovered ? ['0px 0px', '20px 20px'] : '0px 0px'
          }}
          transition={{ duration: 2, ease: 'linear', repeat: isHovered ? Infinity : 0 }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          variants={shimmerVariants}
          animate={isHovered ? "animate" : ""}
        />

        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  rotate: isHovered ? [0, 360] : 0,
                  scale: isHovered ? [1, 1.2, 1] : 1
                }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                  <Wand2 className="h-5 w-5 text-white" />
                </div>
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">AI Generated Prompt</h3>
                <p className="text-sm text-gray-600">Version {prompt.metadata.version}</p>
              </div>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Badge 
                  variant={stats.percentage === 100 ? 'default' : 'secondary'}
                  className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stats.percentage}% Complete
                </Badge>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Badge 
                  variant="outline"
                  className={`${
                    qualityScore >= 80 ? 'bg-green-50 text-green-700 border-green-200' :
                    qualityScore >= 60 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  <Star className="h-3 w-3 mr-1" />
                  Quality: {qualityScore}%
                </Badge>
              </motion.div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative z-10 space-y-4">
          {/* Prompt Preview */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-lg p-4 border border-gray-200/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Raw Prompt</span>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopy(prompt.rawText, 'raw-prompt')}
                >
                  <AnimatePresence mode="wait">
                    {copiedText === 'raw-prompt' ? (
                      <motion.div
                        key="check"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                      >
                        <Copy className="h-3 w-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">
              {prompt.rawText}
            </p>
          </div>

          {/* Scaffold Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Scaffold Progress</span>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  <motion.div
                    animate={{ rotate: showDetails ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </motion.div>
                </Button>
              </motion.div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${stats.percentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            
            {/* Scaffold slots overview */}
            <div className="grid grid-cols-7 gap-1">
              {prompt.scaffold.map((slot, index) => (
                <motion.div
                  key={slot.key}
                  className={`h-2 rounded-full ${
                    slot.content.trim() 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                      : 'bg-gray-200'
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

          {/* Detailed scaffold view */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {prompt.scaffold.map((slot, index) => (
                  <motion.div
                    key={slot.key}
                    className="flex items-center gap-3 p-2 rounded-lg bg-white/50 hover:bg-white/80 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Badge 
                      variant="secondary" 
                      className="text-xs min-w-[2rem] justify-center bg-blue-100 text-blue-700"
                    >
                      {slot.key}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium text-gray-700">{slot.name}</span>
                      <p className="text-xs text-gray-600 truncate">
                        {slot.content.trim() || 'Not specified'}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${
                      slot.content.trim() ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Slots Filled', value: stats.filled, icon: BarChart3, color: 'blue' },
              { label: 'Word Count', value: prompt.rawText.split(' ').length, icon: Zap, color: 'purple' },
              { label: 'Quality Score', value: `${qualityScore}%`, icon: Star, color: 'green' },
              { label: 'Model Formats', value: Object.keys(prompt.formattedOutputs).length, icon: TrendingUp, color: 'orange' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className={`text-center p-3 rounded-lg bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100/50 border border-${stat.color}-200/50`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
              >
                <motion.div
                  animate={{ rotate: isHovered ? 360 : 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <stat.icon className={`h-4 w-4 mx-auto mb-1 text-${stat.color}-600`} />
                </motion.div>
                <div className={`text-lg font-bold text-${stat.color}-700`}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          {showActions && (
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  className="flex items-center justify-between pt-4 border-t border-gray-200/50"
                  variants={actionVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <div className="flex gap-2">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isRegenerating ? 'animate-spin' : ''}`} />
                        {isRegenerating ? 'Regenerating...' : 'Regenerate'}
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="hover:bg-green-50 hover:border-green-300"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </motion.div>
                  </div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExport}
                      className="hover:bg-purple-50 hover:border-purple-300"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200/50">
            <span>Created: {formatDate(prompt.metadata.createdAt)}</span>
            <span>ID: {prompt.id.slice(0, 8)}...</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}