'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { GeneratedPrompt, TokenComparison } from '@/types';
import { ImageDropZone } from '@/components/ImageDropZone';
import { analyzeImage } from '@/lib/api';
import { useApiKey } from '@/hooks/useApiKey';
import { 
  Camera, 
  Eye, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  X,
  Upload,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface ImageFeedbackAnalyzerProps {
  prompt: GeneratedPrompt;
  onFeedbackReceived?: (feedback: ImageAnalysisFeedback) => void;
  className?: string;
}

interface ImageAnalysisFeedback {
  description: string;
  tokenComparison: TokenComparison[];
  suggestions: string[];
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
}

export function ImageFeedbackAnalyzer({ 
  prompt, 
  onFeedbackReceived, 
  className 
}: ImageFeedbackAnalyzerProps) {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<ImageAnalysisFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { hasValidKey } = useApiKey();

  const handleImageUpload = (images: string[]) => {
    setUploadedImages(images);
  };

  const handleAnalyzeImage = async () => {
    if (!uploadedImages.length || !hasValidKey) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Use the first uploaded image for analysis
      const imageBase64 = uploadedImages[0];
      
      // Analyze the image using the API
      const result = await analyzeImage(imageBase64, prompt.rawText) as {
        description: string;
        tokenComparison: TokenComparison[];
        suggestions: string[];
        overallScore?: number;
        strengths?: string[];
        weaknesses?: string[];
      };

      // Process the analysis result into structured feedback
      const processedFeedback = processAnalysisResult(result, prompt);
      
      setFeedback(processedFeedback);
      onFeedbackReceived?.(processedFeedback);
      setShowUploadDialog(false);
      
    } catch (err) {
      console.error('Image analysis failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processAnalysisResult = (
    result: { 
      description: string; 
      tokenComparison: TokenComparison[]; 
      suggestions: string[];
      overallScore?: number;
      strengths?: string[];
      weaknesses?: string[];
    },
    originalPrompt: GeneratedPrompt
  ): ImageAnalysisFeedback => {
    // Use provided scores or calculate fallback
    const overallScore = result.overallScore ?? (() => {
      const totalTokens = originalPrompt.scaffold.filter(slot => slot.content.trim()).length;
      const matchedTokens = result.tokenComparison.filter(token => token.present).length;
      return totalTokens > 0 ? Math.round((matchedTokens / totalTokens) * 100) : 0;
    })();

    // Use provided strengths/weaknesses or generate fallback
    const strengths = result.strengths ?? (() => {
      const generated: string[] = [];
      result.tokenComparison.forEach(token => {
        if (token.present && token.confidence > 0.7) {
          generated.push(`${token.token} is well represented`);
        }
      });
      if (overallScore >= 80) {
        generated.push('Overall prompt execution is excellent');
      } else if (overallScore >= 60) {
        generated.push('Good overall prompt execution');
      }
      return generated;
    })();

    const weaknesses = result.weaknesses ?? (() => {
      const generated: string[] = [];
      result.tokenComparison.forEach(token => {
        if (!token.present || token.confidence < 0.5) {
          generated.push(`${token.token} is missing or unclear`);
        }
      });
      if (overallScore < 60) {
        generated.push('Significant gaps between prompt and generated image');
      }
      return generated;
    })();

    return {
      description: result.description,
      tokenComparison: result.tokenComparison,
      suggestions: result.suggestions,
      overallScore,
      strengths,
      weaknesses
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTokenStatusIcon = (token: TokenComparison) => {
    if (token.present && token.confidence > 0.7) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (token.present && token.confidence > 0.4) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <X className="h-4 w-4 text-red-500" />;
    }
  };

  if (!hasValidKey) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">API Key Required</h3>
          <p className="text-gray-600">
            Please configure your Gemini API key to use image feedback analysis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600" />
              Image Feedback Analysis
            </div>
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-1" />
              Analyze Generated Image
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!feedback ? (
            <div className="text-center py-8 text-gray-500">
              <Camera className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No Analysis Yet</p>
              <p className="text-sm mb-4">
                Upload a generated image to see how well it matches your prompt
              </p>
              <Button onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-1" />
                Upload Image for Analysis
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score */}
              <Card className={`${getScoreColor(feedback.overallScore)} border`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Overall Match Score</h3>
                      <p className="text-sm opacity-80">
                        How well the image matches your prompt
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold">{feedback.overallScore}%</div>
                      <div className="text-sm">
                        {feedback.overallScore >= 80 ? 'Excellent' : 
                         feedback.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Image Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    AI Image Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{feedback.description}</p>
                </CardContent>
              </Card>

              {/* Token Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Prompt Element Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {feedback.tokenComparison.map((token, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          {getTokenStatusIcon(token)}
                          <div>
                            <div className="font-medium text-sm">{token.token}</div>
                            {token.suggestion && (
                              <div className="text-xs text-gray-600">{token.suggestion}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={token.present ? 'default' : 'secondary'}>
                            {token.present ? 'Present' : 'Missing'}
                          </Badge>
                          <div className="text-xs text-gray-600 mt-1">
                            {Math.round(token.confidence * 100)}% confidence
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Strengths and Weaknesses */}
              <div className="grid md:grid-cols-2 gap-4">
                {feedback.strengths.length > 0 && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-green-800 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Strengths
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1">
                        {feedback.strengths.map((strength, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {feedback.weaknesses.length > 0 && (
                  <Card className="bg-red-50 border-red-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-red-800 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Areas for Improvement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-1">
                        {feedback.weaknesses.map((weakness, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Suggestions */}
              {feedback.suggestions.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm text-blue-800 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Improvement Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feedback.suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                          <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUploadDialog(true)}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Analyze Another Image
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setFeedback(null)}
                >
                  Clear Analysis
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Upload Generated Image for Analysis
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Upload an image generated from your prompt to see how well it matches your intended result.
            </p>
            
            <ImageDropZone
              onImagesChange={handleImageUpload}
              maxImages={1}
              disabled={isAnalyzing}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <AlertTriangle className="h-4 w-4 inline mr-2" />
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAnalyzeImage}
              disabled={!uploadedImages.length || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Analyze Image
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}