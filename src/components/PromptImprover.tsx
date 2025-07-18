'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GeneratedPrompt } from '@/types';
import { ClarifyModal } from '@/components/ClarifyModal';
import { 
  analyzePromptForImprovement, 
  applyQuestionAnswersToPrompt,
  calculateImprovementPotential 
} from '@/lib/promptAnalysis';
import { updateGeneratedPrompt } from '@/lib/promptBuilder';
import { 
  HelpCircle, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb,
  Target
} from 'lucide-react';

interface PromptImproverProps {
  prompt: GeneratedPrompt;
  onPromptUpdate: (updatedPrompt: GeneratedPrompt) => void;
  className?: string;
}

export function PromptImprover({ 
  prompt, 
  onPromptUpdate, 
  className 
}: PromptImproverProps) {
  const [showClarifyModal, setShowClarifyModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analysis = analyzePromptForImprovement(prompt);
  const improvementPotential = calculateImprovementPotential(prompt);

  const handleOpenClarifyModal = () => {
    setShowClarifyModal(true);
  };

  const handleAnswersSubmit = async (answers: Record<string, unknown>) => {
    setIsAnalyzing(true);
    try {
      // Apply answers to scaffold
      const updatedScaffold = applyQuestionAnswersToPrompt(prompt, answers);
      
      // Create updated prompt
      const updatedPrompt = updateGeneratedPrompt(prompt, updatedScaffold);
      
      // Notify parent component
      onPromptUpdate(updatedPrompt);
      
    } catch (error) {
      console.error('Failed to apply question answers:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <TrendingUp className="h-4 w-4" />;
      case 'low': return <CheckCircle className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Prompt Improvement
            </div>
            <Badge 
              variant="outline" 
              className={`${getPriorityColor(improvementPotential.priority)} border`}
            >
              {getPriorityIcon(improvementPotential.priority)}
              <span className="ml-1 capitalize">{improvementPotential.priority} Priority</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quality Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analysis.qualityScore}%
              </div>
              <div className="text-sm text-gray-600">Current Quality</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                +{improvementPotential.score}%
              </div>
              <div className="text-sm text-gray-600">Potential Gain</div>
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="space-y-3">
            {analysis.missingSlots.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Missing Components
                  </p>
                  <p className="text-xs text-red-700">
                    {analysis.missingSlots.join(', ')} need to be added
                  </p>
                </div>
              </div>
            )}

            {analysis.weakSlots.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <TrendingUp className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Weak Components
                  </p>
                  <p className="text-xs text-yellow-700">
                    {analysis.weakSlots.join(', ')} could be more detailed
                  </p>
                </div>
              </div>
            )}

            {analysis.qualityScore >= 75 && analysis.missingSlots.length === 0 && analysis.weakSlots.length === 0 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Great Prompt!
                  </p>
                  <p className="text-xs text-green-700">
                    Your prompt is well-structured. Minor refinements available.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Improvement Areas */}
          {improvementPotential.areas.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Top Improvement Areas:</h4>
              <div className="space-y-1">
                {improvementPotential.areas.map((area) => (
                  <div key={area} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    {area}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Recommendations:</h4>
              <div className="space-y-1">
                {analysis.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-gray-600">
                    <Lightbulb className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleOpenClarifyModal}
              disabled={isAnalyzing || analysis.suggestedQuestions.length === 0}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Applying Changes...
                </>
              ) : (
                <>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Answer {analysis.suggestedQuestions.length} Questions to Improve
                </>
              )}
            </Button>
            
            {analysis.suggestedQuestions.length === 0 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                No improvement questions available at this time
              </p>
            )}
          </div>

          {/* Question Preview */}
          {analysis.suggestedQuestions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Preview Questions:
              </h4>
              <div className="space-y-1">
                {analysis.suggestedQuestions.slice(0, 3).map((question, index) => (
                  <div key={question.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <Badge variant="outline" className="text-xs">
                      {question.category}
                    </Badge>
                    <span className="truncate">{question.question}</span>
                  </div>
                ))}
                {analysis.suggestedQuestions.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{analysis.suggestedQuestions.length - 3} more questions
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clarifying Questions Modal */}
      <ClarifyModal
        isOpen={showClarifyModal}
        onClose={() => setShowClarifyModal(false)}
        questions={analysis.suggestedQuestions}
        onAnswersSubmit={handleAnswersSubmit}
        title="Improve Your Prompt"
        description={`Answer these ${analysis.suggestedQuestions.length} questions to enhance your prompt quality.`}
      />
    </div>
  );
}